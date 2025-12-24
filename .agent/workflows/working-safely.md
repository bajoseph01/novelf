---
description: How to safely work on new features without breaking the main app
---

# 🌿 How to Work Safely (The Branch Workflow)

Use this workflow whenever you want to add a major feature or try something experimental.

## Step 1: Create your "Sandbox" (Branch)

Give your experiment a simple name (like `new-design` or `chapter-fix`).

```powershell
# Create a new branch and switch to it
git checkout -b new-feature-name
```

## Step 2: Hacking Time 🔨

Work on your code as normal!
- If you break everything: **It's fine.** The main app is safe.
- If you delete files: **It's fine.**
- You can commit your work here as much as you want:
  ```powershell
  git add .
  git commit -m "trying stuff out"
  ```

## Step 3: The "Undo" Button ↩️

If you hate what you did and want to go back to safety:

```powershell
# Switch back to the main safe version
git checkout main

# (Optional) Delete the failed experiment
git branch -D new-feature-name
```

## Step 4: The "Save" Button (Merge) ✅

If you LOVE what you did and want to make it permanent:

```powershell
# 1. Switch back to main
git checkout main

# 2. Merge your changes in
git merge new-feature-name

# 3. Save to cloud
git push
```
