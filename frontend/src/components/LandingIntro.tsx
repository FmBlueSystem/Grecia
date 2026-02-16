import { useEffect, useRef, useState } from 'react';

export default function LandingIntro({ onComplete }: { onComplete: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [status, setStatus] = useState('init');
    const [fade, setFade] = useState(false);

    useEffect(() => {
        // Load Fonts
        const link = document.createElement('link');
        link.href = "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@100;300;400;700&family=JetBrains+Mono:wght@100;300;400&display=swap";
        link.rel = "stylesheet";
        document.head.appendChild(link);

        return () => {
            document.head.removeChild(link);
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles: any[] = [];
        const particleCount = 150;
        let animationFrameId: number;

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            color: string;
            alpha: number;

            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2;
                this.color = Math.random() > 0.8 ? '#60a5fa' : '#ffffff';
                this.alpha = Math.random() * 0.5;
            }

            update(currentStatus: string) {
                this.x += this.vx;
                this.y += this.vy;

                if (currentStatus === 'assemble') {
                    const dx = (canvas!.width / 2) - this.x;
                    const dy = (canvas!.height / 2) - this.y;
                    this.vx += dx * 0.00001;
                    this.vy += dy * 0.00001;
                }

                if (this.x < 0 || this.x > canvas!.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas!.height) this.vy *= -1;
            }

            draw() {
                if (!ctx) return;
                ctx.save();
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        // Initialize particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            particles.forEach(p => {
                p.update(status);
                p.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        // Animation Sequence - SPEEDED UP (50%)
        // 1. Assemble (0.2s)
        const t1 = setTimeout(() => {
            setStatus('assemble');
        }, 200);

        // 2. Fade Out (2.2s)
        const t2 = setTimeout(() => {
            setFade(true);
        }, 2200);

        // 3. Complete/Redirect (2.9s)
        const t3 = setTimeout(() => {
            onComplete();
        }, 2900);

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [status, onComplete]);

    return (
        <div className={`fixed inset-0 z-[100] bg-black transition-all duration-700 ${fade ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'}`}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@100;300;400;700&family=JetBrains+Mono:wght@100;300;400&display=swap');
                
                .font-orbitron { font-family: 'Orbitron', sans-serif; }
                .font-mono { font-family: 'JetBrains Mono', monospace; }
                
                @keyframes scanline {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }

                .scan-line {
                    position: absolute;
                    width: 100%;
                    height: 100px;
                    background: linear-gradient(to bottom, transparent, rgba(59, 130, 246, 0.05), transparent);
                    animation: scanline 4s linear infinite;
                    pointer-events: none;
                    z-index: 50;
                }

                .hero-blue {
                    transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
                    transform: translateX(-80px);
                    opacity: 0;
                }

                .hero-blue.assemble {
                    transform: translateX(0);
                    opacity: 1;
                }

                .hero-system {
                    transition: all 1.1s cubic-bezier(0.16, 1, 0.3, 1);
                    transform: translateX(80px);
                    opacity: 0;
                }

                .hero-system.assemble {
                    transform: translateX(0);
                    opacity: 1;
                }

                .hero-io {
                    transition: all 1.2s ease-out;
                    transition-delay: 0.15s;
                    transform: translateY(40px);
                    opacity: 0;
                }

                .hero-io.assemble {
                    transform: translateY(0);
                    opacity: 0.3;
                }

                .hero-subtitle {
                    transition: all 2s ease-out;
                    transition-delay: 0.25s;
                    transform: translateY(100%);
                    opacity: 0;
                }

                .hero-subtitle.assemble {
                    transform: translateY(0);
                    opacity: 1;
                }

                .hero-line {
                    transition: all 1.2s ease-out;
                    transition-delay: 0.5s;
                    width: 0;
                    opacity: 0;
                }

                .hero-line.assemble {
                    width: 100%;
                    opacity: 1;
                }

                .glow-bg {
                    transition: all 1.5s ease-out;
                    opacity: 0;
                    transform: scale(0.5);
                }

                .glow-bg.assemble {
                    opacity: 1;
                    transform: scale(1.25);
                }
            `}</style>

            <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">
                <canvas ref={canvasRef} className="absolute inset-0 z-0"></canvas>
                <div className="scan-line"></div>

                <div className={`glow-bg absolute w-[800px] h-[400px] bg-blue-600/10 blur-[150px] rounded-full ${status === 'assemble' ? 'assemble' : ''}`}></div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="flex items-center space-x-0">
                        <div className={`hero-blue ${status === 'assemble' ? 'assemble' : ''}`}>
                            <h1 className="font-orbitron text-7xl md:text-9xl font-black tracking-[-0.05em] bg-gradient-to-b from-white to-neutral-500 bg-clip-text text-transparent">
                                Blue
                            </h1>
                        </div>

                        <div className={`hero-system ${status === 'assemble' ? 'assemble' : ''}`}>
                            <h1 className="font-orbitron text-7xl md:text-9xl font-black italic tracking-[-0.02em] text-blue-600 drop-shadow-2xl" style={{ filter: 'drop-shadow(0 0 40px rgba(37,99,235,0.4))' }}>
                                System
                            </h1>
                        </div>

                        <div className={`hero-io ${status === 'assemble' ? 'assemble' : ''}`}>
                            <span className="font-mono text-3xl md:text-5xl font-extralight ml-4 text-white">.IO</span>
                        </div>
                    </div>

                    <div className="relative h-12 mt-4 overflow-hidden w-full flex justify-center">
                        <p className={`hero-subtitle font-orbitron text-[10px] uppercase font-bold tracking-[2.5em] text-blue-400/50 ${status === 'assemble' ? 'assemble' : ''}`}>
                            Arquitectura de Software
                        </p>

                        <div className={`hero-line absolute bottom-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent ${status === 'assemble' ? 'assemble' : ''}`}></div>
                    </div>
                </div>

                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 50%, transparent 20%, black 100%)' }}></div>

                {/* Noise Texture */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}></div>
            </div>
        </div>
    );
}
