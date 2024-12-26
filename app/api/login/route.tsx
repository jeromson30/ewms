"user server"
import { NextRequest, NextResponse } from "next/server";
//import Login from '../../models/Users';
import clientPromise from "@/app/lib/mongodb";

const Signup = { login: "jeromson@gmail.com", password: "123456" }

// Handles GET requests to /api
export async function GET(req: NextRequest, res:NextResponse) {
  try {
    const client = await clientPromise;
    const db = client.db();
    await db
          .collection("users")
          .insertOne(Signup);
  return NextResponse.json({ message: Signup});
  
  } catch (error) {
    console.log(error);
    return {message: 'error creating todo'};
  }
}

// Handles POST requests to /api
export async function POST(req: NextRequest) {
  // ...
  return NextResponse.json({ message: "Ta race" });
}

