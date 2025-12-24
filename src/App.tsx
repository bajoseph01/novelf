import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MainLayout from './layouts/MainLayout'
import WriteStage from './stages/WriteStage'
import PreviewStage from './stages/PreviewStage'
import StructureStage from './stages/StructureStage'
import WhisperBar from './components/WhisperBar'
import { decomposeManuscript, Chapter } from './lib/shredder'
import { getDirectoryHandle, writeFile } from './lib/fs'
import {
    saveProject,
    getRecentProjects,
    requestFolderPermission,
    readProjectFiles,
    ProjectMeta,
    deleteProject
} from './lib/db'
import { Upload, FolderOpen, Loader2, Clock, Trash2, BookOpen, FileText } from 'lucide-react'

export type Stage = 'WRITE' | 'PREVIEW' | 'STRUCTURE'

function App() {
    const [activeStage, setActiveStage] = useState<Stage>('WRITE')
    const [isProjectLoaded, setIsProjectLoaded] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [chapters, setChapters] = useState<Chapter[]>([])
    const [selectedChapterIndex, setSelectedChapterIndex] = useState(0)
    const [recentProjects, setRecentProjects] = useState<ProjectMeta[]>([])
    const [currentProjectHandle, setCurrentProjectHandle] = useState<FileSystemDirectoryHandle | null>(null)

    // Two-step shredding state
    const [pendingFile, setPendingFile] = useState<File | null>(null)
    const [showDirectoryPrompt, setShowDirectoryPrompt] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)

    // Load recent projects on mount
    useEffect(() => {
        getRecentProjects().then(setRecentProjects).catch(console.error)
    }, [])

    // Step 1: User selects file
    const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Store the file and show directory prompt
        setPendingFile(file)
        setShowDirectoryPrompt(true)
    }

    // Step 2: User clicks to select directory (direct user gesture)
    const handleSelectDirectory = async () => {
        if (!pendingFile) return

        setIsProcessing(true)
        setShowDirectoryPrompt(false)

        try {
            // This is now a direct user gesture
            const dirHandle = await getDirectoryHandle()
            if (!dirHandle) {
                setIsProcessing(false)
                setPendingFile(null)
                return
            }

            const text = await pendingFile.text()
            const decomposed = decomposeManuscript(text)

            // Write each chapter to disk
            for (const ch of decomposed) {
                const filename = `Ch${ch.id} - ${ch.title}.md`
                await writeFile(dirHandle, filename, ch.content)
            }

            // Calculate total words
            const totalWords = decomposed.reduce(
                (acc, ch) => acc + ch.content.split(/\s+/).length,
                0
            )

            // Save project to IndexedDB
            const projectId = crypto.randomUUID()
            await saveProject({
                id: projectId,
                name: dirHandle.name,
                folderHandle: dirHandle,
                chapterCount: decomposed.length,
                totalWords,
                lastOpened: Date.now(),
                createdAt: Date.now()
            })

            setChapters(decomposed)
            setCurrentProjectHandle(dirHandle)
            setPendingFile(null)
            setIsProjectLoaded(true)
        } catch (error) {
            console.error('Shredding failed:', error)
            alert('Shredding failed. See console for details.')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleCancelShred = () => {
        setPendingFile(null)
        setShowDirectoryPrompt(false)
    }

    const handleOpenExistingFolder = async () => {
        setIsProcessing(true)
        try {
            const dirHandle = await getDirectoryHandle()
            if (!dirHandle) {
                setIsProcessing(false)
                return
            }

            // Read all .md files from the folder
            const files = await readProjectFiles(dirHandle)

            if (files.length === 0) {
                alert('No .md files found in this folder.')
                setIsProcessing(false)
                return
            }

            // Convert to Chapter format
            const loadedChapters: Chapter[] = files.map((f, idx) => {
                // Try to extract chapter ID and title from filename
                const match = f.name.match(/Ch(\d+)\s*-\s*(.+)\.md/i)
                return {
                    id: match ? match[1] : String(idx + 1).padStart(2, '0'),
                    title: match ? match[2] : f.name.replace('.md', ''),
                    content: f.content
                }
            })

            // Calculate total words
            const totalWords = loadedChapters.reduce(
                (acc, ch) => acc + ch.content.split(/\s+/).length,
                0
            )

            // Save/update project in IndexedDB
            const projectId = crypto.randomUUID()
            await saveProject({
                id: projectId,
                name: dirHandle.name,
                folderHandle: dirHandle,
                chapterCount: loadedChapters.length,
                totalWords,
                lastOpened: Date.now(),
                createdAt: Date.now()
            })

            setChapters(loadedChapters)
            setCurrentProjectHandle(dirHandle)
            setIsProjectLoaded(true)
        } catch (error) {
            console.error('Failed to open folder:', error)
            alert('Failed to open folder. See console for details.')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleOpenRecentProject = async (project: ProjectMeta) => {
        setIsProcessing(true)
        try {
            // Request permission for the stored folder handle
            const hasPermission = await requestFolderPermission(project.folderHandle)
            if (!hasPermission) {
                alert('Permission denied. Please grant access to continue.')
                setIsProcessing(false)
                return
            }

            // Read files from the folder
            const files = await readProjectFiles(project.folderHandle)

            const loadedChapters: Chapter[] = files.map((f, idx) => {
                const match = f.name.match(/Ch(\d+)\s*-\s*(.+)\.md/i)
                return {
                    id: match ? match[1] : String(idx + 1).padStart(2, '0'),
                    title: match ? match[2] : f.name.replace('.md', ''),
                    content: f.content
                }
            })

            // Update lastOpened
            await saveProject({
                ...project,
                lastOpened: Date.now(),
                chapterCount: loadedChapters.length,
                totalWords: loadedChapters.reduce((acc, ch) => acc + ch.content.split(/\s+/).length, 0)
            })

            setChapters(loadedChapters)
            setCurrentProjectHandle(project.folderHandle)
            setIsProjectLoaded(true)
        } catch (error) {
            console.error('Failed to open recent project:', error)
            alert('Failed to open project. The folder may have been moved or deleted.')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
        e.stopPropagation()
        if (confirm('Remove this project from recent list?')) {
            await deleteProject(projectId)
            setRecentProjects(prev => prev.filter(p => p.id !== projectId))
        }
    }

    // Initial State: The Shredder
    if (!isProjectLoaded) {
        return (
            <div className="h-screen w-screen bg-base flex items-center justify-center p-8">
                {/* Directory Selection Modal */}
                <AnimatePresence>
                    {showDirectoryPrompt && pendingFile && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="neo-card p-8 max-w-md w-full text-center space-y-6"
                            >
                                <div className="flex justify-center">
                                    <div className="w-16 h-16 bg-accent flex items-center justify-center neo-border">
                                        <FileText className="text-base" size={32} />
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-2xl font-sans font-black uppercase mb-2">File Ready</h2>
                                    <p className="text-sm font-mono text-zinc-600 break-all">{pendingFile.name}</p>
                                </div>

                                <p className="text-sm font-serif text-zinc-500">
                                    Now select a folder where the shredded chapters will be saved.
                                </p>

                                <div className="flex gap-3 justify-center pt-4">
                                    <button
                                        onClick={handleCancelShred}
                                        className="px-6 py-3 border-2 border-zinc-300 font-sans font-bold uppercase text-sm hover:bg-zinc-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSelectDirectory}
                                        className="neo-card bg-accent text-base px-6 py-3 font-sans font-bold uppercase text-sm hover:bg-white transition-colors flex items-center gap-2"
                                    >
                                        <FolderOpen size={16} />
                                        Choose Folder
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="neo-card p-12 max-w-6xl w-full text-center space-y-8"
                >
                    <div className="flex justify-center">
                        <div className="w-20 h-20 bg-accent flex items-center justify-center neo-border">
                            {isProcessing ? <Loader2 className="animate-spin text-base" size={40} /> : <Upload className="text-base" size={40} />}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-6xl font-sans uppercase font-black tracking-tighter">The Shredder</h1>
                        <p className="text-sm font-mono text-accent uppercase tracking-widest">v3.0 Engine / Anti-Slop Protocol</p>
                    </div>

                    <p className="text-xl font-serif text-zinc-400 italic">
                        "Feed your manuscript to the machine. AI-powered chapter decomposition and local-first architecture await."
                    </p>

                    <div className="pt-4 flex flex-col items-center gap-4">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".md,.txt"
                            onChange={handleFileSelection}
                        />

                        <div className="flex gap-4">
                            <button
                                disabled={isProcessing}
                                onClick={() => fileInputRef.current?.click()}
                                className="neo-card bg-accent text-base px-8 py-4 font-sans font-bold text-lg uppercase rounded-none hover:bg-white active:translate-y-1 transition-all flex items-center gap-3 group"
                            >
                                <Upload size={20} />
                                <span>{isProcessing ? 'Processing...' : 'Shred Draft'}</span>
                            </button>

                            <button
                                disabled={isProcessing}
                                onClick={handleOpenExistingFolder}
                                className="neo-card bg-surface text-base px-8 py-4 font-sans font-bold text-lg uppercase rounded-none hover:bg-zinc-200 active:translate-y-1 transition-all flex items-center gap-3 group"
                            >
                                <FolderOpen size={20} />
                                <span>Open Folder</span>
                            </button>
                        </div>

                        <p className="text-[10px] font-mono text-zinc-600 uppercase">
                            Note: This will request permission to read/write a local folder.
                        </p>
                    </div>

                    {/* Recent Projects */}
                    {recentProjects.length > 0 && (
                        <div className="pt-8 border-t-2 border-zinc-800">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Clock size={14} className="text-zinc-500" />
                                <h3 className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Recent Projects</h3>
                            </div>
                            <div className="grid gap-2">
                                {recentProjects.map((project) => (
                                    <motion.div
                                        key={project.id}
                                        whileHover={{ x: 4 }}
                                        onClick={() => handleOpenRecentProject(project)}
                                        className="flex items-center justify-between p-3 bg-zinc-900 border-2 border-zinc-800 hover:border-accent cursor-pointer transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <BookOpen size={16} className="text-zinc-600 group-hover:text-accent" />
                                            <div className="text-left">
                                                <div className="font-sans font-bold text-sm group-hover:text-white">{project.name}</div>
                                                <div className="text-[10px] font-mono text-zinc-600">
                                                    {project.chapterCount} chapters · {project.totalWords.toLocaleString()} words
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] font-mono text-zinc-700">
                                                {new Date(project.lastOpened).toLocaleDateString()}
                                            </span>
                                            <button
                                                onClick={(e) => handleDeleteProject(e, project.id)}
                                                className="text-zinc-700 hover:text-red-500 transition-colors p-1"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        )
    }

    return (
        <MainLayout
            activeStage={activeStage}
            onStageChange={setActiveStage}
            chapters={chapters}
            selectedChapterIndex={selectedChapterIndex}
            onSelectChapter={setSelectedChapterIndex}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeStage}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="h-full w-full"
                >
                    {activeStage === 'WRITE' && (
                        <WriteStage
                            chapters={chapters}
                            selectedChapterIndex={selectedChapterIndex}
                            onChapterChange={(idx, content) => {
                                setChapters(prev => prev.map((ch, i) => i === idx ? { ...ch, content } : ch))
                            }}
                        />
                    )}
                    {activeStage === 'PREVIEW' && (
                        <PreviewStage
                            chapters={chapters}
                            selectedChapterIndex={selectedChapterIndex}
                        />
                    )}
                    {activeStage === 'STRUCTURE' && <StructureStage />}
                </motion.div>
            </AnimatePresence>

            <WhisperBar />
        </MainLayout>
    )
}

export default App
