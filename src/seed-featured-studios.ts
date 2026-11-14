
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is missing from .env");
}

const client = new MongoClient(uri);

const featuredStudios = [
  {
    title: "The White Canvas Studio",
    category: "Photography",
    description:
      "A bright and spacious photography studio with professional lighting and a clean creative environment.",
    location: "Dhanmondi, Dhaka",
    price: 2500,
    deposit: 1500,
    capacity: 15,
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1000",
    amenities: ["Natural Lighting", "Air Conditioning", "Changing Room"],
  },
  {
    title: "Sound Garden Studio",
    category: "Music",
    description:
      "A sound-treated music studio for recording, rehearsals, and creative production.",
    location: "Gulshan, Dhaka",
    price: 2000,
    deposit: 1000,
    capacity: 10,
    image:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1000",
    amenities: ["Soundproofing", "Audio Equipment", "Air Conditioning"],
  },
  {
    title: "The Creative Podcast Room",
    category: "Podcast Rooms",
    description:
      "A comfortable podcast recording room equipped for interviews and conversations.",
    location: "Uttara, Dhaka",
    price: 1800,
    deposit: 800,
    capacity: 6,
    image:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1000",
    amenities: ["Microphones", "Soundproofing", "Recording Equipment"],
  },
  {
    title: "Cinematic Space Studio",
    category: "Film Studios",
    description:
      "A versatile production space for video shoots, interviews, and cinematic projects.",
    location: "Banani, Dhaka",
    price: 3500,
    deposit: 2000,
    capacity: 20,
    image:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1000",
    amenities: ["Lighting Equipment", "Green Screen", "Air Conditioning"],
  },
  {
    title: "Art House Workshop",
    category: "Art Workshops",
    description:
      "An inspiring workshop with plenty of room for painting, drawing, and creative activities.",
    location: "Mohammadpur, Dhaka",
    price: 1500,
    deposit: 500,
    capacity: 12,
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1000",
    amenities: ["Natural Lighting", "Work Tables", "Storage"],
  },
  {
    title: "The Music Loft",
    category: "Music",
    description:
      "A modern music space for musicians, composers, and small creative teams.",
    location: "Mirpur, Dhaka",
    price: 2200,
    deposit: 1000,
    capacity: 12,
    image:
      "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=1000",
    amenities: ["Soundproofing", "Audio Equipment", "Seating"],
  },
];

async function seedFeaturedStudios() {
  try {
    await client.connect();

    const db = client.db("studiospace");
    const collection = db.collection("studios");

    const existingStudio = await collection.findOne({
      title: "photo studio",
    });

    if (
      !existingStudio ||
      typeof existingStudio.hostId !== "string" ||
      typeof existingStudio.hostEmail !== "string"
    ) {
      throw new Error(
        "Could not find the host information from your existing photo studio"
      );
    }

    const existingFeatured = await collection
      .find({ featured: true })
      .toArray();

    const existingTitles = new Set(
      existingFeatured.map((studio) => String(studio.title))
    );

    const now = new Date();

    const newStudios = featuredStudios
      .filter((studio) => !existingTitles.has(studio.title))
      .map((studio) => ({
        ...studio,
        featured: true,
        hostId: existingStudio.hostId,
        hostEmail: existingStudio.hostEmail,
        createdAt: now,
        updatedAt: now,
      }));

    if (newStudios.length > 0) {
      await collection.insertMany(newStudios);
    }

    console.log(
      `${newStudios.length} featured studios added successfully.`
    );

    console.log(
      `Total featured studios: ${await collection.countDocuments({
        featured: true,
      })}`
    );
  } catch (error) {
    console.error("Failed to seed featured studios:", error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

void seedFeaturedStudios();
