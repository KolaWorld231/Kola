# JSON Fields Migration Summary

## Overview
This document summarizes the work completed to standardize JSON field handling across the Kola app database, transitioning from ad-hoc JSON serialization to a centralized, type-safe helper system.

## Problem Statement
The app stored JSON data in string columns (due to SQLite's lack of native `Json` type support):
- `SocialActivity.data` - social activity metadata
- `UserSettings.assessmentLearningGoals` - user assessment goals  
- `Achievement.criteria` - custom achievement unlock criteria
- `AdminUser.permissions` - admin role permissions

These fields were being serialized/deserialized inconsistently throughout the codebase using ad-hoc `JSON.stringify()` and `JSON.parse()` calls, making the code:
- **Fragile**: Scattered error handling made it hard to ensure safe parsing
- **Hard to maintain**: Changes to JSON structure required updates in multiple places
- **Error-prone**: Type safety was lost when casting parsed values

## Solution Implemented

### 1. Centralized JSON Helpers (`lib/json-fields.ts`)
Created type-safe, reusable helpers for serialization/deserialization:

```typescript
// Generic helpers
export function toDB(value: unknown): string | null
export function fromDB<T = unknown>(value: string | null | undefined): T | null

// Type-specific helpers with interfaces
export interface AchievementCriteria extends Record<string, unknown> { ... }
export function toDBCriteria(value: AchievementCriteria | null | undefined): string | null
export function fromDBCriteria(value: string | null | undefined): AchievementCriteria | null

export interface AdminPermissions extends Record<string, unknown> { ... }
export function toDBPermissions(value: AdminPermissions | null | undefined): string | null
export function fromDBPermissions(value: string | null | undefined): AdminPermissions | null
```

**Benefits**:
- Consistent error handling with fallbacks
- Type inference and IDE autocomplete
- Single source of truth for JSON handling logic

### 2. Updated Code Paths

#### ✅ `lib/achievements.ts`
- **Before**: Cast criteria string directly: `achievement.criteria as unknown as Record<string, unknown>`
- **After**: Use `fromDBCriteria()` for safe parsing with proper typing
- **Impact**: All achievement criteria reads are now type-safe and error-resilient

#### ✅ `lib/social-activity.ts`
- **Before**: Direct `JSON.stringify()` calls
- **After**: Uses `toDB()` helper
- **Impact**: Consistent serialization across social activity creation

#### ✅ `app/api/user/assessment/route.ts`
- **Before**: Direct `JSON.stringify()` and `JSON.parse()` calls
- **After**: Uses `toDB()` and `fromDB()` helpers
- **Impact**: Assessment data reads and writes are now centralized

#### ✅ `app/api/challenges/[id]/route.ts`
- **Before**: Direct `JSON.stringify()` calls
- **After**: Uses `toDB()` helper
- **Impact**: Challenge social activity creation is now centralized

### 3. Backfill & Migration Scripts

#### `scripts/backfill-to-json.js`
- Safely parses legacy data stored in JSON string columns
- Handles multiple format types (JSON, CSV, raw strings)
- Can be re-run safely—only updates rows with non-null data
- Created with Prisma client for safe DB access

#### `scripts/verify-backfill.js` (Enhanced)
- Checks all four JSON-field tables for data integrity
- Verifies parseability of stored JSON strings
- Shows sample values for validation
- **Result**: Dev DB has no legacy data (as expected for new instance)

#### `scripts/prepare-postgres-migration.js`
- Generates Postgres-compatible schema with `Json?` fields
- Documents steps to migrate to Postgres for full JSON support
- Prepared but not applied (SQLite in this environment)

### 4. CI/CD Integration (`.github/workflows/ci.yml`)
- **Lint**: Ensures code style compliance
- **Type Check**: Validates TypeScript compilation
- **Unit Tests**: Runs Jest backfill tests
- **Build**: Verifies production build succeeds
- **Caching**: Optimizes workflow performance
- **Artifacts**: Stores build outputs for deployment

### 5. Tests (`tests/backfill/backfill.test.ts`)
- Unit tests for backfill script with mocked Prisma
- Validates safe JSON parsing and normalization
- Tests both valid JSON and heuristic CSV fallback

## Migration Path

### Current State (SQLite)
String columns + centralized helpers = safe JSON handling without breaking changes

### Future State (If Moving to Postgres)
1. Provision Postgres database
2. Update `DATABASE_URL` to point to Postgres
3. Use generated `schema.postgres.prisma` with `Json?` fields
4. Run `npx prisma migrate deploy`
5. Data remains compatible (JSON strings treated as Postgres JSON objects)

## Verification Results

**Dev Database Status**:
```
socialActivity: 0 rows (total), 0 with data
userSettings: 0 rows (total), 0 with assessmentLearningGoals  
achievement: 6 rows (total), 0 with criteria
adminUser: 1 row (total), 0 with permissions
```

No legacy data to backfill in this instance—all new data will use properly serialized JSON strings via the helpers.

## Type Safety Improvements

### Before
```typescript
// Unsafe: type lost, no IDE support
const criteria = achievement.criteria as unknown as Record<string, unknown>;
const result = JSON.stringify(data); // No error handling
```

### After
```typescript
// Type-safe: proper typing, IDE autocomplete, safe fallback
const criteria = fromDBCriteria(achievement.criteria); // AchievementCriteria | null
const result = toDB(data); // string | null with built-in fallback
```

## Files Modified

| File | Change | Impact |
|------|--------|--------|
| `lib/json-fields.ts` | NEW | Core helpers + interfaces |
| `lib/achievements.ts` | Updated | Safe criteria parsing |
| `lib/social-activity.ts` | Updated | Centralized serialization |
| `app/api/user/assessment/route.ts` | Updated | Type-safe helpers |
| `app/api/challenges/[id]/route.ts` | Updated | Centralized serialization |
| `scripts/backfill-to-json.js` | NEW | Legacy data cleanup |
| `scripts/verify-backfill.js` | NEW/Enhanced | Verification & reporting |
| `scripts/prepare-postgres-migration.js` | NEW | Future migration support |
| `.github/workflows/ci.yml` | Updated | CI pipeline |
| `tests/backfill/backfill.test.ts` | NEW | Backfill validation |
| `prisma/schema.prisma` | No change | String columns maintained |

## No Breaking Changes
- All String columns remain unchanged (backward compatible)
- Existing code continues to work
- Gradual rollout of helper methods
- Can be deployed without schema migration

## Deployment Checklist
- [x] JSON helpers defined and typed
- [x] Database-related code updated to use helpers
- [x] Type checking passes (npx tsc --noEmit ✓)
- [x] Backfill script created and tested
- [x] Verification script reports data status  
- [x] CI workflow configured and testing
- [x] No breaking changes introduced
- [ ] Push to remote and run CI pipeline
- [ ] Monitor for any JSON parsing issues in production
- [ ] (Optional) Migrate to Postgres and use true Json fields

## Next Steps
1. **Immediate**: Commit changes and push `feature/kola-brand-assets` branch
2. **Short-term**: Run CI pipeline and verify tests pass
3. **Medium-term**: Document any custom achievement criteria creation patterns
4. **Long-term**: Consider Postgres migration if scaling requires native JSON support

## Notes
- SQLite's lack of Json type support is a known limitation but not a blocker with this approach
- The centralized helpers make a future migration to Postgres simpler
- All error handling includes safe fallbacks (returns null rather than throwing)
- Type interfaces provide clear contracts for JSON structure

---

**Status**: ✅ Ready for deployment  
**Last Updated**: February 8, 2026  
**Branch**: `feature/kola-brand-assets`
