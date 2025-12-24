# Implementation Plan - NovelForge Atelier

Establish a high-performance, local-first writing environment for novelists using "Digital Synesthesia" principles.

## User Review Required

> [!IMPORTANT]
> **File System Access API**: This application requires modern browser support (Chrome/Edge) for direct disk access.
> **Typography**: We will use high-quality system-font fallback or CDN imports for Neue Montreal, Editorial New, and Space Mono to ensure the "Sensorium" aesthetic.
> **Gemini API**: You will need to provide a Gemini API key for the "Shredder" and AI Analysis features.

## Proposed Changes

### Project Setup
- [NEW] `index.html`, `package.json`, `vite.config.ts`, `tailwind.config.ts`: Base project configuration.
- [NEW] `src/styles/index.css`: Implementation of the Neo-Grid, Hard Shadows, and Grain Texture.

---

### UI Framework (Neo-Grid)
- [NEW] `src/layouts/MainLayout.tsx`: 25/75 asymmetrical split.
- [NEW] `src/components/TheSpine.tsx`: Brutalist file tree with Metadata Sparklines.
- [NEW] `src/components/TheAnvil.tsx`: Tabbed interface for Write, Preview, and Structure.
- [NEW] `src/components/WhisperBar.tsx`: Spring-physics bottom bar for AI interactions.

---

### The Shredder (Ingestion Logic)
- [NEW] `src/lib/shredder.ts`: Logic to split .md/.docx files using Gemini decomposition.
- [NEW] `src/lib/fs.ts`: Wrapper for File System Access API.

---

### Specialized Stages
- [NEW] `src/stages/WriteStage.tsx`: Editorial New editor with Surgical Teal cursor.
- [NEW] `src/stages/PreviewStage.tsx`: Paper leaf with dynamic standard book dimensions.
- [NEW] `src/stages/StructureStage.tsx`: Dual-layer tension timeline (User vs. AI Pulse).

---

### State & History
- [NEW] `src/lib/db.ts`: IndexedDB configuration for "Time-Travel" history.

## Verification Plan

### Automated Tests
- Run `npm run dev` to verify layout and aesthetic compliance.
- Unit tests for "The Shredder" decomposition logic.

### Manual Verification
1.  **Ingestion Test**: Upload a large .md file and verify it splits into chapters in the local file system.
2.  **Aesthetic Check**: Confirm 2px borders, hard shadows, and grain texture are visible.
3.  **Interaction Test**: Test the "Whisper Bar" spring physics and tab transitions.
