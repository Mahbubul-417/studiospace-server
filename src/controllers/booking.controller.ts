import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { connectDB } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export async function createBooking(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const {
      studioId,
      date,
      startTime,
      duration,
    } = req.body;

    if (
      !studioId ||
      !ObjectId.isValid(studioId) ||
      !date ||
      !startTime ||
      !Number.isInteger(duration) ||
      duration < 1 ||
      duration > 12
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide valid booking information",
      });
      return;
    }

    if (!req.user?.id || !req.user.email) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const selectedDate = new Date(`${date}T00:00:00.000Z`);

    if (
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate.toISOString().slice(0, 10) !== date
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid booking date",
      });
      return;
    }

    const timeMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(
      startTime
    );

    if (!timeMatch) {
      res.status(400).json({
        success: false,
        message: "Invalid start time",
      });
      return;
    }

    const startMinutes =
      Number(timeMatch[1]) * 60 + Number(timeMatch[2]);

    const endMinutes = startMinutes + duration * 60;

    if (endMinutes > 24 * 60) {
      res.status(400).json({
        success: false,
        message: "Booking cannot extend beyond midnight",
      });
      return;
    }

    const formatTime = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;

      return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
    };

    const endTime = formatTime(endMinutes);
    const db = await connectDB();

    const studio = await db.collection("studios").findOne({
      _id: new ObjectId(studioId),
    });

    if (!studio) {
      res.status(404).json({
        success: false,
        message: "Studio not found",
      });
      return;
    }

    if (studio.hostId === req.user.id) {
      res.status(400).json({
        success: false,
        message: "You cannot book your own studio",
      });
      return;
    }

    const existingBooking = await db.collection("bookings").findOne({
      studioId,
      date,
      status: "Confirmed",
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (existingBooking) {
      res.status(409).json({
        success: false,
        message: "This time slot is already booked",
      });
      return;
    }

    const booking = {
      studioId,
      studioTitle: studio.title,
      studioImage: studio.image,
      hostId: studio.hostId,
      hostEmail: studio.hostEmail,
      userId: req.user.id,
      userEmail: req.user.email,
      date,
      startTime,
      endTime,
      duration,
      totalPrice: Number(studio.price) * duration,
      status: "Pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("bookings").insertOne(booking);

    res.status(201).json({
      success: true,
      message: "Booking request submitted successfully",
      data: {
        ...booking,
        _id: result.insertedId,
      },
    });
  } catch (error) {
    console.error("Create booking error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create booking",
    });
  }
}

export async function getMyBookings(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const db = await connectDB();

    const bookings = await db
      .collection("bookings")
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Get my bookings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load bookings",
    });
  }
}

export async function getHostBookings(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const db = await connectDB();

    const bookings = await db
      .collection("bookings")
      .find({ hostId: req.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("Get host bookings error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load host bookings",
    });
  }
}

export async function updateBookingStatus(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const  id  = req.params.id;
    const { status } = req.body;

   if (typeof id !== "string") {
  res.status(400).json({
    success: false,
    message: "Invalid booking ID",
  });
  return;
}

    if (!["Confirmed", "Cancelled", "Completed"].includes(status)) {
      res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
      return;
    }

    if (!req.user?.id) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const db = await connectDB();
    const bookings = db.collection("bookings");

    const booking = await bookings.findOne({
      _id: new ObjectId(id),
      hostId: req.user.id,
    });

    if (!booking) {
      res.status(404).json({
        success: false,
        message: "Booking not found",
      });
      return;
    }

    if (booking.status !== "Pending") {
      res.status(400).json({
        success: false,
        message: "Only pending bookings can be updated",
      });
      return;
    }

    if (status === "Confirmed") {
      const conflict = await bookings.findOne({
        _id: { $ne: booking._id },
        studioId: booking.studioId,
        date: booking.date,
        status: "Confirmed",
        startTime: { $lt: booking.endTime },
        endTime: { $gt: booking.startTime },
      });

      if (conflict) {
        res.status(409).json({
          success: false,
          message: "This time slot conflicts with another confirmed booking",
        });
        return;
      }
    }

    await bookings.updateOne(
      {
        _id: booking._id,
        hostId: req.user.id,
        status: "Pending",
      },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      }
    );

    res.status(200).json({
      success: true,
      message: `Booking ${status.toLowerCase()} successfully`,
    });
  } catch (error) {
    console.error("Update booking status error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update booking",
    });
  }
}