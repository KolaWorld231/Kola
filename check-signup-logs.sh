#!/bin/bash
# Script to check signup logs from Vercel

cd "/Users/visionalventure/Volo"

PROD_URL=$(./node_modules/.bin/vercel ls --prod 2>&1 | grep "Ready" | head -1 | awk '{print $2}')

if [ -z "$PROD_URL" ]; then
    echo "❌ Could not find production URL"
    exit 1
fi

echo "📋 Checking signup logs for: $PROD_URL"
echo "========================================"
echo ""
echo "Recent logs (filtered for signup/error):"
echo ""

./node_modules/.bin/vercel logs "$PROD_URL" 2>&1 | grep -iE "signup|error|fail|\[SIGNUP\]" | tail -50

echo ""
echo "💡 To see all logs:"
echo "   ./node_modules/.bin/vercel logs $PROD_URL"



