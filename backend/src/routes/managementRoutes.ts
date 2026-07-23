import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware";
import {
  createBus, getBuses, updateBus, deleteBus,
  createRoute, getRoutes, updateRoute, deleteRoute,
  createStop, getStopsByRoute, deleteStop,
  getDrivers, createDriver, deleteDriver, updateDriver,
  createNotification, getNotifications, deleteNotification,
  getMyFavorites, addFavorite, removeFavorite,
} from "../controllers/managementController";

const router = Router();

// Buses — only ADMIN can create/edit/delete, anyone logged in can view
router.post("/buses", authenticate, authorize("ADMIN"), createBus);
router.get("/buses", authenticate, getBuses);
router.put("/buses/:id", authenticate, authorize("ADMIN"), updateBus);
router.delete("/buses/:id", authenticate, authorize("ADMIN"), deleteBus);

// Routes
router.post("/routes", authenticate, authorize("ADMIN"), createRoute);
router.get("/routes", authenticate, getRoutes);
router.put("/routes/:id", authenticate, authorize("ADMIN"), updateRoute);
router.delete("/routes/:id", authenticate, authorize("ADMIN"), deleteRoute);

// Stops
router.post("/stops", authenticate, authorize("ADMIN"), createStop);
router.get("/stops/:routeId", authenticate, getStopsByRoute);
router.delete("/stops/:id", authenticate, authorize("ADMIN"), deleteStop);

// Drivers
router.get("/drivers", authenticate, authorize("ADMIN"), getDrivers);
router.post("/drivers", authenticate, authorize("ADMIN"), createDriver);
router.delete("/drivers/:id", authenticate, authorize("ADMIN"), deleteDriver);
router.put("/drivers/:id", authenticate, authorize("ADMIN"), updateDriver);

// Notifications / Alerts
router.post("/notifications", authenticate, authorize("ADMIN"), createNotification);
router.get("/notifications", authenticate, getNotifications);
router.delete("/notifications/:id", authenticate, authorize("ADMIN"), deleteNotification);

// Favorites
router.get("/favorites", authenticate, getMyFavorites);
router.post("/favorites", authenticate, addFavorite);
router.delete("/favorites/:routeId", authenticate, removeFavorite);
export default router;