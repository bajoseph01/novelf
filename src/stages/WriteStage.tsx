import { useRef } from 'react'
import { Chapter } from '../lib/shredder'

interface WriteStageProps {
    chapters: Chapter[]
    selectedChapterIndex: number
    onChapterChange: (index: number, newContent: string) => void
}

export default function WriteStage({ chapters, selectedChapterIndex, onChapterChange }: WriteStageProps) {
    const editorRef = useRef<HTMLTextAreaElement>(null)

    const currentChapter = chapters[selectedChapterIndex]

    if (!currentChapter) {
        return (
            <div className="h-full w-full bg-[#0A0A0A] flex items-center justify-center">
                <p className="text-zinc-600 font-mono text-sm uppercase">No chapter selected</p>
            </div>
        )
    }

    return (
        <div className="h-full w-full bg-[#0A0A0A] p-12 lg:p-24 overflow-y-auto flex justify-center">
            <div className="max-w-3xl w-full">
                <header className="mb-12 space-y-2">
                    <div className="text-xs font-mono text-accent uppercase tracking-widest">Chapter {currentChapter.id}</div>
                    <h1 className="text-5xl font-sans font-black uppercase text-white">{currentChapter.title}</h1>
                </header>

                <textarea
                    ref={editorRef}
                    className="w-full min-h-[70vh] bg-transparent text-[#F5F5F7] font-serif text-xl leading-relaxed outline-none border-none resize-none placeholder:text-zinc-800"
                    placeholder="Begin the oscillation of thought..."
                    value={currentChapter.content}
                    onChange={(e) => onChapterChange(selectedChapterIndex, e.target.value)}
                    style={{
                        caretColor: '#00FFD1' // Surgical Teal Cursor
                    }}
                />
            </div>
        </div>
    )
}
