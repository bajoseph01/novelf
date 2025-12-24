import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Zap, Eye, ShieldAlert, Send } from 'lucide-react'

export default function WhisperBar() {
    const [isExpanded, setIsExpanded] = useState(false)

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] flex justify-center pb-6 px-6 pointer-events-none">
            <motion.div
                layout
                initial={false}
                animate={{
                    height: isExpanded ? '300px' : '48px',
                    width: isExpanded ? '600px' : '280px',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="neo-card bg-base neo-border border-accent shadow-[0px_8px_32px_rgba(0,255,209,0.2)] pointer-events-auto flex flex-col overflow-hidden"
            >
                {/* Header / Click to Expand Area */}
                <div
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-[48px] min-h-[48px] flex items-center px-4 cursor-pointer gap-3 hover:bg-zinc-900 transition-colors"
                >
                    <Sparkles size={16} className="text-accent" />
                    <span className="flex-1 font-mono text-[10px] uppercase tracking-widest text-accent font-bold">
                        Whisper Bar / AI Context Aware
                    </span>
                    <div className="flex gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex flex-col p-4 space-y-4"
                        >
                            {/* Quick Actions */}
                            <div className="grid grid-cols-3 gap-2">
                                <ActionButton icon={<Zap size={14} />} label="Tighten Pacing" />
                                <ActionButton icon={<Eye size={14} />} label="Enhance Imagery" />
                                <ActionButton icon={<ShieldAlert size={14} />} label="Check Continuity" />
                            </div>

                            {/* Chat Area Simulation */}
                            <div className="flex-1 bg-zinc-950 border border-zinc-800 p-3 overflow-y-auto">
                                <div className="space-y-3">
                                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">Gemini v2.0</div>
                                    <div className="text-xs font-serif text-zinc-300 leading-relaxed italic">
                                        "I've analyzed the current chapter. The transition between the city overlook and the atelier interior feels slightly abrupt. Would you like me to generate a sensory bridge focusing on the 'smell of ozone'?"
                                    </div>
                                </div>
                            </div>

                            {/* Input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Ask the Muse..."
                                    className="flex-1 bg-zinc-900 border border-zinc-700 px-3 py-2 text-[11px] font-mono text-white outline-none focus:border-accent transition-colors"
                                />
                                <button className="bg-accent text-base px-3 py-2 hover:bg-white transition-colors">
                                    <Send size={14} />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    )
}

function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <button className="flex flex-col items-center justify-center gap-2 border border-zinc-800 p-2 hover:border-accent hover:bg-zinc-900 transition-all group">
            <div className="text-zinc-500 group-hover:text-accent font-bold">{icon}</div>
            <span className="text-[9px] font-mono uppercase text-zinc-600 group-hover:text-white tracking-tighter text-center">
                {label}
            </span>
        </button>
    )
}
