import { motion } from 'framer-motion'
import { Stage } from '../App'
import { FileText, Eye, Layout, ChevronRight } from 'lucide-react'
import { Chapter } from '../lib/shredder'

interface TheSpineProps {
    activeStage: Stage
    onStageChange: (stage: Stage) => void
    chapters: Chapter[]
    selectedChapterIndex: number
    onSelectChapter: (index: number) => void
}

export default function TheSpine({ activeStage, onStageChange, chapters, selectedChapterIndex, onSelectChapter }: TheSpineProps) {
    // Calculate word count for each chapter
    const getWordCount = (content: string) => content.split(/\s+/).filter(w => w.length > 0).length

    const totalWords = chapters.reduce((acc, ch) => acc + getWordCount(ch.content), 0)

    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Tab Selectors */}
            <div className="flex neo-border border-x-0 border-t-0 bg-zinc-950 p-2 gap-2">
                <TabButton
                    active={activeStage === 'WRITE'}
                    onClick={() => onStageChange('WRITE')}
                    icon={<FileText size={16} />}
                    label="Write"
                />
                <TabButton
                    active={activeStage === 'PREVIEW'}
                    onClick={() => onStageChange('PREVIEW')}
                    icon={<Eye size={16} />}
                    label="Preview"
                />
                <TabButton
                    active={activeStage === 'STRUCTURE'}
                    onClick={() => onStageChange('STRUCTURE')}
                    icon={<Layout size={16} />}
                    label="Structure"
                />
            </div>

            {/* File Tree */}
            <div className="flex-1 overflow-y-auto pt-6 space-y-1">
                <div className="px-4 mb-4 flex items-center justify-between">
                    <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Chapters</h3>
                    <span className="text-[10px] font-mono text-accent">
                        {totalWords.toLocaleString()} Words Total
                    </span>
                </div>

                {chapters.length === 0 && (
                    <div className="px-4 py-8 text-center border-2 border-dashed border-zinc-800 m-4">
                        <p className="text-[10px] font-mono text-zinc-600 uppercase">No chapters loaded</p>
                    </div>
                )}

                {chapters.map((ch, idx) => {
                    const wordCount = getWordCount(ch.content)
                    const isSelected = idx === selectedChapterIndex

                    return (
                        <motion.div
                            key={ch.id}
                            whileHover={{ x: 4 }}
                            onClick={() => onSelectChapter(idx)}
                            className={`group flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-l-2 ${isSelected
                                    ? 'bg-zinc-900 border-accent'
                                    : 'border-transparent hover:bg-zinc-900 hover:border-accent/50'
                                }`}
                        >
                            <div className={`text-[10px] font-mono ${isSelected ? 'text-accent' : 'text-zinc-600 group-hover:text-accent'}`}>
                                CH{ch.id}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={`text-sm font-sans font-bold truncate ${isSelected ? 'text-white' : 'group-hover:text-white'}`}>
                                    {ch.title}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="text-[10px] font-mono text-zinc-500">{wordCount.toLocaleString()} words</div>
                                </div>
                            </div>
                            <ChevronRight size={14} className={`transition-all ${isSelected
                                    ? 'text-accent opacity-100'
                                    : 'text-zinc-700 group-hover:text-accent translate-x-2 opacity-0 group-hover:opacity-100'
                                }`} />
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}

function TabButton({ active, onClick, icon, label }: {
    active: boolean,
    onClick: () => void,
    icon: React.ReactNode,
    label: string
}) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-[10px] font-mono uppercase tracking-tighter transition-all ${active
                    ? 'bg-accent text-base font-bold'
                    : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    )
}
