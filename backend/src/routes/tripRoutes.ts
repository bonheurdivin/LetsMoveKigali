import { Router } from "express";
import { authenticate, authorize } from "../middlewares/authMiddleware";
import { startTrip, endTrip, getActiveTrips, getTripLocation, getMyTrips } from "../controllers/tripController";

const router = Router();

router.post("/start", authenticate, authorize("DRIVER"), startTrip);
router.put("/:id/end", authenticate, authorize("DRIVER"), endTrip);
router.get("/active", authenticate, getActiveTrips);
router.get("/:tripId/location", authenticate, getTripLocation);
router.get("/my-trips", authenticate, authorize("DRIVER"), getMyTrips);

export default router;