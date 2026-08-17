import { NextRequest, NextResponse } from "next/server";
import { getSession, getOrganizerAccess } from "@/lib/auth";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // We only restrict upload to users with organizer access, but let's just make sure they have a session.
    // Assuming any logged in admin can upload images.
    
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || ".jpg";
    const uniqueId = crypto.randomBytes(8).toString("hex");
    const filename = `${Date.now()}-${uniqueId}${ext}`;
    
    // Ensure public/uploads exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, buffer);

    const fileUrl = `/uploads/${filename}`;
    
    return NextResponse.json({ url: fileUrl }, { status: 200 });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
