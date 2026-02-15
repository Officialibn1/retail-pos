import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({
	adapter,
	transactionOptions: {
		maxWait: 10000, // Maximum time to wait for a transaction slot (10s)
		timeout: 15000, // Maximum time a transaction can run (15s)
	},
});

export { prisma };
