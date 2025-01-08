"user server"
<<<<<<< HEAD
import { NextApiResponse } from "next";
import { NextResponse, type NextRequest } from 'next/server'
//import Login from '../../models/Users';
import clientPromise from "@/app/lib/mongodb";

export async function POST(req: NextRequest) {
    let data = await req.json();
    const client = await clientPromise;
    const db = client.db();
    const results = await db.collection("users").findOne({login: data.login})
    if(results === null){
      return NextResponse.json({success: false},{status: 404})
    }
    return NextResponse.json({success: true, data: results},{status: 200})
}
=======
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

>>>>>>> 43d5b57f99f79504d1c8e28428ae3bd3c656c251
