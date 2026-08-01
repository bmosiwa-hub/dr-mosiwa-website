import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter } as any);

async function main() {
  const existing = await db.user.findUnique({ where: { email: "azmosiwa@gmail.com" } });
  if (existing) {
    console.log("User already exists — skipping seed.");
    return;
  }

  const hash = await bcrypt.hash(process.env.SEED_PASSWORD ?? "change-me-now", 12);

  await db.user.create({
    data: {
      name: "Azariah Mosiwa",
      email: "azmosiwa@gmail.com",
      password: hash,
      role: "ADMIN",
    },
  });

  console.log("✓ Admin user created: azmosiwa@gmail.com");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
