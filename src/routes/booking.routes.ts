
import { Router } from "express";
import {
  createBooking,
  getMyBookings,
  getHostBookings,
  updateBookingStatus,
  cancelBooking,
} from "../controllers/booking.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = Router();

router.use(verifyToken);

router.post("/", createBooking);
router.get("/my-bookings", getMyBookings);
router.get("/host-bookings", getHostBookings);
router.patch("/:id/cancel", cancelBooking);
router.patch("/:id/status", updateBookingStatus);

export default router;
