import { Request, Response } from "express";
import prisma from "../config/prisma";

// ===== BUSES =====

export const createBus = async (req: Request, res: Response) => {
  try {
    const { busNumber, plateNumber, fuelType, routeId } = req.body;
    const bus = await prisma.bus.create({
      data: { busNumber, plateNumber, fuelType, routeId },
    });
    res.status(201).json(bus);
  } catch (error) {
    console.error("Create bus error:", error);
    res.status(500).json({ error: "Failed to create bus." });
  }
};

export const getBuses = async (req: Request, res: Response) => {
  try {
    const buses = await prisma.bus.findMany({ include: { route: true } });
    res.json(buses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch buses." });
  }
};

export const updateBus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const bus = await prisma.bus.update({ where: { id }, data: req.body });
    res.json(bus);
  } catch (error) {
    res.status(500).json({ error: "Failed to update bus." });
  }
};

export const deleteBus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.bus.delete({ where: { id } });
    res.json({ message: "Bus deleted." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete bus." });
  }
};

// ===== ROUTES =====

export const createRoute = async (req: Request, res: Response) => {
  try {
    const { name, startPoint, endPoint, stops } = req.body;
    const route = await prisma.route.create({
      data: {
        name,
        startPoint,
        endPoint,
        ...(stops && stops.length > 0
          ? {
              stops: {
                create: stops.map((s: any, index: number) => ({
                  name: s.name,
                  latitude: parseFloat(s.latitude),
                  longitude: parseFloat(s.longitude),
                  order: s.order ?? index + 1,
                })),
              },
            }
          : {}),
      },
      include: { stops: true },
    });
    res.status(201).json(route);
  } catch (error) {
    console.error("Create route error:", error);
    res.status(500).json({ error: "Failed to create route." });
  }
};

export const getRoutes = async (req: Request, res: Response) => {
  try {
    const routes = await prisma.route.findMany({
      include: { stops: { orderBy: { order: "asc" } }, buses: true },
    });
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch routes." });
  }
};

export const updateRoute = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const route = await prisma.route.update({ where: { id }, data: req.body });
    res.json(route);
  } catch (error) {
    res.status(500).json({ error: "Failed to update route." });
  }
};

export const deleteRoute = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.route.delete({ where: { id } });
    res.json({ message: "Route deleted." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete route." });
  }
};

// ===== STOPS =====

export const createStop = async (req: Request, res: Response) => {
  try {
    const { name, latitude, longitude, order, routeId } = req.body;
    const stop = await prisma.stop.create({
      data: {
        name,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        order: parseInt(order, 10),
        routeId,
      },
    });
    res.status(201).json(stop);
  } catch (error) {
    console.error("Create stop error:", error);
    res.status(500).json({ error: "Failed to create stop." });
  }
};

export const getStopsByRoute = async (req: Request, res: Response) => {
  try {
    const routeId = req.params.routeId as string;
    const stops = await prisma.stop.findMany({
      where: { routeId },
      orderBy: { order: "asc" },
    });
    res.json(stops);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stops." });
  }
};

export const deleteStop = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.stop.delete({ where: { id } });
    res.json({ message: "Stop deleted." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete stop." });
  }
};

// ===== DRIVERS (Users with role = DRIVER) =====

import bcrypt from "bcryptjs";

export const getDrivers = async (req: Request, res: Response) => {
  try {
    const drivers = await prisma.user.findMany({
      where: { role: "DRIVER" },
      include: { assignedBus: true },
    });
    // Strip out password before sending to frontend
    const safeDrivers = drivers.map(({ password, ...rest }) => rest);
    res.json(safeDrivers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch drivers." });
  }
};

export const createDriver = async (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password, licenseNumber, busId } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "A user with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password || "changeme123", 10);

    const driver = await prisma.user.create({
      data: { fullName, email, phone, password: hashedPassword, role: "DRIVER", licenseNumber, busId: busId || null },
    });

    res.status(201).json(driver);
  } catch (error) {
    console.error("Create driver error:", error);
    res.status(500).json({ error: "Failed to create driver." });
  }
};

export const deleteDriver = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    await prisma.user.delete({ where: { id } });
    res.json({ message: "Driver deleted." });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete driver." });
  }
};

export const updateDriver = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { fullName, phone, licenseNumber, busId } = req.body;
    const driver = await prisma.user.update({
      where: { id },
      data: { fullName, phone, licenseNumber, busId: busId || null },
    });
    const { password, ...safeDriver } = driver;
    res.json(safeDriver);
  } catch (error) {
    console.error("Update driver error:", error);
    res.status(500).json({ error: "Failed to update driver." });
  }
};