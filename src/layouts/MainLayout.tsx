import { ReactNode } from 'react'
import TheSpine from '../components/TheSpine'
import { Stage } from '../App'
import { Chapter } from '../lib/shredder'

interface MainLayoutProps {
    children: ReactNode
    activeStage: Stage
    onStageChange: (stage: Stage) => void
    chapters: Chapter[]
    selectedChapterIndex: number
    onSelectChapter: (index: number) => void
}

export default function MainLayout({
    children,
    activeStage,
    onStageChange,
    chapters,
    selectedChapterIndex,
    onSelectChapter
}: MainLayoutProps) {
    return (
        <div className="h-screen w-screen flex flex-col bg-base overflow-hidden">
            {/* Top Header / App Shell */}
            <header className="h-14 neo-border border-t-0 border-x-0 bg-base flex items-center px-6 justify-between">
                <h2 className="text-xl font-mono font-bold tracking-widest text-accent uppercase">
                    NovelForge / Atelier / v3.0
                </h2>
                <div className="flex gap-4">
                    <div className="text-xs font-mono text-zinc-500 uppercase flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse-slow" />
                        Local-First: Active
                    </div>
                </div>
            </header>

            {/* Main Content Area: 25/75 Asymmetrical Split */}
            <div className="flex-1 flex overflow-hidden">
                {/* The Spine (25%) */}
                <aside className="w-1/4 neo-border border-y-0 border-l-0 bg-base min-w-[300px] flex flex-col">
                    <TheSpine
                        activeStage={activeStage}
                        onStageChange={onStageChange}
                        chapters={chapters}
                        selectedChapterIndex={selectedChapterIndex}
                        onSelectChapter={onSelectChapter}
                    />
                </aside>

                {/* The Anvil (75%) */}
                <main className="flex-1 bg-zinc-900 overflow-hidden relative">
                    {children}
                </main>
            </div>
        </div>
    )
}
