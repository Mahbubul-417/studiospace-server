import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { connectDB } from "../config/db.js";

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

export async function createStudio(req: Request, res: Response) {
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
      hostName,
      hostEmail,
    } = req.body;

    if (
      !title ||
      !category ||
      !description ||
      !location ||
      !image ||
      !hostName ||
      !hostEmail ||
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
      price <= 0 ||
      deposit < 0 ||
      capacity <= 0
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid price, deposit, or capacity",
      });
      return;
    }

    const db = await connectDB();
    const now = new Date();

    const studio = {
      title,
      category,
      description,
      location,
      price,
      deposit,
      capacity,
      image,
      amenities,
      hostName,
      hostEmail,
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