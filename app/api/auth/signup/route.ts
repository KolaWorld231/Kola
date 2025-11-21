import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { isSignupRequestBody } from "@/lib/type-guards";
import { isPrismaError, getPrismaErrorCode, getPrismaErrorMeta } from "@/types/prisma-errors";

export async function POST(request: Request) {
  try {
    console.log("[SIGNUP] Starting signup process");
    
    const body = await request.json();

    // Validate request body using type guards
    if (!isSignupRequestBody(body)) {
      console.log("[SIGNUP] Validation failed: invalid request body");
      return NextResponse.json(
        { error: "Invalid request body. Email and password are required. Email must be valid format." },
        { status: 400 }
      );
    }

    const { name, email, password } = body;

    console.log("[SIGNUP] Received data:", { 
      hasEmail: !!email, 
      hasPassword: !!password, 
      hasName: !!name,
      emailLength: email?.length 
    });

    // Validate password length (type guard validates format but not length)
    if (password.length < 8) {
      console.log("[SIGNUP] Validation failed: password too short");
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log("[SIGNUP] Checking if user exists:", normalizedEmail);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      console.log("[SIGNUP] User already exists");
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    console.log("[SIGNUP] Hashing password...");
    // Hash password
    const hashedPassword = await hash(password, 12);
    console.log("[SIGNUP] Password hashed successfully");

    console.log("[SIGNUP] Creating user in database...");
    // Create user with explicit field assignment
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name?.trim() || null,
        password: hashedPassword,
        // Explicitly set defaults
        totalXP: 0,
        currentStreak: 0,
        longestStreak: 0,
        hearts: 5,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    console.log("[SIGNUP] User created successfully:", user.id);
    return NextResponse.json(
      { message: "User created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    // Enhanced error logging
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
      // Check for Prisma error codes
      prismaCode: getPrismaErrorCode(error),
      meta: getPrismaErrorMeta(error),
    } : { error };

    console.error("[SIGNUP] Error occurred:", JSON.stringify(errorDetails, null, 2));
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    // Check for Prisma-specific errors
    let statusCode = 500;
    let errorResponse: { error: string; details?: string } = {
      error: "Internal server error",
    };

    if (error instanceof Error) {
      // Handle Prisma errors by code
      const prismaErrorCode = getPrismaErrorCode(error);
      
      if (prismaErrorCode === "P2002") {
        // Unique constraint violation
        statusCode = 400;
        errorResponse = {
          error: "User with this email already exists",
        };
        console.log("[SIGNUP] P2002: Unique constraint violation");
      } else if (prismaErrorCode === "P2025") {
        // Record not found
        statusCode = 400;
        errorResponse = {
          error: "Unable to create user",
        };
        console.log("[SIGNUP] P2025: Record not found");
      } else if (prismaErrorCode === "P1001" || prismaErrorCode === "P1000") {
        // Database connection errors
        statusCode = 503;
        errorResponse = {
          error: "Database connection error. Please try again later.",
        };
        console.log("[SIGNUP] Database connection error:", prismaErrorCode);
      } else if (error.message.includes("connection") || error.message.includes("database")) {
        // Generic database connection error
        statusCode = 503;
        errorResponse = {
          error: "Database connection error. Please try again later.",
        };
        console.log("[SIGNUP] Database connection error detected");
      } else {
        // In production, log full error but return generic message
        // In development, show more details
        if (process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview") {
          errorResponse = {
            error: errorMessage,
            details: error.stack,
          };
        } else {
          // In production, log the full error but return generic message
          errorResponse = {
            error: "Internal server error. Please try again later.",
          };
        }
        console.log("[SIGNUP] Unknown error:", prismaErrorCode || "no code");
      }
    }

    return NextResponse.json(errorResponse, { status: statusCode });
  }
}





