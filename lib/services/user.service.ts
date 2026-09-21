import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { User, UserRole, Shift, Prisma } from "@/generated/prisma/client";
import {
  CreateUserInput,
  UpdateUserInput,
} from "@/lib/validations/user.schema";
import { generateRandomPassword } from "@/lib/utils/password-generator";
import { sendUserCreationEmail } from "@/lib/email";

/**
 * User returned without password field
 */
export type SafeUser = Omit<User, "password">;

/**
 * Create a new user with randomly generated password
 * @param data - User creation data
 * @returns Created user without password and the generated password
 */
export async function createUser(
  data: CreateUserInput,
): Promise<{ user: SafeUser }> {
  // Generate a random secure password
  const generatedPassword = generateRandomPassword(12);
  const hashedPassword = await hashPassword(generatedPassword);

  // Create user with hashed password
  const user = await prisma.user.create({
    data: {
      email: data.email,
      username: data.username,
      name: data.name,
      password: hashedPassword,
      roles: data.roles || [UserRole.CASHIER],
      shift: data.shift || Shift.MORNING,
    },
  });

  // Send welcome email with credentials
  try {
    await sendUserCreationEmail(user.email, {
      userName: user.name,
      email: user.email,
      username: user.username,
      password: generatedPassword,
      roles: user.roles,
    });
  } catch (emailError) {
    console.error("Failed to send user creation email:", emailError);
    // Don't fail user creation if email fails
  }

  // Return user without password and the generated password
  const { password, ...safeUser } = user;
  return { user: safeUser };
}

/**
 * Get user by ID (excluding password)
 * @param id - User ID
 * @returns User without password or null if not found
 */
export async function getUserById(id: string): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      roles: true,
      status: true,
      shift: true,
      createdAt: true,
      updatedAt: true,
      password: false,
    },
  });

  return user;
}

/**
 * Get user by email (excluding password)
 * @param email - User email
 * @returns User without password or null if not found
 */
export async function getUserByEmail(email: string): Promise<SafeUser | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      roles: true,
      status: true,
      shift: true,
      createdAt: true,
      updatedAt: true,
      password: false,
    },
  });

  return user;
}

/**
 * Update user by ID
 * @param id - User ID
 * @param data - User update data
 * @returns Updated user without password
 */
export async function updateUser(
  id: string,
  data: UpdateUserInput,
): Promise<SafeUser> {
  // If password is being updated, hash it
  const updateData: any = { ...data };
  if (data.password) {
    updateData.password = await hashPassword(data.password);
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  // Return user without password
  const { password, ...safeUser } = user;
  return safeUser;
}

/**
 * Delete user by ID (cascade deletes sessions)
 * @param id - User ID
 */
export async function deleteUser(id: string): Promise<void> {
  await prisma.user.delete({
    where: { id },
  });
}

/**
 * List all users (excluding passwords)
 * @param params - URL search parameters for filtering
 * @returns Array of users without passwords
 */
export async function listUsers(params: URLSearchParams): Promise<SafeUser[]> {
  const searchTerm = params.get("searchTerm");
  const roleFilter = params.get("role");

  const searchConditions: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    searchConditions.push({
      name: {
        contains: searchTerm,
        mode: "insensitive" as const,
      },
    });

    searchConditions.push({
      email: {
        contains: searchTerm,
        mode: "insensitive" as const,
      },
    });

    searchConditions.push({
      username: {
        contains: searchTerm,
        mode: "insensitive" as const,
      },
    });
  }

  const whereCondition: Prisma.UserWhereInput = {};

  if (searchConditions.length > 0) {
    whereCondition.OR = searchConditions;
  }

  if (roleFilter && roleFilter !== "all") {
    whereCondition.roles = {
      has: roleFilter as UserRole,
    };
  }

  const users = await prisma.user.findMany({
    where: whereCondition,
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      roles: true,
      status: true,
      shift: true,
      createdAt: true,
      updatedAt: true,
      password: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
}
