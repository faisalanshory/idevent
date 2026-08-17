import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("admin123", 10);
  const orgHash = await bcrypt.hash("organizer123", 10);

  // Superadmin
  await db.user.upsert({
    where: { email: "admin@idevent.com" },
    update: {},
    create: {
      name: "Superadmin",
      email: "admin@idevent.com",
      password: hash,
      role: "SUPERADMIN",
    }
  });

  // Find organizers
  const jakarta = await db.organizer.findUnique({ where: { subdomain: "jakartaevent" } });
  const bandung = await db.organizer.findUnique({ where: { subdomain: "bandungconcerts" } });

  // Organizer A (Jakarta)
  const orgA = await db.user.upsert({
    where: { email: "organizera@idevent.com" },
    update: {},
    create: {
      name: "Organizer A",
      email: "organizera@idevent.com",
      password: orgHash,
      role: "ORGANIZER",
    }
  });
  if (jakarta) {
    await db.organizerUser.upsert({
      where: { userId_organizerId: { userId: orgA.id, organizerId: jakarta.id } },
      update: {},
      create: { userId: orgA.id, organizerId: jakarta.id, role: "ADMIN" }
    });
  }

  // Organizer B (Bandung)
  const orgB = await db.user.upsert({
    where: { email: "organizerb@idevent.com" },
    update: {},
    create: {
      name: "Organizer B",
      email: "organizerb@idevent.com",
      password: orgHash,
      role: "ORGANIZER",
    }
  });
  if (bandung) {
    await db.organizerUser.upsert({
      where: { userId_organizerId: { userId: orgB.id, organizerId: bandung.id } },
      update: {},
      create: { userId: orgB.id, organizerId: bandung.id, role: "ADMIN" }
    });
  }

  console.log("Demo users created successfully!");
}

main().catch(console.error).finally(() => db.$disconnect());
