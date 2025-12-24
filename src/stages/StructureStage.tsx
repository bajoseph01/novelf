import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function StructureStage() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Resize canvas
        const resize = () => {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio
            canvas.height = canvas.offsetHeight * window.devicePixelRatio
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
            draw()
        }

        const draw = () => {
            const w = canvas.width / window.devicePixelRatio
            const h = canvas.height / window.devicePixelRatio
            ctx.clearRect(0, 0, w, h)

            // Grid
            ctx.strokeStyle = '#222'
            ctx.lineWidth = 1
            for (let i = 0; i < 10; i++) {
                const y = (h / 10) * i
                ctx.beginPath()
                ctx.moveTo(0, y)
                ctx.lineTo(w, y)
                ctx.stroke()
            }

            // X-Axis Chapter Markers
            for (let i = 0; i < 5; i++) {
                const x = (w / 5) * i
                ctx.beginPath()
                ctx.moveTo(x, 0)
                ctx.lineTo(x, h)
                ctx.stroke()

                ctx.fillStyle = '#666'
                ctx.font = '10px Space Mono'
                ctx.fillText(`CH 0${i + 1}`, x + 10, h - 10)
            }

            // Y-Axis Intent (Blue Line)
            ctx.strokeStyle = 'blue'
            ctx.lineWidth = 3
            ctx.beginPath()
            ctx.moveTo(0, h * 0.8)
            ctx.bezierCurveTo(w * 0.3, h * 0.2, w * 0.6, h * 0.5, w, h * 0.1)
            ctx.stroke()

            // Y-Axis AI Pulse (Surgical Teal)
            ctx.strokeStyle = '#00FFD1'
            ctx.lineWidth = 3
            ctx.setLineDash([5, 5])
            ctx.beginPath()
            ctx.moveTo(0, h * 0.85)
            ctx.bezierCurveTo(w * 0.25, h * 0.4, w * 0.7, h * 0.6, w, h * 0.3)
            ctx.stroke()
            ctx.setLineDash([])

            // Legend
            drawLegend(ctx, 40, 40, 'blue', 'Author Intent')
            drawLegend(ctx, 40, 65, '#00FFD1', 'AI Pulse')
        }

        const drawLegend = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, text: string) => {
            ctx.fillStyle = color
            ctx.fillRect(x, y - 5, 20, 3)
            ctx.fillStyle = '#F5F5F7'
            ctx.font = '10px Space Mono'
            ctx.fillText(text.toUpperCase(), x + 30, y)
        }

        window.addEventListener('resize', resize)
        resize()
        return () => window.removeEventListener('resize', resize)
    }, [])

    return (
        <div className="h-full w-full bg-base flex flex-col p-8 lg:p-12">
            <header className="mb-12 flex justify-between items-end">
                <div>
                    <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-1">Dual-Layer Linear Timeline</div>
                    <h1 className="text-4xl font-sans font-black uppercase text-white">Narrative Tension Map</h1>
                </div>
                <div className="flex gap-4">
                    {['Character Pulse', 'Sensory Density', 'Continuity'].map(tag => (
                        <div key={tag} className="neo-card bg-zinc-900 border-zinc-700 font-mono text-[9px] px-3 py-1 uppercase text-zinc-400 group cursor-pointer hover:border-accent hover:text-white transition-all">
                            {tag}
                        </div>
                    ))}
                </div>
            </header>

            <div className="flex-1 neo-border bg-zinc-950 relative overflow-hidden">
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

                {/* Delta Overlay Simulation */}
                <div className="absolute top-1/2 left-1/3 p-4 neo-card bg-accent/10 border-accent/30 text-accent font-mono text-[10px] uppercase backdrop-blur-sm pointer-events-none">
                    Tension Gap Detected: Chapter 03
                    <br />AI predicts pacing lull vs. Author Intent.
                </div>
            </div>
        </div>
    )
}
