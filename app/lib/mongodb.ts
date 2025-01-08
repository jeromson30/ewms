import { MongoClient } from "mongodb";
<<<<<<< HEAD

const client = new MongoClient('mongodb://localhost:27017/ewms?authSource=admin');
=======
console.log(process.env.MONGODB_URI)

const client = new MongoClient(process.env.MONGODB_URI!);
>>>>>>> 43d5b57f99f79504d1c8e28428ae3bd3c656c251

const clientPromise = client.connect();

export default clientPromise;