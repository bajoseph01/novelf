import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Chapter } from '../lib/shredder'
import { Book, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'

type Format = '5x8' | '5.5x8.5' | '6x9'
type ViewMode = 'single' | 'spread'

const formats: Record<Format, { w: number; h: number; label: string }> = {
    '5x8': { w: 320, h: 512, label: 'Mass Market' },
    '5.5x8.5': { w: 352, h: 544, label: 'Trade Paperback' },
    '6x9': { w: 384, h: 576, label: 'Hardcover Standard' },
}

interface PreviewStageProps {
    chapters: Chapter[]
    selectedChapterIndex: number
}

export default function PreviewStage({ chapters, selectedChapterIndex }: PreviewStageProps) {
    const [format, setFormat] = useState<Format>('5.5x8.5')
    const [viewMode, setViewMode] = useState<ViewMode>('single')
    const [currentPage, setCurrentPage] = useState(0)

    // Reset to page 1 when switching chapters
    useEffect(() => {
        setCurrentPage(0)
    }, [selectedChapterIndex])

    const currentChapter = chapters[selectedChapterIndex]

    if (!currentChapter) {
        return (
            <div className="h-full w-full bg-zinc-800/50 flex items-center justify-center">
                <p className="text-zinc-600 font-mono text-sm uppercase">No chapter selected</p>
            </div>
        )
    }

    // Split content into paragraphs for pagination
    const paragraphs = currentChapter.content
        .split(/\n\n+/)
        .filter(p => p.trim().length > 0)
        .map(p => p.replace(/\*\*/g, '').replace(/\*/g, '').replace(/\[.*?\]/g, '').trim())
        .filter(p => p.length > 0)

    // Estimate paragraphs per page based on format (rough estimate)
    const paragraphsPerPage = format === '5x8' ? 4 : format === '5.5x8.5' ? 5 : 6
    const totalPages = Math.ceil(paragraphs.length / paragraphsPerPage)

    const getPageContent = (pageNum: number) => {
        const start = pageNum * paragraphsPerPage
        const end = start + paragraphsPerPage
        return paragraphs.slice(start, end)
    }

    const nextPage = () => {
        const increment = viewMode === 'spread' ? 2 : 1
        if (currentPage + increment < totalPages) {
            setCurrentPage(currentPage + increment)
        }
    }

    const prevPage = () => {
        const decrement = viewMode === 'spread' ? 2 : 1
        if (currentPage - decrement >= 0) {
            setCurrentPage(currentPage - decrement)
        } else {
            setCurrentPage(0)
        }
    }

    const PageComponent = ({ pageNum, isLeft }: { pageNum: number; isLeft?: boolean }) => {
        const content = getPageContent(pageNum)
        const { w, h } = formats[format]

        if (pageNum >= totalPages) {
            // Empty page placeholder for spread view
            return (
                <div
                    style={{ width: `${w}px`, height: `${h}px` }}
                    className="bg-zinc-700/30 border-2 border-dashed border-zinc-700 flex items-center justify-center"
                >
                    <span className="text-zinc-600 text-xs font-mono uppercase">End of Chapter</span>
                </div>
            )
        }

        return (
            <motion.div
                layout
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                style={{ width: `${w}px`, height: `${h}px` }}
                className={`bg-[#F5F5F7] text-base border-2 border-black relative overflow-hidden flex flex-col ${viewMode === 'spread'
                    ? isLeft
                        ? 'shadow-[-8px_8px_0px_0px_rgba(0,0,0,1)]'
                        : 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
                    : 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
                    }`}
            >
                <div className="flex-1 p-6 overflow-hidden">
                    {/* Page Header */}
                    <div className="flex justify-between items-center mb-6 border-b border-black/10 pb-2">
                        <span className="text-[8px] font-sans uppercase tracking-[0.15em] opacity-40">
                            {isLeft ? 'The Dullah Diaries' : currentChapter.title}
                        </span>
                        <span className="text-[9px] font-mono opacity-40">{pageNum + 1}</span>
                    </div>

                    {/* Page Content */}
                    <article className="font-serif text-sm leading-relaxed text-black/90 overflow-hidden h-full">
                        {pageNum === 0 && (
                            <div className="text-xl font-sans font-black mb-4 border-l-4 border-black pl-3">
                                {currentChapter.title}
                            </div>
                        )}

                        {content.map((para, idx) => (
                            <p
                                key={idx}
                                className={`mb-3 text-justify ${pageNum === 0 && idx === 0
                                    ? 'first-letter:text-4xl first-letter:font-sans first-letter:font-black first-letter:mr-1 first-letter:float-left first-letter:leading-[0.8]'
                                    : ''
                                    }`}
                            >
                                {para}
                            </p>
                        ))}
                    </article>
                </div>

                {/* Page Footer */}
                <div className="h-6 bg-black/5 border-t border-black/10 flex items-center px-4 justify-center">
                    <span className="text-[7px] font-mono opacity-30 uppercase tracking-widest">
                        {formats[format].label}
                    </span>
                </div>
            </motion.div>
        )
    }

    return (
        <div className="h-full w-full bg-zinc-800/50 flex flex-col overflow-hidden">
            {/* Controls Bar */}
            <div className="flex-shrink-0 p-4 flex items-center justify-center gap-6 border-b-2 border-zinc-700">
                {/* Page Geometry */}
                <div className="neo-card py-2 px-4 flex items-center gap-4">
                    <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">Size</div>
                    <div className="flex gap-1">
                        {(Object.keys(formats) as Format[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFormat(f)}
                                className={`px-2 py-1 text-[9px] font-mono border-2 transition-all ${format === f
                                    ? 'bg-base text-white border-black'
                                    : 'bg-zinc-200 text-zinc-600 border-transparent hover:border-zinc-300'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* View Mode */}
                <div className="neo-card py-2 px-4 flex items-center gap-4">
                    <div className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">View</div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => setViewMode('single')}
                            className={`p-2 border-2 transition-all ${viewMode === 'single'
                                ? 'bg-base text-white border-black'
                                : 'bg-zinc-200 text-zinc-600 border-transparent hover:border-zinc-300'
                                }`}
                            title="Single Page"
                        >
                            <Book size={14} />
                        </button>
                        <button
                            onClick={() => { setViewMode('spread'); setCurrentPage(currentPage % 2 === 0 ? currentPage : currentPage - 1) }}
                            className={`p-2 border-2 transition-all ${viewMode === 'spread'
                                ? 'bg-base text-white border-black'
                                : 'bg-zinc-200 text-zinc-600 border-transparent hover:border-zinc-300'
                                }`}
                            title="Two-Page Spread"
                        >
                            <BookOpen size={14} />
                        </button>
                    </div>
                </div>

                {/* Page Navigation */}
                <div className="neo-card py-2 px-4 flex items-center gap-3">
                    <button
                        onClick={prevPage}
                        disabled={currentPage === 0}
                        className="p-1 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <div className="text-[10px] font-mono text-zinc-600 min-w-[60px] text-center">
                        {viewMode === 'spread'
                            ? `${currentPage + 1}-${Math.min(currentPage + 2, totalPages)} / ${totalPages}`
                            : `${currentPage + 1} / ${totalPages}`
                        }
                    </div>
                    <button
                        onClick={nextPage}
                        disabled={viewMode === 'spread' ? currentPage + 2 >= totalPages : currentPage + 1 >= totalPages}
                        className="p-1 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>

            {/* Book Display Area */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
                <div className={`flex ${viewMode === 'spread' ? 'gap-1' : ''}`}>
                    {viewMode === 'single' ? (
                        <PageComponent pageNum={currentPage} />
                    ) : (
                        <>
                            <PageComponent pageNum={currentPage} isLeft={true} />
                            <PageComponent pageNum={currentPage + 1} isLeft={false} />
                        </>
                    )}
                </div>
            </div>

            {/* Keyboard hints */}
            <div className="flex-shrink-0 py-2 px-4 border-t-2 border-zinc-700 flex justify-center">
                <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                    Use ← → arrows or click buttons to navigate pages
                </div>
            </div>
        </div>
    )
}
