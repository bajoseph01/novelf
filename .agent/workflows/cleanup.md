---
description: Periodic codebase cleanup to keep project minimal and functional
---

# Codebase Cleanup Workflow

Run this workflow monthly or when you notice clutter building up.

## Step 1: Run the Cleanup Detector Script

// turbo
```powershell
node scripts/detect-cleanup-candidates.js
```

This will scan for:
- Orphaned utility scripts (Python, JS, etc.)
- Files with "temp", "test", "old", "backup" in names
- Unused configuration files
- Large files that might be outdated

## Step 2: Review the Candidates

The script will list potential files to delete. **Review each one** before proceeding.

## Step 3: Manual Review Checklist

Ask yourself for each file:
- [ ] Is this file referenced in `package.json` scripts?
- [ ] Is it imported/used in any TypeScript/React files?
- [ ] Does it target files/paths that no longer exist?
- [ ] Was it created for a one-time fix?
- [ ] Has it been unused for >30 days?

## Step 4: Delete Obsolete Files

// turbo
```powershell
# Example - adjust based on Step 2 findings
Remove-Item -Path "path/to/obsolete/file.py" -Force
```

## Step 5: Update .gitignore

Ensure your `.gitignore` is catching temporary files:
- Check for patterns that match your temp file naming
- Add any new temporary file patterns you've discovered

## Step 6: Document in README (Optional)

If you deleted important utility scripts, note what they did in your project README or this workflow file for future reference.

---

## Best Practices to Prevent Clutter

### Naming Conventions
- **Temporary scripts**: Prefix with `temp_` or `_temp_` (e.g., `temp_fix_apostrophes.py`)
- **One-time utilities**: Add date suffix (e.g., `cleanup_2024-12-24.py`)
- **Experimental code**: Use `experimental_` or `draft_` prefix

### Directory Structure
- Keep one-off scripts in a `scripts/temp/` or `utils/temp/` folder
- Move completed utilities to `scripts/archive/` with a README
- Never put temporary code in your `src/` folder

### Before Creating a New Utility Script
Ask: "Is this a one-time fix or ongoing functionality?"
- **One-time**: Use temp naming convention, delete after use
- **Ongoing**: Integrate into your main application or create a proper tool

### Monthly Reminders
Set a calendar reminder to run this workflow on the 1st of each month.
