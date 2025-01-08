"user server"
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
