import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { isAssessmentRequestBody } from "@/lib/type-guards";

/**
 * POST /api/user/assessment - Save user assessment data
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

      const requestBody = await request.json();

    // Validate request body using type guards
    if (!isAssessmentRequestBody(requestBody)) {
      return NextResponse.json(
        { error: "Invalid request body. Language and level are required." },
        { status: 400 }
      );
    }

    let { languageId: incomingLanguageId } = requestBody;
    const { level, tribe, learningGoals, dailyGoal } = requestBody;

    // Debug logging
    console.log("Assessment submission - languageId:", incomingLanguageId);
    console.log("Assessment submission - level:", level);

    // Verify language exists and is active
    let language = await prisma.language.findUnique({
      where: { id: incomingLanguageId },
    });

    // If not found by ID, try by code (in case frontend is passing code instead of ID)
    if (!language) {
      console.log("Language not found by ID, trying by code:", incomingLanguageId);
      language = await prisma.language.findUnique({
        where: { code: incomingLanguageId },
      });
      
      if (language) {
        console.log("Found language by code, using ID:", language.id);
        // Use the actual ID instead of the code
        incomingLanguageId = language.id;
      }
    }

    if (!language) {
      console.error("Language not found - ID/Code:", incomingLanguageId);
      // List available languages for debugging
      const availableLanguages = await prisma.language.findMany({
        where: { isActive: true },
        select: { id: true, code: true, name: true },
      });
      console.error("Available languages:", availableLanguages);
      
      return NextResponse.json(
        { 
          error: "Invalid language selected. Please select a valid language.",
          debug: process.env.NODE_ENV === 'development' ? {
            receivedId: incomingLanguageId,
            availableLanguages: availableLanguages.map(l => ({ id: l.id, code: l.code, name: l.name }))
          } : undefined
        },
        { status: 400 }
      );
    }

    // Always use the language ID from the database (not the incoming value)
    // This ensures we have the correct format even if frontend sent a code
    const validatedLanguageId = language.id;

    if (!language.isActive) {
      return NextResponse.json(
        { error: "This language is not available. Please select another language." },
        { status: 400 }
      );
    }

    // Get or create user settings
    let userSettings;
    try {
      userSettings = await prisma.userSettings.upsert({
        where: { userId: session.user.id },
        update: {
          assessmentCompleted: true,
          assessmentLanguageId: validatedLanguageId,
          assessmentLevel: level,
          assessmentTribe: tribe || null,
          assessmentLearningGoals: learningGoals || [],
          assessmentDailyGoal: dailyGoal || 50,
          assessmentCompletedAt: new Date(),
        },
        create: {
          userId: session.user.id,
          assessmentCompleted: true,
          assessmentLanguageId: validatedLanguageId,
          assessmentLevel: level,
          assessmentTribe: tribe || null,
          assessmentLearningGoals: learningGoals || [],
          assessmentDailyGoal: dailyGoal || 50,
          assessmentCompletedAt: new Date(),
        },
      });
    } catch (dbError: unknown) {
      console.error("Database error saving assessment:", dbError);
      // If it's a column doesn't exist error, provide helpful message
      const errorCode = isPrismaError(dbError) ? dbError.code : undefined;
      const errorMessage = dbError instanceof Error ? dbError.message : "";
      if (errorCode === 'P2021' || errorMessage.includes('column') || errorMessage.includes('does not exist')) {
        return NextResponse.json(
          { error: "Database schema not updated. Please run: npx prisma db push" },
          { status: 500 }
        );
      }
      throw dbError; // Re-throw to be caught by outer catch
    }

    // Update user's selected language
    // Wrap in try-catch to handle foreign key constraint errors
    try {
      // Verify language still exists before updating (double-check)
      const verifyLanguage = await prisma.language.findUnique({
        where: { id: validatedLanguageId, isActive: true },
      });
      
      if (!verifyLanguage) {
        console.error("Language validation failed before user update:", {
          validatedLanguageId,
          languageExists: !!verifyLanguage
        });
        return NextResponse.json(
          { 
            error: "Invalid language selected. The language is no longer available.",
            debug: process.env.NODE_ENV === 'development' ? {
              validatedLanguageId,
              languageExists: false
            } : undefined
          },
          { status: 400 }
        );
      }

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          selectedLanguageId: validatedLanguageId,
        },
      });
      
      console.log("Successfully updated user selectedLanguageId:", validatedLanguageId);
    } catch (updateError: unknown) {
      console.error("Error updating user selected language:", {
        error: updateError,
        code: updateError.code,
        message: updateError.message,
        validatedLanguageId,
        userId: session.user.id
      });
      
      // If it's a foreign key constraint error
      if (updateError.code === 'P2003') {
        // Try to find what went wrong
        const verifyAfterError = await prisma.language.findUnique({
          where: { id: validatedLanguageId },
        });
        
        return NextResponse.json(
          { 
            error: "Invalid language selected. Please refresh the page and try again.",
            debug: process.env.NODE_ENV === 'development' ? {
              validatedLanguageId,
              languageExists: !!verifyAfterError,
              errorCode: updateError.code,
              errorMessage: updateError.message
            } : undefined
          },
          { status: 400 }
        );
      }
      // Re-throw other errors to be caught by outer catch
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      assessment: {
        languageId: userSettings.assessmentLanguageId,
        level: userSettings.assessmentLevel,
        tribe: userSettings.assessmentTribe,
        learningGoals: userSettings.assessmentLearningGoals,
        dailyGoal: userSettings.assessmentDailyGoal,
      },
    });
  } catch (error: unknown) {
    console.error("Error saving assessment:", error);
    // Return more detailed error message for debugging
    const errorMessage = error?.message || "Internal server error";
    const errorCode = error?.code;
    
    // Provide user-friendly error messages
    let userMessage = "Failed to save assessment. Please try again.";
    if (errorCode === 'P2021' || errorMessage?.includes('column') || errorMessage?.includes('does not exist')) {
      userMessage = "Database schema needs to be updated. Please contact support.";
    } else if (errorCode === 'P2002') {
      userMessage = "Assessment already exists for this user.";
    } else if (errorCode === 'P2003') {
      userMessage = "Invalid language selected.";
    }
    
    return NextResponse.json(
      { 
        error: userMessage,
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        code: errorCode
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/user/assessment - Get user assessment data
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
    });

    if (!userSettings) {
      return NextResponse.json({
        completed: false,
        assessment: null,
      });
    }

    return NextResponse.json({
      completed: userSettings.assessmentCompleted || false,
      assessment: userSettings.assessmentCompleted
        ? {
            languageId: userSettings.assessmentLanguageId,
            level: userSettings.assessmentLevel,
            tribe: userSettings.assessmentTribe,
            learningGoals: userSettings.assessmentLearningGoals,
            dailyGoal: userSettings.assessmentDailyGoal,
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

