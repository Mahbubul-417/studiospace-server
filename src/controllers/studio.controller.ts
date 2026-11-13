import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { connectDB } from "../config/db.js";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export async function getStudios(req: Request, res: Response) {
  try {
    const db = await connectDB();
    const { category, search, featured } = req.query;

    const filter: Record<string, unknown> = {};

    if (category) filter.category = category;

    if (search) {
      filter.title = {
        $regex: String(search),
        $options: "i",
      };
    }

    let query = db.collection("studios").find(filter);

    if (featured === "true") {
      query = query.limit(6);
    }

    const studios = await query.sort({ createdAt: -1 }).toArray();

    res.status(200).json({
      success: true,
      count: studios.length,
      data: studios,
    });
  } catch (error) {
    console.error("Get studios error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch studios",
    });
  }
}

export async function getStudioById(req: Request, res: Response) {
  try {
    const id = String(req.params.id);

    if (!ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid studio ID",
      });
      return;
    }

    const db = await connectDB();
    const studio = await db.collection("studios").findOne({
      _id: new ObjectId(id),
    });

    if (!studio) {
      res.status(404).json({
        success: false,
        message: "Studio not found",
      });
      return;
    }

    res.status(200).json({ success: true, data: studio });
  } catch (error) {
    console.error("Get studio error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch studio",
    });
  }
}

export async function createStudio(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const {
      title,
      category,
      description,
      location,
      price,
      deposit,
      capacity,
      image,
      amenities,
    } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof category !== "string" ||
      !category.trim() ||
      typeof description !== "string" ||
      !description.trim() ||
      typeof location !== "string" ||
      !location.trim() ||
      typeof image !== "string" ||
      !image.trim() ||
      price === undefined ||
      deposit === undefined ||
      capacity === undefined ||
      !Array.isArray(amenities)
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide all required studio information",
      });
      return;
    }

    if (
      typeof price !== "number" ||
      typeof deposit !== "number" ||
      typeof capacity !== "number" ||
      !Number.isFinite(price) ||
      !Number.isFinite(deposit) ||
      !Number.isInteger(capacity) ||
      price <= 0 ||
      deposit < 0 ||
      capacity <= 0 ||
      !amenities.every(
        (item: unknown) => typeof item === "string" && item.trim()
      )
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid studio information",
      });
      return;
    }

    if (!req.user?.id || !req.user.email) {
      res.status(401).json({
        success: false,
        message: "Authenticated user information is missing",
      });
      return;
    }

    const db = await connectDB();
    const now = new Date();

    const studio = {
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      location: location.trim(),
      price,
      deposit,
      capacity,
      image: image.trim(),
      amenities: amenities.map((item: string) => item.trim()),
      hostEmail: req.user.email,
      hostId: req.user.id,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("studios").insertOne(studio);

    res.status(201).json({
      success: true,
      message: "Studio created successfully",
      data: {
        _id: result.insertedId,
        ...studio,
      },
    });
  } catch (error) {
    console.error("Create studio error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create studio",
    });
  }
}

export async function getMyListings(
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

    const studios = await db
      .collection("studios")
      .find({ hostId: req.user.id })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({
      success: true,
      count: studios.length,
      data: studios,
    });
  } catch (error) {
    console.error("Get my listings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your listings",
    });
  }
}

export async function updateStudio(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const id = String(req.params.id);

    if (!ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid studio ID",
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

    const {
      title,
      category,
      description,
      location,
      price,
      deposit,
      capacity,
      image,
      amenities,
    } = req.body;

    const updates: Record<string, unknown> = {};

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        res.status(400).json({
          success: false,
          message: "Invalid studio title",
        });
        return;
      }
      updates.title = title.trim();
    }

    if (category !== undefined) {
      if (typeof category !== "string" || !category.trim()) {
        res.status(400).json({
          success: false,
          message: "Invalid studio category",
        });
        return;
      }
      updates.category = category.trim();
    }

    if (description !== undefined) {
      if (typeof description !== "string" || !description.trim()) {
        res.status(400).json({
          success: false,
          message: "Invalid studio description",
        });
        return;
      }
      updates.description = description.trim();
    }

    if (location !== undefined) {
      if (typeof location !== "string" || !location.trim()) {
        res.status(400).json({
          success: false,
          message: "Invalid studio location",
        });
        return;
      }
      updates.location = location.trim();
    }

    if (image !== undefined) {
      if (typeof image !== "string" || !image.trim()) {
        res.status(400).json({
          success: false,
          message: "Invalid studio image",
        });
        return;
      }
      updates.image = image.trim();
    }

    if (price !== undefined) {
      if (
        typeof price !== "number" ||
        !Number.isFinite(price) ||
        price <= 0
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid price",
        });
        return;
      }
      updates.price = price;
    }

    if (deposit !== undefined) {
      if (
        typeof deposit !== "number" ||
        !Number.isFinite(deposit) ||
        deposit < 0
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid deposit",
        });
        return;
      }
      updates.deposit = deposit;
    }

    if (capacity !== undefined) {
      if (
        typeof capacity !== "number" ||
        !Number.isInteger(capacity) ||
        capacity <= 0
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid capacity",
        });
        return;
      }
      updates.capacity = capacity;
    }

    if (amenities !== undefined) {
      if (
        !Array.isArray(amenities) ||
        !amenities.every(
          (item: unknown) =>
            typeof item === "string" && item.trim()
        )
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid amenities",
        });
        return;
      }

      updates.amenities = amenities.map((item: string) =>
        item.trim()
      );
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({
        success: false,
        message: "Please provide information to update",
      });
      return;
    }

    updates.updatedAt = new Date();

    const db = await connectDB();

    const result = await db.collection("studios").findOneAndUpdate(
      {
        _id: new ObjectId(id),
        hostId: req.user.id,
      },
      {
        $set: updates,
      },
      {
        returnDocument: "after",
      }
    );

    if (!result) {
      res.status(404).json({
        success: false,
        message: "Studio not found or you do not own this studio",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Studio updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Update studio error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update studio",
    });
  }
}

export async function deleteStudio(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const id = String(req.params.id);

    if (!ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid studio ID",
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

    const result = await db.collection("studios").deleteOne({
      _id: new ObjectId(id),
      hostId: req.user.id,
    });

    if (result.deletedCount === 0) {
      res.status(404).json({
        success: false,
        message: "Studio not found or you do not own this studio",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Studio deleted successfully",
    });
  } catch (error) {
    console.error("Delete studio error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete studio",
    });
  }
}