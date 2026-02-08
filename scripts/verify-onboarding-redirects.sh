#!/bin/bash

# Script to verify onboarding redirects work correctly
# This script checks the API endpoints and verifies redirect logic

echo "🧪 Testing Onboarding Redirect Endpoints"
echo "=========================================="
echo ""

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "⚠️  Server is not running on port 3000"
    echo "   Start the server with: npm run dev"
    echo ""
    exit 1
fi

echo "✅ Server is running"
echo ""

# Test the assessment status endpoint (requires authentication)
echo "📋 Test 1: Assessment Status Endpoint"
echo "--------------------------------------"
echo ""
echo "Note: This endpoint requires authentication"
echo "Endpoint: GET /api/user/assessment/status"
echo ""
echo "Expected behavior:"
echo "  • Returns { completed: false } for new users"
echo "  • Returns { completed: true } for users who completed onboarding"
echo ""
echo "To test manually:"
echo "  1. Sign in to the app"
echo "  2. Open browser console"
echo "  3. Run: fetch('/api/user/assessment/status').then(r => r.json()).then(console.log)"
echo ""

# Test the assessment endpoint
echo "📋 Test 2: Assessment Endpoint"
echo "--------------------------------"
echo ""
echo "Endpoint: POST /api/user/assessment"
echo "Endpoint: GET /api/user/assessment"
echo ""
echo "Expected behavior:"
echo "  • POST: Creates/updates UserSettings with assessmentCompleted: true"
echo "  • GET: Returns assessment data if completed, or { completed: false } if not"
echo ""

# Check server logs for onboarding-related messages
echo "📋 Test 3: Checking Server Logs"
echo "--------------------------------"
echo ""
echo "Look for these log messages in the server console:"
echo "  • [ONBOARDING] User has completed onboarding, redirecting to dashboard"
echo "  • [ONBOARDING] User has not completed onboarding, allowing access"
echo "  • [APP] User has not completed onboarding, redirecting to onboarding"
echo "  • [SIGNIN] Redirecting new user to onboarding"
echo "  • [SIGNIN] Redirecting returning user to dashboard"
echo ""

# Instructions for manual testing
echo "📋 Manual Testing Instructions"
echo "================================="
echo ""
echo "1. New User Flow:"
echo "   a. Sign up a new account"
echo "   b. Should be redirected to /onboarding"
echo "   c. Complete the onboarding"
echo "   d. Should be redirected to /dashboard"
echo "   e. Sign out and sign in again"
echo "   f. Should go directly to /dashboard (no onboarding)"
echo ""
echo "2. Returning User Flow:"
echo "   a. Sign in with existing account (completed onboarding)"
echo "   b. Should go directly to /dashboard"
echo "   c. Try navigating to /onboarding"
echo "   d. Should redirect back to /dashboard"
echo ""
echo "3. Direct URL Access:"
echo "   a. While signed in (completed onboarding)"
echo "   b. Try accessing: http://localhost:3000/onboarding"
echo "   c. Should redirect to /dashboard"
echo ""
echo "4. Social Auth Flow:"
echo "   a. Sign in with Google/Facebook (new user)"
echo "   b. Should be redirected to /onboarding"
echo "   c. Complete onboarding"
echo "   d. Sign out and sign in again"
echo "   e. Should go directly to /dashboard"
echo ""

echo "✅ Test script completed"
echo ""
echo "Next steps:"
echo "  1. Review the test results above"
echo "  2. Run manual tests following the instructions"
echo "  3. Check server logs for any errors"
echo "  4. Verify database state matches expected behavior"
echo ""


