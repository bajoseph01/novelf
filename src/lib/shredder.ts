/**
 * Logic for splitting manuscripts into chapters.
 * Detects common chapter markers including markdown-style and decorated formats.
 */

export interface Chapter {
    id: string
    title: string
    content: string
}

export function decomposeManuscript(text: string): Chapter[] {
    // More comprehensive regex to catch various chapter formats:
    // "Chapter X", "# Chapter X", "***Chapter X***", "**Chapter X**", 
    // "### **Chapter X**", "## Chapter X", etc.
    const chapterRegex = /(?:^|\n)(?:#{1,6}\s*)?(?:\*{1,3}\s*)?(?:Chapter|Ch\.?|CHAPTER)\s*(\d+)(?:\s*:\s*|\s+-\s+|\s+)([^\n\r*#]+)?/gi

    const chapters: Chapter[] = []
    const matches: { index: number; id: string; title: string; fullMatchEnd: number }[] = []
    let match

    while ((match = chapterRegex.exec(text)) !== null) {
        const id = match[1].padStart(2, '0')
        // Clean up title - remove asterisks, hashes, and extra whitespace
        const rawTitle = match[2] || `Untitled Chapter ${match[1]}`
        const title = rawTitle.replace(/\*+/g, '').replace(/#+/g, '').trim()

        matches.push({
            index: match.index,
            id,
            title,
            fullMatchEnd: match.index + match[0].length
        })
    }

    console.log(`[Shredder] Found ${matches.length} chapters:`, matches.map(m => `Ch${m.id}: ${m.title}`))

    // Build chapters from matches
    for (let i = 0; i < matches.length; i++) {
        const current = matches[i]
        const next = matches[i + 1]

        const contentStart = current.index
        const contentEnd = next ? next.index : text.length

        // Get full content including the header
        let content = text.slice(contentStart, contentEnd).trim()

        chapters.push({
            id: current.id,
            title: current.title,
            content
        })
    }

    // If no chapters found, create a single chapter with all content
    if (chapters.length === 0) {
        console.log('[Shredder] No chapter markers found, creating single draft chapter')
        chapters.push({
            id: '01',
            title: 'Draft Part 01',
            content: text.trim()
        })
    }

    return chapters
}
