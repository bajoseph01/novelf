# 🧹 NovelF Cleanup Protocol

Keep your codebase **minimal, functional, and maintainable**.

## Quick Start

**Run this command monthly:**
```powershell
node scripts/detect-cleanup-candidates.js
```

See `.agent/workflows/cleanup.md` for the full workflow.

---

## The Golden Rules

### 1. **Temporary Scripts Must Be Obviously Temporary**

Use clear naming conventions:

✅ **GOOD:**
- `temp_fix_chapters.py`
- `_temp_apostrophe_repair.py`
- `cleanup_2024-12-24.py`

❌ **BAD:**
- `fix.py`
- `script.py`
- `polish_draft.py` (looks permanent)

### 2. **One-Time Scripts Get Deleted After Use**

- Created a Python script to fix a one-time issue? ✓ **Delete it when done**
- Need to keep it for reference? Move to `scripts/archive/` with a README

### 3. **If It's Important, Integrate It**

If a utility script is valuable enough to keep:
- ✨ Add it to your main application
- 📦 Or create a proper npm script in `package.json`
- 📝 Or document it in a workflow

**Don't let ad-hoc scripts accumulate!**

### 4. **Use Your `.gitignore` Aggressively**

The `.gitignore` is configured to catch:
- Files starting with `temp_`, `_temp_`, `tmp_`
- Files ending with `_old`, `_temp`, `.bak`
- Common one-time script names (`cleanup_*.py`, `fix_*.py`, etc.)
- Scripts with date suffixes (`*_2024-*.py`)

**Add patterns as you discover them!**

### 5. **Monthly Hygiene Check**

Set a calendar reminder for the 1st of each month:
1. Run `node scripts/detect-cleanup-candidates.js`
2. Review flagged files
3. Delete obsolete code
4. Update `.gitignore` if needed

---

## Decision Tree: Keep or Delete?

```
Is the file a utility script (.py, .sh, .bat)?
├─ Does it target files/paths that no longer exist?
│  └─ 🗑️ DELETE IT
│
├─ Was it created for a one-time fix?
│  ├─ Has the fix been applied?
│  │  └─ 🗑️ DELETE IT
│  └─ Is it documented elsewhere?
│     └─ 🗑️ DELETE IT
│
├─ Is it used in package.json or imported in src/?
│  ├─ Yes → ✅ KEEP IT
│  └─ No → Continue...
│
├─ Has it been unused for >30 days?
│  ├─ Can you remember what it does without reading it?
│  │  ├─ No → 🗑️ DELETE IT
│  │  └─ Yes → Archive or integrate it
│  └─ ✅ KEEP IT (for now)
│
└─ When in doubt:
   └─ Git has your back! You can always recover deleted files.
      🗑️ DELETE IT
```

---

## Recovery Process

If you accidentally delete something important:

```powershell
# See deleted files
git log --diff-filter=D --summary

# Restore a specific file
git checkout <commit-hash>~1 -- path/to/file
```

---

## Your Cleanup Toolkit

| Tool | Purpose |
|------|---------|
| `node scripts/detect-cleanup-candidates.js` | Find potential obsolete files |
| `.gitignore` | Prevent temp files from being tracked |
| `.agent/workflows/cleanup.md` | Step-by-step cleanup workflow |
| This file | Quick reference for cleanup decisions |

---

**Remember:** A clean codebase is a maintainable codebase! 🚀
