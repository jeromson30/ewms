import { MongoClient } from "mongodb";

const client = new MongoClient('mongodb://localhost:27017/ewms?authSource=admin');

const clientPromise = client.connect();

export default clientPromise;