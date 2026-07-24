import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware";
import {
  createBus, getBuses, updateBus, deleteBus,
  createRoute, getRoutes, updateRoute, deleteRoute,
  createStop, getStopsByRoute, getAllStops, updateStop, deleteStop,
  getDrivers, createDriver, deleteDriver, updateDriver,
  createNotification, getNotifications, deleteNotification,
  getMyFavorites, addFavorite, removeFavorite,
  getAllUsers, deleteUser, getAllTrips,
} from "../controllers/managementController";

const router = Router();

// Buses
router.post("/buses", authenticate, authorize("ADMIN"), createBus);
router.get("/buses", authenticate, getBuses);
router.put("/buses/:id", authenticate, authorize("ADMIN"), updateBus);
router.delete("/buses/:id", authenticate, authorize("ADMIN"), deleteBus);

// Routes
router.post("/routes", authenticate, authorize("ADMIN"), createRoute);
router.get("/routes", authenticate, getRoutes);
router.put("/routes/:id", authenticate, authorize("ADMIN"), updateRoute);
router.delete("/routes/:id", authenticate, authorize("ADMIN"), deleteRoute);

// Stops (note: /stops must come before /stops/:routeId)
router.post("/stops", authenticate, authorize("ADMIN"), createStop);
router.get("/stops", authenticate, getAllStops);
router.get("/stops/:routeId", authenticate, getStopsByRoute);
router.put("/stops/:id", authenticate, authorize("ADMIN"), updateStop);
router.delete("/stops/:id", authenticate, authorize("ADMIN"), deleteStop);

// Drivers
router.get("/drivers", authenticate, authorize("ADMIN"), getDrivers);
router.post("/drivers", authenticate, authorize("ADMIN"), createDriver);
router.put("/drivers/:id", authenticate, authorize("ADMIN"), updateDriver);
router.delete("/drivers/:id", authenticate, authorize("ADMIN"), deleteDriver);

// Notifications / Alerts
router.post("/notifications", authenticate, authorize("ADMIN"), createNotification);
router.get("/notifications", authenticate, getNotifications);
router.delete("/notifications/:id", authenticate, authorize("ADMIN"), deleteNotification);

// Favorites
router.get("/favorites", authenticate, getMyFavorites);
router.post("/favorites", authenticate, addFavorite);
router.delete("/favorites/:routeId", authenticate, removeFavorite);

// Users (admin overview)
router.get("/users", authenticate, authorize("ADMIN"), getAllUsers);
router.delete("/users/:id", authenticate, authorize("ADMIN"), deleteUser);

// All trips (admin overview, for reports)
router.get("/trips-all", authenticate, authorize("ADMIN"), getAllTrips);

export default router;