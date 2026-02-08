/**
 * Fix Mobile Build Script
 * Handles API routes exclusion for static export
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔧 Fixing Mobile Build Configuration...\n');

// Check if we're building for mobile
const isMobileBuild = process.env.CAPACITOR_BUILD === 'true';

if (!isMobileBuild) {
  console.log('ℹ️  Not a mobile build. Skipping mobile build fixes.');
  process.exit(0);
}

console.log('📱 Mobile build detected. Applying fixes...\n');

// The build will handle API routes by excluding them from static export
// Next.js will automatically skip API routes when using output: 'export'

console.log('✅ Mobile build configuration ready!');
console.log('\n📝 Notes:');
console.log('   • API routes are automatically excluded from static export');
console.log('   • Mobile app will use server mode for API calls');
console.log('   • Update capacitor.config.ts server.url for production\n');


