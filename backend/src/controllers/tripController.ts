import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";

// DRIVER starts a trip
export const startTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { routeId, busId } = req.body;
    const driverId = req.userId as string;

    const trip = await prisma.trip.create({
      data: {
        routeId,
        busId,
        driverId,
        status: "ACTIVE",
        startedAt: new Date(),
      },
    });

    res.status(201).json(trip);
  } catch (error) {
    console.error("Start trip error:", error);
    res.status(500).json({ error: "Failed to start trip." });
  }
};

// DRIVER ends a trip
export const endTrip = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const trip = await prisma.trip.update({
      where: { id },
      data: { status: "COMPLETED", endedAt: new Date() },
    });
    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: "Failed to end trip." });
  }
};

// Get all currently active trips (for passenger live map / admin dashboard)
export const getActiveTrips = async (req: AuthRequest, res: Response) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { status: "ACTIVE" },
      include: { route: true, bus: true, driver: true },
    });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch active trips." });
  }
};

// Get a single trip's latest GPS location
export const getTripLocation = async (req: AuthRequest, res: Response) => {
  try {
    const tripId = req.params.tripId as string;
    const latest = await prisma.gPSLocation.findFirst({
      where: { tripId },
      orderBy: { timestamp: "desc" },
    });
    res.json(latest);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trip location." });
  }
};

// Get the logged-in driver's own trip history
export const getMyTrips = async (req: AuthRequest, res: Response) => {
  try {
    const trips = await prisma.trip.findMany({
      where: { driverId: req.userId },
      include: { route: true, bus: true },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trip history." });
  }
};