import { MongoClient, Db } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not defined in .env");
}

const client = new MongoClient(uri);

let database: Db;

export async function connectDB(): Promise<Db> {
  if (database) {
    return database;
  }

  await client.connect();

  database = client.db("studiospace");

  console.log("MongoDB connected successfully");

  return database;
}