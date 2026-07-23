import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: { fullName: "Admin User", email: "admin@letsmove.rw", password: hashedPassword, role: "ADMIN" },
  });

  const driver = await prisma.user.create({
    data: { fullName: "Jean Claude", email: "driver@letsmove.rw", password: hashedPassword, role: "DRIVER", licenseNumber: "RWA1234567" },
  });

  const route = await prisma.route.create({
    data: {
      name: "Kimironko - Nyabugogo",
      startPoint: "Kimironko",
      endPoint: "Nyabugogo",
      stops: {
        create: [
          { name: "Kimironko", latitude: -1.9535, longitude: 30.1245, order: 1 },
          { name: "Remera", latitude: -1.9578, longitude: 30.1127, order: 2 },
          { name: "City Center", latitude: -1.9499, longitude: 30.0589, order: 3 },
          { name: "Nyabugogo", latitude: -1.9346, longitude: 30.0522, order: 4 },
        ],
      },
    },
  });

  const bus = await prisma.bus.create({
    data: { busNumber: "102", plateNumber: "RAD123A", routeId: route.id },
  });

  await prisma.user.update({ where: { id: driver.id }, data: { busId: bus.id } });

  console.log("Seed complete:", { admin: admin.email, driver: driver.email, route: route.name, bus: bus.busNumber });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());