import { NextRequest, NextResponse } from "next/server";
import * as bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: emailLower },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const userRole = role === "ORGANIZER" ? "ORGANIZER" : "CUSTOMER";

    // Create user and associated tenant if organizer
    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email: emailLower,
          password: hashedPassword,
          role: userRole,
        },
      });

      if (userRole === "ORGANIZER") {
        // Generate a clean slug
        const baseSlug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
        const uniqueSuffix = Math.floor(1000 + Math.random() * 9000);
        const slug = `${baseSlug}-${uniqueSuffix}`;

        // Create Organizer
        const organizer = await tx.organizer.create({
          data: {
            name: `${name}'s Events`,
            slug,
            subdomain: slug,
            description: `Welcome to the official ticketing portal of ${name}.`,
            primaryColor: "#2563eb",
            secondaryColor: "#1e3a8a",
          },
        });

        // Link User to Organizer
        await tx.organizerUser.create({
          data: {
            userId: newUser.id,
            organizerId: organizer.id,
            role: "ADMIN",
          },
        });

        // Create Default SiteSetting
        await tx.siteSetting.create({
          data: {
            organizerId: organizer.id,
            title: `${name}'s Events - Tickets`,
            description: `Buy tickets for events organized by ${name}.`,
            primaryColor: "#2563eb",
            secondaryColor: "#1e3a8a",
          },
        });

        // Create Default subdomain domain entry
        await tx.organizerDomain.create({
          data: {
            organizerId: organizer.id,
            domain: `${slug}.localhost:3000`,
            type: "SUBDOMAIN",
            verified: true
          }
        });
      }

      return newUser;
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: "User registered successfully", user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
