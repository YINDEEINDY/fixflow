import bcrypt from 'bcryptjs';
import { prisma } from '../config/db.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, getRefreshTokenExpiry } from '../utils/jwt.js';
import { Role } from '@prisma/client';

interface RegisterInput {
  email: string;
  password: string;
  name: string;
  phone?: string;
  department?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface LineLoginInput {
  lineId: string;
  name: string;
  avatarUrl?: string;
  email?: string;
}

interface AuthResult {
  user: {
    id: string;
    email: string | null;
    name: string;
    role: Role;
    avatarUrl: string | null;
    phone: string | null;
    department: string | null;
    lineId: string | null;
  };
  accessToken: string;
  refreshToken: string;
  isNewUser?: boolean;
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new Error('EMAIL_EXISTS');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      passwordHash,
      name: input.name,
      phone: input.phone,
      department: input.department,
    },
  });

  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      department: user.department,
      lineId: user.lineId,
    },
    accessToken,
    refreshToken,
  };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user || !user.passwordHash) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);

  if (!isValidPassword) {
    throw new Error('INVALID_CREDENTIALS');
  }

  if (!user.isActive) {
    throw new Error('ACCOUNT_DISABLED');
  }

  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      department: user.department,
      lineId: user.lineId,
    },
    accessToken,
    refreshToken,
  };
}

export async function loginWithLine(input: LineLoginInput): Promise<AuthResult> {
  let user = await prisma.user.findUnique({
    where: { lineId: input.lineId },
  });

  const isNewUser = !user;

  if (!user) {
    user = await prisma.user.create({
      data: {
        lineId: input.lineId,
        name: input.name,
        avatarUrl: input.avatarUrl,
        email: input.email,
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: input.name,
        avatarUrl: input.avatarUrl,
      },
    });
  }

  if (!user.isActive) {
    throw new Error('ACCOUNT_DISABLED');
  }

  const accessToken = generateAccessToken({ userId: user.id, role: user.role });
  const refreshToken = generateRefreshToken({ userId: user.id, role: user.role });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      department: user.department,
      lineId: user.lineId,
    },
    accessToken,
    refreshToken,
    isNewUser,
  };
}

export async function refreshAccessToken(token: string): Promise<{ accessToken: string }> {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  const payload = verifyRefreshToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user || !user.isActive) {
    throw new Error('INVALID_REFRESH_TOKEN');
  }

  const accessToken = generateAccessToken({ userId: user.id, role: user.role });

  return { accessToken };
}

export async function logout(token: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { token },
  });
}

export async function getUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      avatarUrl: true,
      phone: true,
      department: true,
      lineId: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  return user;
}
