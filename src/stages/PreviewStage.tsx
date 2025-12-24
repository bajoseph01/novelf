import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Chapter } from '../lib/shredder'
import { Book, BookOpen, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react'

type Format = '5x8' | '5.5x8.5' | '6x9'

const formats: Record<Format, { w: number; h: number; label: string }> = {
    '5x8': { w: 320, h: 512, label: 'Mass Market' },
    '5.5x8.5': { w: 352, h: 544, label: 'Trade Paperback' },
    '6x9': { w: 384, h: 576, label: 'Hardcover Standard' },
}

interface PreviewStageProps {
    chapters: Chapter[]
    selectedChapterIndex: number
}

interface PageData {
    pageNum: number
    content: string[]
    title: string
}

export default function PreviewStage({ chapters, selectedChapterIndex }: PreviewStageProps) {
    const [format, setFormat] = useState<Format>('5.5x8.5')
    const [currentLeafIndex, setCurrentLeafIndex] = useState(0)
    const [soundEnabled, setSoundEnabled] = useState(true)

    const currentChapter = chapters[selectedChapterIndex]
    const { w, h } = formats[format]

    // Reset when switching chapters
    useEffect(() => {
        setCurrentLeafIndex(0)
    }, [selectedChapterIndex])

    // Audio ref
    const audioRef = useRef<HTMLAudioElement | null>(null)

    // Initialize audio
    useEffect(() => {
        audioRef.current = new Audio('/page-flip.mp3')
        audioRef.current.volume = 0.4
    }, [])

    const playSound = () => {
        if (soundEnabled && audioRef.current) {
            audioRef.current.currentTime = 0
            audioRef.current.play().catch(err => console.log('Audio play failed', err))
        }
    }

    if (!currentChapter) {
        return (
            <div className="h-full w-full bg-[#121212] flex items-center justify-center">
                <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest">No chapter selected</p>
            </div>
        )
    }

    // --- Content Shredding Logic ---
    const paragraphs = currentChapter.content
        .replace(/\r\n/g, '\n')
        .split(/\n\s*\n/)
        .map(p => p.trim())
        .filter(p => {
            const clean = p.replace(/\[.*?\]/g, '').trim()
            return clean.length > 0 && !p.startsWith('---')
        })
        .map(p => {
            return p
                .replace(/^#+\s+/, '')
                .replace(/\*\*\*/g, '')
                .replace(/\*\*/g, '')
                .replace(/\*/g, '')
                .replace(/\[.*?\]/g, '')
                .trim()
        })
        .filter(p => {
            const isTitle = p.toLowerCase() === currentChapter.title.toLowerCase()
            const isChHeader = p.toLowerCase().includes(`chapter ${currentChapter.id}`)
            return p.length > 0 && !isTitle && !isChHeader
        })

    const paragraphsPerPage = format === '5x8' ? 4 : format === '5.5x8.5' ? 5 : 6
    const totalPages = Math.ceil(paragraphs.length / paragraphsPerPage)

    const pages: PageData[] = []
    for (let i = 0; i < totalPages; i++) {
        pages.push({
            pageNum: i,
            content: paragraphs.slice(i * paragraphsPerPage, (i + 1) * paragraphsPerPage),
            title: currentChapter.title
        })
    }

    const totalLeaves = Math.ceil(totalPages / 2)

    const nextLeaf = () => {
        if (currentLeafIndex < totalLeaves) {
            setCurrentLeafIndex(prev => prev + 1)
            playSound()
        }
    }

    const prevLeaf = () => {
        if (currentLeafIndex > 0) {
            setCurrentLeafIndex(prev => prev - 1)
            playSound()
        }
    }

    // --- COMPONENTS ---

    const PageContent = ({ page, isLeft }: { page: PageData; isLeft: boolean }) => {
        return (
            <div
                style={{ width: `${w}px`, height: `${h}px` }}
                className={`bg-[#FAFAFA] text-zinc-900 border border-black/10 flex flex-col relative overflow-hidden
                    ${isLeft ? 'rounded-l-sm' : 'rounded-r-sm shadow-inner-left'}
                `}
            >
                {/* Paper Texture */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

                {/* Spine Shadow */}
                <div className={`absolute top-0 bottom-0 w-8 pointer-events-none z-10 ${isLeft
                        ? 'right-0 bg-gradient-to-l from-black/10 to-transparent border-r border-black/5'
                        : 'left-0 bg-gradient-to-r from-black/10 to-transparent'
                    }`} />

                <div className="flex-1 p-8 px-10 overflow-hidden relative z-0 flex flex-col select-none">
                    <header className="flex justify-between items-center mb-6 border-b border-black/5 pb-2">
                        <span className="text-[7px] font-mono uppercase tracking-[0.2em] opacity-40">
                            {isLeft ? 'NOVELFORGE / ATELIER' : page.title}
                        </span>
                        <span className="text-[9px] font-mono font-bold opacity-30">{page.pageNum + 1}</span>
                    </header>

                    <article className="font-serif text-[15px] leading-[1.75] text-zinc-800 text-justify flex-1 overflow-hidden">
                        {page.pageNum === 0 && (
                            <h2 className="text-2xl font-black font-sans uppercase mb-6 tracking-tight border-l-4 border-accent pl-4">
                                {page.title}
                            </h2>
                        )}
                        {page.content.map((p, i) => (
                            <p key={i} className={`mb-4 ${page.pageNum === 0 && i === 0 ? 'first-letter:text-4xl first-letter:font-black first-letter:float-left first-letter:mr-2' : ''}`}>
                                {p}
                            </p>
                        ))}
                    </article>
                </div>

                <footer className="h-8 bg-black/5 flex items-center justify-center opacity-30 text-[6px] font-mono tracking-widest uppercase">
                    {formats[format].label}
                </footer>
            </div>
        )
    }

    const Leaf = ({ index }: { index: number }) => {
        const flipped = index < currentLeafIndex

        const frontPage = pages[index * 2]
        const backPage = pages[index * 2 + 1]

        if (!frontPage && !backPage) return null

        return (
            <motion.div
                initial={false}
                animate={{ rotateY: flipped ? -180 : 0 }}
                transition={{ duration: 0.8, ease: [0.645, 0.045, 0.355, 1] }}
                style={{
                    width: `${w}px`,
                    height: `${h}px`,
                    zIndex: flipped ? index + 1 : totalLeaves - index + 10,
                    transformStyle: 'preserve-3d',
                    transformOrigin: 'left center',
                    position: 'absolute',
                    left: '50%'
                }}
                className="leaf-container cursor-pointer"
                onClick={(e) => {
                    e.stopPropagation()
                    if (flipped) prevLeaf()
                    else nextLeaf()
                }}
            >
                {/* Front Side */}
                <div
                    className="absolute inset-0 backface-hidden"
                    style={{ backfaceVisibility: 'hidden', zIndex: 2 }}
                >
                    {frontPage ? (
                        <PageContent page={frontPage} isLeft={false} />
                    ) : (
                        <div style={{ width: `${w}px`, height: `${h}px` }} className="bg-zinc-100" />
                    )}
                </div>

                {/* Back Side */}
                <div
                    className="absolute inset-0 backface-hidden shadow-2xl"
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        zIndex: 1
                    }}
                >
                    {backPage ? (
                        <PageContent page={backPage} isLeft={true} />
                    ) : (
                        <div style={{ width: `${w}px`, height: `${h}px` }} className="bg-zinc-100" />
                    )}
                </div>
            </motion.div>
        )
    }

    return (
        <div className="h-full w-full bg-[#0a0a0a] flex flex-col overflow-hidden relative font-sans text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1a1a1a_0%,_#050505_100%)] opacity-80" />

            {/* Top Toolbar */}
            <div className="h-16 flex-shrink-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between px-8">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`p-2 rounded-full transition-all ${soundEnabled ? 'text-accent' : 'text-zinc-600'}`}
                    >
                        {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Size</span>
                        <div className="flex gap-1 bg-white/5 p-1 rounded-sm">
                            {(Object.keys(formats) as Format[]).map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFormat(f)}
                                    className={`px-3 py-1 text-[9px] font-mono rounded-sm transition-all ${format === f ? 'bg-accent text-black font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">
                        {currentLeafIndex} / {totalLeaves}
                    </span>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 relative flex items-center justify-center perspective-[2500px] overflow-hidden">
                {/* The Book Assembly */}
                <div
                    style={{
                        width: `${w * 2}px`,
                        height: `${h}px`,
                        transformStyle: 'preserve-3d',
                        position: 'relative'
                    }}
                    className="flex justify-center"
                >
                    {/* The Static Left Side (underneath everything) - Acts as the fixed back page */}
                    <div
                        className="absolute left-0 top-0 border border-white/5 bg-zinc-900 shadow-2xl"
                        style={{ width: `${w}px`, height: `${h}px`, zIndex: 0 }}
                    />

                    {/* The Leaves (start at the center) */}
                    {Array.from({ length: totalLeaves }).map((_, i) => (
                        <Leaf key={`${selectedChapterIndex}-${i}`} index={i} />
                    ))}
                </div>

                {/* Big Side Arrows */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-12 pointer-events-none z-50">
                    <button
                        onClick={(e) => { e.stopPropagation(); prevLeaf(); }}
                        disabled={currentLeafIndex === 0}
                        className="p-6 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all pointer-events-auto disabled:opacity-0 group"
                    >
                        <ChevronLeft size={48} className="text-zinc-500 group-hover:text-white transition-colors" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); nextLeaf(); }}
                        disabled={currentLeafIndex >= totalLeaves}
                        className="p-6 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all pointer-events-auto disabled:opacity-0 group"
                    >
                        <ChevronRight size={48} className="text-zinc-500 group-hover:text-white transition-colors" />
                    </button>
                </div>
            </div>

            <footer className="h-12 flex-shrink-0 z-50 border-t border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-center px-8 gap-8">
                <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.3em]">
                    Click pages or use arrows to flip
                </div>
            </footer>
        </div>
    )
}
