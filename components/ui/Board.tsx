import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, BOARD_SPACES } from '../../store/useGameStore';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Car, Zap, Droplets, Plane, Play, Lock, Siren, Send, ArrowRight, Sparkles, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Coins, Palmtree, Gavel, Home, DollarSign, Shuffle, RefreshCw, Volume2, VolumeX, Volume1 } from 'lucide-react';
import { useTexture } from '@react-three/drei';

const getGridArea = (id: number) => {
    if (id === 0) return { gridRow: 1, gridColumn: 1 };
    if (id >= 1 && id <= 9) return { gridRow: 1, gridColumn: 1 + id };
    if (id === 10) return { gridRow: 1, gridColumn: 11 };
    if (id >= 11 && id <= 19) return { gridRow: 1 + (id - 10), gridColumn: 11 };
    if (id === 20) return { gridRow: 11, gridColumn: 11 };
    if (id >= 21 && id <= 29) return { gridRow: 11, gridColumn: 11 - (id - 20) };
    if (id === 30) return { gridRow: 11, gridColumn: 1 };
    if (id >= 31 && id <= 39) return { gridRow: 11 - (id - 30), gridColumn: 1 };
    return { gridRow: 1, gridColumn: 1 };
};

// ============================================================
// BEAUTIFUL SVG TOKEN COMPONENT
// ============================================================
const TOKEN_SHAPES: Record<string, (color: string, size: number) => React.ReactNode> = {
    sphere: (color, s) => (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
            <defs>
                <radialGradient id={`sg-${color}`} cx="35%" cy="30%" r="60%">
                    <stop offset="0%" stopColor="#fff" stopOpacity="0.9" />
                    <stop offset="40%" stopColor={color} stopOpacity="1" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.5" />
                </radialGradient>
            </defs>
            <circle cx="20" cy="20" r="17" fill={`url(#sg-${color})`} />
            <ellipse cx="14" cy="14" rx="5" ry="4" fill="white" opacity="0.35" transform="rotate(-20,14,14)" />
        </svg>
    ),
    cube: (color, s) => (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
            <defs>
                <linearGradient id={`cg-${color}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="1" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.4" />
                </linearGradient>
            </defs>
            <polygon points="20,5 35,13 35,27 20,35 5,27 5,13" fill={`url(#cg-${color})`} stroke={color} strokeWidth="1" />
            <polygon points="20,5 35,13 20,21 5,13" fill={color} opacity="0.7" />
            <polygon points="20,21 35,13 35,27 20,35" fill={color} opacity="0.4" />
            <ellipse cx="14" cy="10" rx="3" ry="2" fill="white" opacity="0.4" transform="rotate(-30,14,10)" />
        </svg>
    ),
    cylinder: (color, s) => (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
            <defs>
                <linearGradient id={`cyg-${color}`} x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor={color} stopOpacity="0.5" />
                    <stop offset="40%" stopColor={color} stopOpacity="1" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.4" />
                </linearGradient>
            </defs>
            <rect x="8" y="14" width="24" height="18" rx="2" fill={`url(#cyg-${color})`} />
            <ellipse cx="20" cy="14" rx="12" ry="5" fill={color} />
            <ellipse cx="20" cy="14" rx="7" ry="2.5" fill="white" opacity="0.3" />
            <ellipse cx="20" cy="32" rx="12" ry="5" fill={color} opacity="0.6" />
        </svg>
    ),
    car: (color, s) => (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
            <defs>
                <linearGradient id={`carg-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} />
                    <stop offset="100%" stopColor={color} stopOpacity="0.6" />
                </linearGradient>
            </defs>
            <rect x="4" y="22" width="32" height="10" rx="3" fill={`url(#carg-${color})`} />
            <rect x="9" y="14" width="22" height="10" rx="4" fill={color} />
            <rect x="11" y="15" width="8" height="6" rx="2" fill="#a0d8ef" opacity="0.8" />
            <rect x="21" y="15" width="8" height="6" rx="2" fill="#a0d8ef" opacity="0.8" />
            <circle cx="11" cy="32" r="4" fill="#222" />
            <circle cx="29" cy="32" r="4" fill="#222" />
            <circle cx="11" cy="32" r="2" fill="#555" />
            <circle cx="29" cy="32" r="2" fill="#555" />
            <rect x="3" y="24" width="4" height="3" rx="1" fill="#fff" opacity="0.8" />
            <rect x="33" y="24" width="4" height="3" rx="1" fill="#ff4444" opacity="0.8" />
        </svg>
    ),
    horse: (color, s) => (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
            <defs>
                <radialGradient id={`hg-${color}`} cx="50%" cy="30%" r="70%">
                    <stop offset="0%" stopColor={color} />
                    <stop offset="100%" stopColor={color} stopOpacity="0.5" />
                </radialGradient>
            </defs>
            <ellipse cx="20" cy="28" rx="10" ry="6" fill={`url(#hg-${color})`} />
            <rect x="15" y="18" width="10" height="14" rx="3" fill={color} />
            <ellipse cx="22" cy="14" rx="8" ry="7" fill={color} />
            <path d="M26 10 Q32 6 30 4 Q28 8 26 10" fill={color} />
            <circle cx="19" cy="12" r="1.5" fill="#111" />
            <ellipse cx="18" cy="10" rx="2" ry="1" fill="white" opacity="0.3" />
            <rect x="14" y="30" width="3" height="7" rx="1.5" fill={color} opacity="0.8" />
            <rect x="23" y="30" width="3" height="7" rx="1.5" fill={color} opacity="0.8" />
        </svg>
    ),
    hat: (color, s) => (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
            <defs>
                <linearGradient id={`hatg-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} />
                    <stop offset="100%" stopColor={color} stopOpacity="0.6" />
                </linearGradient>
            </defs>
            <ellipse cx="20" cy="32" rx="16" ry="5" fill={`url(#hatg-${color})`} />
            <rect x="13" y="10" width="14" height="23" rx="2" fill={color} />
            <ellipse cx="20" cy="10" rx="7" ry="2.5" fill={color} />
            <rect x="14" y="21" width="12" height="2.5" fill="white" opacity="0.25" />
            <ellipse cx="17" cy="12" rx="3" ry="1.5" fill="white" opacity="0.3" />
        </svg>
    ),
    ship: (color, s) => (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
            <defs>
                <linearGradient id={`shipg-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} />
                    <stop offset="100%" stopColor={color} stopOpacity="0.5" />
                </linearGradient>
            </defs>
            <path d="M5 28 Q20 36 35 28 L30 20 Q20 24 10 20 Z" fill={`url(#shipg-${color})`} />
            <rect x="18" y="10" width="3" height="13" rx="1" fill={color} />
            <path d="M21 10 L30 18 L21 18 Z" fill={color} opacity="0.7" />
            <ellipse cx="14" cy="22" rx="3" ry="1.5" fill="white" opacity="0.3" />
        </svg>
    ),
    cone: (color, s) => (
        <svg width={s} height={s} viewBox="0 0 40 40" fill="none">
            <defs>
                <linearGradient id={`coneg-${color}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={color} />
                    <stop offset="100%" stopColor={color} stopOpacity="0.4" />
                </linearGradient>
            </defs>
            <path d="M20 5 L35 33 Q20 38 5 33 Z" fill={`url(#coneg-${color})`} />
            <ellipse cx="20" cy="33" rx="15" ry="5" fill={color} opacity="0.7" />
            <path d="M20 5 L27 22" stroke="white" strokeWidth="1" opacity="0.2" strokeLinecap="round" />
            <ellipse cx="16" cy="14" rx="3" ry="4" fill="white" opacity="0.15" transform="rotate(-20,16,14)" />
        </svg>
    ),
};

const playMonopolyChime = (volume: number) => {
    if (volume <= 0) return;
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const playNote = (freq: number, startTime: number, duration: number, type: OscillatorType) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
            gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
            gain.gain.linearRampToValueAtTime(0.15 * volume, ctx.currentTime + startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
            osc.start(ctx.currentTime + startTime);
            osc.stop(ctx.currentTime + startTime + duration);
        };
        // A magical uplifting major arpeggio
        playNote(523.25, 0.0, 0.6, 'sine'); // C5
        playNote(659.25, 0.1, 0.6, 'sine'); // E5
        playNote(783.99, 0.2, 0.6, 'sine'); // G5
        playNote(1046.50, 0.3, 0.8, 'triangle'); // C6
        playNote(1318.51, 0.4, 1.2, 'triangle'); // E6
        playNote(2093.00, 0.4, 2.0, 'sine'); // C7 sparkle
    } catch (e) {
        console.error("Audio not supported");
    }
};

const playDiceRollSound = (volume: number) => {
    if (volume <= 0) return;
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        // We create a sequence of short "clicks" and "clacks" to simulate dice hitting a board
        const rollDuration = 0.4; // seconds
        const notes = [
            { time: 0.0, freq: 800 },
            { time: 0.08, freq: 1100 },
            { time: 0.15, freq: 950 },
            { time: 0.22, freq: 1050 },
            { time: 0.3, freq: 850 },
            { time: 0.4, freq: 700 }, // final thud
        ];

        notes.forEach(note => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'triangle'; // triangle gives a nice wooden/plastic clack sound
            osc.frequency.setValueAtTime(note.freq, ctx.currentTime + note.time);

            // Short burst envelope for each clack
            gain.gain.setValueAtTime(0, ctx.currentTime + note.time);
            gain.gain.linearRampToValueAtTime(0.3 * volume, ctx.currentTime + note.time + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.time + 0.05);

            osc.start(ctx.currentTime + note.time);
            osc.stop(ctx.currentTime + note.time + 0.05);
        });

        // Add a low thud for the final impact
        const thudOsc = ctx.createOscillator();
        const thudGain = ctx.createGain();
        thudOsc.connect(thudGain);
        thudGain.connect(ctx.destination);
        thudOsc.type = 'sine';
        thudOsc.frequency.setValueAtTime(150, ctx.currentTime + rollDuration);
        thudOsc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + rollDuration + 0.1);
        thudGain.gain.setValueAtTime(0, ctx.currentTime + rollDuration);
        thudGain.gain.linearRampToValueAtTime(0.4 * volume, ctx.currentTime + rollDuration + 0.02);
        thudGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + rollDuration + 0.2);
        thudOsc.start(ctx.currentTime + rollDuration);
        thudOsc.stop(ctx.currentTime + rollDuration + 0.2);

    } catch (e) {
        console.error("Audio not supported");
    }
};

const playTrainSound = (volume: number) => {
    if (volume <= 0) return;
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        // Train horn: A minor 3rd (e.g. Eb4 & Gb4) played loud and wide
        const playHorn = (freq: number, startTime: number, duration: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.type = 'sawtooth';
            // slight pitch bend down
            osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.95, ctx.currentTime + startTime + duration);

            // Envelope
            gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
            gain.gain.linearRampToValueAtTime(0.12 * volume, ctx.currentTime + startTime + 0.1);
            gain.gain.setValueAtTime(0.12 * volume, ctx.currentTime + startTime + duration - 0.2);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

            osc.start(ctx.currentTime + startTime);
            osc.stop(ctx.currentTime + startTime + duration);
        };

        const playChug = (startTime: number) => {
            const bufferSize = ctx.sampleRate * 0.1;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

            const noise = ctx.createBufferSource();
            noise.buffer = buffer;

            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 400;

            const gain = ctx.createGain();
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
            gain.gain.linearRampToValueAtTime(0.1 * volume, ctx.currentTime + startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + 0.1);

            noise.start(ctx.currentTime + startTime);
        };

        // Double horn
        playHorn(311.13, 0.0, 1.2); // Eb4
        playHorn(369.99, 0.0, 1.2); // Gb4
        playHorn(311.13, 1.4, 1.5);
        playHorn(369.99, 1.4, 1.5);

        // Chug sequence
        for (let i = 0; i < 15; i++) {
            playChug(0.2 * i);
        }

    } catch (e) {
        console.error("Audio not supported");
    }
};

const playBuildSound = (volume: number) => {
    if (volume <= 0) return;
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        // High hammer ding
        const ding = ctx.createOscillator();
        const dingGain = ctx.createGain();
        ding.connect(dingGain);
        dingGain.connect(ctx.destination);
        ding.type = 'sine';
        ding.frequency.setValueAtTime(800, ctx.currentTime);
        ding.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
        dingGain.gain.setValueAtTime(0, ctx.currentTime);
        dingGain.gain.linearRampToValueAtTime(0.3 * volume, ctx.currentTime + 0.02);
        dingGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        ding.start(ctx.currentTime);
        ding.stop(ctx.currentTime + 0.3);

        // Deeper wood block
        const wood = ctx.createOscillator();
        const woodGain = ctx.createGain();
        wood.connect(woodGain);
        woodGain.connect(ctx.destination);
        wood.type = 'triangle';
        wood.frequency.setValueAtTime(300, ctx.currentTime);
        wood.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
        woodGain.gain.setValueAtTime(0, ctx.currentTime);
        woodGain.gain.linearRampToValueAtTime(0.4 * volume, ctx.currentTime + 0.01);
        woodGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        wood.start(ctx.currentTime);
        wood.stop(ctx.currentTime + 0.2);

    } catch (e) {
        console.error("Audio not supported");
    }
};

const playHotelSound = (volume: number) => {
    if (volume <= 0) return;
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();

        // Celestial chord approach
        const baseFreq = 800;
        const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2]; // Major chord

        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sine';

            // Start note
            osc.frequency.setValueAtTime(freq, ctx.currentTime + (i * 0.05));
            gain.gain.setValueAtTime(0, ctx.currentTime + (i * 0.05));
            gain.gain.linearRampToValueAtTime(0.2 * volume, ctx.currentTime + (i * 0.05) + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (i * 0.05) + 0.8);

            osc.start(ctx.currentTime + (i * 0.05));
            osc.stop(ctx.currentTime + (i * 0.05) + 1);
        });
    } catch (e) {
        console.error("Audio not supported");
    }
};

const CountryFlag = ({ country }: { country: string }) => {
    // using high-quality flag cdn
    const flags: Record<string, string> = {
        'Tunisia': 'tn',
        'Algeria': 'dz',
        'Morocco': 'ma',
        'France': 'fr',
        'Italy': 'it',
        'Spain': 'es',
        'Portugal': 'pt',
        'Greece': 'gr'
    };

    const code = flags[country];
    if (!code) return null;

    return (
        <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full overflow-hidden border-2 border-white/50 shadow-[0_8px_20px_rgba(0,0,0,0.6)] flex items-center justify-center bg-white/10 backdrop-blur-md relative transition-all group-hover/space:scale-125 group-hover/space:border-white group-hover/space:shadow-[0_0_20px_rgba(255,255,255,0.5)]">
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-0 shadow-[inset_0_0_12px_rgba(255,255,255,0.5)] rounded-full z-20 pointer-events-none" />
            <img
                src={`https://flagcdn.com/w80/${code}.png`}
                alt={country}
                className="w-full h-full object-cover scale-150 saturate-125"
            />
        </div>
    );
};

const PlayerToken = ({ color, shape, size = 36, isActive = false }: { color: string; shape: string; size?: number; isActive?: boolean }) => {
    const svgFn = TOKEN_SHAPES[shape] || TOKEN_SHAPES['sphere'];
    return (
        <motion.div
            animate={isActive ? {
                y: [0, -8, 0],
                scale: [1, 1.15, 1],
                filter: [
                    `drop-shadow(0 6px 12px ${color}88) drop-shadow(0 0 20px ${color}44)`,
                    `drop-shadow(0 12px 24px ${color}AA) drop-shadow(0 0 35px ${color}77)`,
                    `drop-shadow(0 6px 12px ${color}88) drop-shadow(0 0 20px ${color}44)`
                ]
            } : {}}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            initial={false}
        >
            {svgFn(color, size)}
        </motion.div>
    );
};

const Token3D = ({ color, shape }: { color: string, shape?: string }) => (
    <PlayerToken color={color} shape={shape || 'sphere'} size={80} />
);


const Dice3D = ({ value, rolling }: { value: number, rolling: boolean }) => {
    const meshRef = React.useRef<THREE.Group>(null);
    const { dicePreference } = useGameStore();

    // Determine path based on preference
    const prefix = dicePreference === 'red' ? 'dieRed_border' : 'dieWhite_border';

    // Load all 6 textures
    const textures = useTexture([
        `/Dice/${prefix}1.png`,
        `/Dice/${prefix}2.png`,
        `/Dice/${prefix}3.png`,
        `/Dice/${prefix}4.png`,
        `/Dice/${prefix}5.png`,
        `/Dice/${prefix}6.png`,
    ]);

    const targetRotations: Record<number, [number, number, number]> = {
        1: [-Math.PI / 2, 0, 0],   // Top (Face 1)
        2: [0, 0, Math.PI / 2],    // Side (Face 2)
        3: [0, 0, 0],               // Front (Face 3)
        4: [Math.PI, 0, 0],        // Back (Face 4)
        5: [0, 0, -Math.PI / 2],   // Side (Face 5)
        6: [Math.PI / 2, 0, 0],    // Bottom (Face 6)
    };

    useFrame((state, delta) => {
        if (meshRef.current) {
            if (rolling) {
                meshRef.current.rotation.x += delta * 15;
                meshRef.current.rotation.y += delta * 20;
                meshRef.current.rotation.z += delta * 10;
            } else {
                const target = targetRotations[value] || [0, 0, 0];
                const targetEuler = new THREE.Euler(target[0], target[1], target[2]);
                const targetQuat = new THREE.Quaternion().setFromEuler(targetEuler);
                meshRef.current.quaternion.slerp(targetQuat, 0.15);
            }
        }
    });

    // Face mapping for BoxGeometry: 
    // 0: +X, 1: -X, 2: +Y, 3: -Y, 4: +Z, 5: -Z
    // Corrected mapping based on targetRotations:
    return (
        <group ref={meshRef}>
            <mesh castShadow receiveShadow>
                <boxGeometry args={[1.5, 1.5, 1.5]} />
                {/* Order: px, nx, py, ny, pz, nz */}
                <meshStandardMaterial attach="material-0" map={textures[1]} /> {/* +X = 2 */}
                <meshStandardMaterial attach="material-1" map={textures[4]} /> {/* -X = 5 */}
                <meshStandardMaterial attach="material-2" map={textures[2]} /> {/* +Y = 3 */}
                <meshStandardMaterial attach="material-3" map={textures[3]} /> {/* -Y = 4 */}
                <meshStandardMaterial attach="material-4" map={textures[0]} /> {/* +Z = 1 */}
                <meshStandardMaterial attach="material-5" map={textures[5]} /> {/* -Z = 6 */}
            </mesh>
        </group>
    );
};

const RuleToggle = ({ icon: Icon, title, description, value, onChange }: { icon: any, title: string, description: string, value: boolean, onChange: (v: boolean) => void }) => (
    <div className="flex items-center gap-4 px-5 py-4 group hover:bg-white/[0.02] transition-colors">
        <div className="w-12 h-12 rounded-2xl bg-[#1A1625] border border-white/5 flex items-center justify-center text-slate-400 group-hover:bg-[#CBB26A]/10 group-hover:text-[#CBB26A] transition-colors shrink-0 shadow-lg">
            <Icon size={20} />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
            <span className="text-[14px] font-black text-white mb-0.5 tracking-tight">{title}</span>
            <span className="text-[11px] text-slate-500 font-bold leading-tight line-clamp-2 tracking-wide">{description}</span>
        </div>
        <button
            onClick={() => onChange(!value)}
            className={`w-14 h-7 rounded-full relative transition-all duration-500 shrink-0 ${value ? 'bg-[#CBB26A]' : 'bg-[#1A1625] border border-white/10'}`}
        >
            <motion.div
                animate={{ x: value ? 28 : 4 }}
                initial={false}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
            />
        </button>
    </div>
);

export const Board = () => {
    const { players, currentTurn, boardState, rollDice, endTurn, diceRoll, activeCard, activeTrade, gameLogs, tradeHistory, hasRolled, respondToTrade, proposeTrade, chatMessages, sendMessage, activeModalSpaceId, setActiveModalSpaceId, buyProperty, isMoving, dicePreference, setDicePreference, monopolyRequiredToBuild, setMonopolyRequiredToBuild, buildHouse, sellHouse, rules, setRule, postBail, soundVolume, setSoundVolume, activeAuction, placeBid, endAuction } = useGameStore();
    const [isRolling, setIsRolling] = useState(false);
    const [hoveredSpaceId, setHoveredSpaceId] = useState<number | null>(null);
    const [monopolyCelebration, setMonopolyCelebration] = useState<{ country: string, ownerId: string } | null>(null);
    const prevBoardState = React.useRef(boardState);

    useEffect(() => {
        Object.entries(boardState).forEach(([spaceId, state]) => {
            const id = Number(spaceId);
            const prev = prevBoardState.current?.[id];
            const space = BOARD_SPACES[id];

            if (prev && state.houses > prev.houses) {
                if (state.houses === 5) {
                    playHotelSound(soundVolume);
                } else {
                    playBuildSound(soundVolume);
                }
            }

            if (state.ownerId && space.type === 'property' && space.country && (!prev || prev.ownerId !== state.ownerId)) {
                const country = space.country;
                const countryProps = BOARD_SPACES.filter(s => s.country === country);
                const allOwned = countryProps.every(s => boardState[s.id]?.ownerId === state.ownerId);
                const previouslyOwned = countryProps.every(s => prevBoardState.current?.[s.id]?.ownerId === state.ownerId);
                if (allOwned && !previouslyOwned) {
                    setMonopolyCelebration({ country, ownerId: state.ownerId });
                    playMonopolyChime(soundVolume);
                    setTimeout(() => setMonopolyCelebration(null), 5000);
                }
            }
        });
        prevBoardState.current = boardState;
    }, [boardState]);

    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleSendChat = () => {
        if (!chatInput.trim()) return;
        sendMessage(chatInput);
        setChatInput('');
    };

    const [tempPlayers, setTempPlayers] = useState<{ id: string, name: string, shape: string, color: string }[]>([]);
    const [startMoney, setStartMoney] = useState(2500);

    const [newPlayerName, setNewPlayerName] = useState('');
    const [newPlayerColor, setNewPlayerColor] = useState('#EF4444');
    const [newPlayerShape, setNewPlayerShape] = useState('sphere');

    // Trade UI State
    const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
    const [tradeTargetPlayerId, setTradeTargetPlayerId] = useState<string>('');
    const [offeredMoney, setOfferedMoney] = useState(0);
    const [requestMoney, setRequestMoney] = useState(0);
    const [offeredPropertyIds, setOfferedPropertyIds] = useState<number[]>([]);
    const [requestPropertyIds, setRequestPropertyIds] = useState<number[]>([]);
    const [bidAmount, setBidAmount] = useState(0);

    const AVAILABLE_COLORS = ['#F9D342', '#F97316', '#EF4444', '#EC4899', '#8A58FF', '#38BDF8', '#22C55E', '#A8A29E'];

    const handleProposeTrade = () => {
        if (!tradeTargetPlayerId) return;
        proposeTrade({
            fromPlayerId: players[currentTurn].id,
            toPlayerId: tradeTargetPlayerId,
            offeredMoney,
            requestMoney,
            offeredPropertyIds,
            requestPropertyIds
        });
        setIsTradeModalOpen(false);
        // Reset
        setOfferedMoney(0); setRequestMoney(0); setOfferedPropertyIds([]); setRequestPropertyIds([]);
    };
    const handleAddPlayer = () => {
        if (tempPlayers.length >= 8) return;

        // Prevent adding if color is somehow already taken
        if (tempPlayers.some(p => p.color === newPlayerColor)) return;

        const newId = `p${Math.random().toString(36).substr(2, 9)}`;
        setTempPlayers([...tempPlayers, {
            id: newId,
            name: newPlayerName.trim() || `Player ${tempPlayers.length + 1}`,
            color: newPlayerColor,
            shape: newPlayerShape
        }]);
        setNewPlayerName('');

        // Cycle to next AVAILABLE color
        const takenColors = tempPlayers.map(p => p.color);
        takenColors.push(newPlayerColor); // Include the one we just picked
        const nextAvailable = AVAILABLE_COLORS.find(c => !takenColors.includes(c));
        if (nextAvailable) {
            setNewPlayerColor(nextAvailable);
        }
    };

    const handleRemovePlayer = (id: string) => {
        setTempPlayers(tempPlayers.filter(p => p.id !== id));
    };

    const canRoll = !hasRolled && !isMoving;
    const canEndTurn = hasRolled && !isMoving;

    const handleRollClick = () => {
        if (!canRoll) return;
        setIsRolling(true);
        playDiceRollSound(soundVolume);
        setTimeout(() => {
            setIsRolling(false);
            const currentRoll = useGameStore.getState().diceRoll;
            if (currentRoll && currentRoll[0] + currentRoll[1] === 12) {
                playTrainSound(soundVolume);
            }
        }, 300);
        rollDice();
    };

    return (
        <div className="flex w-full h-screen bg-[#0E0B16] text-[#E0DEF4] overflow-hidden font-sans select-none">
            {/* LEFT SIDEBAR - MIDNIGHT LUXURY STYLE */}
            <div className="w-[280px] sm:w-[320px] bg-[#0A0810] border-r border-white/5 flex flex-col flex-shrink-0 z-20 hidden md:flex backdrop-blur-xl">
                <div className="px-8 py-8 flex items-center justify-between border-b border-white/5">
                    <h1 className="text-3xl font-black tracking-tighter text-white flex flex-col leading-none">
                        <span className="text-[10px] text-[#CBB26A] uppercase tracking-[0.4em] mb-1">Premium Edition</span>
                        <span>MEDITERRAN<span className="text-[#CBB26A]">OPOLY</span></span>
                    </h1>
                </div>

                {players.length === 0 ? (
                    /* SETUP SIDEBAR CONTENT */
                    <div className="flex-1 flex flex-col px-6 py-4 overflow-y-auto custom-scrollbar">
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-white mb-2">Join Lobby</h2>
                            <p className="text-xs text-slate-400">Configure your appearance below.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Player Name</label>
                                <input type="text" value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} placeholder="Type name..." className="w-full bg-[#0E0B16] border border-[#2A2438] p-3 rounded-xl text-white outline-none focus:border-[#CBB26A] text-sm font-bold placeholder:text-slate-600 transition-all focus:ring-1 focus:ring-[#CBB26A]/50" maxLength={15} />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Select Color</label>
                                <div className="grid grid-cols-4 gap-3">
                                    {AVAILABLE_COLORS.map(c => {
                                        const isTaken = tempPlayers.some(p => p.color === c);
                                        return (
                                            <button key={c} disabled={isTaken} onClick={() => setNewPlayerColor(c)} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all relative ${newPlayerColor === c ? 'ring-2 ring-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : isTaken ? 'opacity-20 grayscale cursor-not-allowed' : 'hover:scale-105 opacity-80'}`} style={{ backgroundColor: c, color: c }}>
                                                {isTaken && <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-black">✕</div>}
                                                {newPlayerColor === c && <div className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Select Token</label>
                                <div className="relative">
                                    <select value={newPlayerShape} onChange={e => setNewPlayerShape(e.target.value)} className="w-full bg-[#0E0B16] border border-[#2A2438] rounded-xl p-3 text-white outline-none focus:border-[#CBB26A] cursor-pointer appearance-none text-xs font-bold">
                                        <option value="sphere">Sphere Token</option>
                                        <option value="cube">Cube Token</option>
                                        <option value="cylinder">Cylinder Token</option>
                                        <option value="car">Car Token</option>
                                        <option value="horse">Horse Token</option>
                                        <option value="hat">Top Hat Token</option>
                                        <option value="ship">Ship Token</option>
                                        <option value="cone">Cone Token</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#CBB26A]">▼</div>
                                </div>
                            </div>

                            {/* Preview Area for Token */}
                            <div className="w-full h-40 bg-[#0E0B16] rounded-2xl border border-[#2A2438] relative overflow-hidden shadow-inner flex flex-col items-center justify-center gap-3">
                                <div className="absolute top-2 left-3 text-[9px] uppercase font-bold text-slate-600 tracking-widest z-10">Preview</div>
                                <PlayerToken color={newPlayerColor} shape={newPlayerShape} size={80} isActive />
                                <div
                                    className="text-[10px] font-black uppercase tracking-widest"
                                    style={{ color: newPlayerColor, textShadow: `0 0 20px ${newPlayerColor}88` }}
                                >
                                    {newPlayerShape}
                                </div>
                            </div>

                            <button onClick={handleAddPlayer} disabled={tempPlayers.length >= 8} className="w-full bg-[#CBB26A] hover:bg-[#B19859] text-[#0E0B16] py-4 rounded-xl font-black transition-all active:scale-[0.98] shadow-lg shadow-[#CBB26A]/20 flex items-center justify-center gap-2 group">
                                JOIN LOBBY <Play size={16} fill="#0E0B16" className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                ) : (
                    /* ACTIVE GAME SIDEBAR CONTENT - ACTIVITY LOG */
                    <div className="flex flex-col h-full overflow-hidden w-full">
                        <div className="px-5 py-6 bg-[#0A0810] border-b border-white/5 flex items-center justify-between shadow-sm z-10 shrink-0">
                            <span className="text-sm text-[#CBB26A] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                <Sparkles size={16} className="text-[#CBB26A]" /> Activity Log
                            </span>
                        </div>
                        <div className="p-4 flex flex-col gap-3 overflow-y-auto flex-1 custom-scrollbar w-full">
                            {gameLogs.length === 0 ? (
                                <div className="text-center text-slate-500 font-bold text-xs uppercase tracking-widest opacity-50 my-auto">
                                    No events yet
                                </div>
                            ) : (
                                gameLogs.map((log) => {
                                    const p = players.find(player => player.id === log.playerId);
                                    const cp = log.targetPlayerId ? players.find(player => player.id === log.targetPlayerId) : null;
                                    if (!p) return null;

                                    let icon = "🎲";
                                    let bgClass = "bg-[#0E0B16] border-white/5";
                                    let highlightClass = "text-[#CBB26A]";

                                    switch (log.type) {
                                        case 'purchase': icon = "🏡"; highlightClass = "text-emerald-400"; break;
                                        case 'rent': icon = "💸"; highlightClass = "text-rose-400"; break;
                                        case 'monopoly': icon = "🏆"; highlightClass = "text-amber-400"; bgClass = "bg-amber-950/20 border-amber-900/50"; break;
                                        case 'jail': icon = "🚔"; highlightClass = "text-red-500"; bgClass = "bg-red-950/20 border-red-900/50"; break;
                                        case 'bail': icon = "🗝️"; highlightClass = "text-green-400"; break;
                                        case 'pass_go': icon = "🏁"; highlightClass = "text-yellow-400"; break;
                                        case 'house': icon = "🏗️"; highlightClass = "text-blue-400"; break;
                                        case 'setup': icon = "🎲"; highlightClass = "text-purple-400"; break;
                                        case 'event': icon = "🃏"; highlightClass = "text-[#38BDF8]"; break;
                                        case 'tax': icon = "🏛️"; highlightClass = "text-red-400"; break;
                                        default: break;
                                    }

                                    return (
                                        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={log.id} className={`shrink-0 rounded-2xl p-4 flex gap-3 items-center justify-start border shadow-md relative overflow-hidden group transition-all hover:bg-white/5 ${bgClass} w-full`}>
                                            <div className="text-xl leading-none shrink-0 pointer-events-none drop-shadow-lg">{icon}</div>
                                            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                                <div className="flex items-center gap-1 flex-wrap">
                                                    <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] shrink-0" style={{ backgroundColor: p.color, color: p.color }} />
                                                    <span className="text-[11px] font-black text-slate-200 truncate max-w-[80px]" style={{ color: p.color }}>{p.name}</span>
                                                    {cp && (
                                                        <>
                                                            <ArrowRight size={10} className="text-slate-500 shrink-0 mx-0.5" />
                                                            <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor] shrink-0" style={{ backgroundColor: cp.color, color: cp.color }} />
                                                            <span className="text-[11px] font-black text-slate-200 truncate max-w-[80px]" style={{ color: cp.color }}>{cp.name}</span>
                                                        </>
                                                    )}
                                                    <span className="text-[9px] text-slate-600 font-mono ml-auto shrink-0 pl-1">
                                                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                                    </span>
                                                </div>
                                                <span className="text-[13px] font-bold text-slate-300 leading-snug mt-1 text-left w-full break-words whitespace-normal">
                                                    {log.message}
                                                </span>
                                                {log.amount !== undefined && (
                                                    <div className={`text-[12px] font-mono font-black mt-1 text-left ${highlightClass}`}>
                                                        ${log.amount}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 relative flex items-center justify-center p-1 sm:p-2 lg:p-4 overflow-hidden bg-[#0A0810]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#1A1726_0%,_#0A0810_100%)] opacity-50" />

                {/* Audio Toggle Top Right Corner */}
                <div className="absolute top-6 right-6 z-[500] pointer-events-auto">
                    <button
                        onClick={() => setSoundVolume(soundVolume === 0 ? 0.4 : soundVolume === 0.4 ? 1 : 0)}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#1A1625]/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#2A2438] hover:border-[#CBB26A]/50 transition-all shadow-xl active:scale-95 group relative"
                    >
                        {soundVolume === 0 ? <VolumeX size={20} className="text-rose-500" /> : soundVolume < 0.5 ? <Volume1 size={20} className="text-yellow-500 relative left-[-2px]" /> : <Volume2 size={20} className="text-emerald-400 group-hover:scale-110 transition-transform" />}
                    </button>
                </div>

                {/* Fixed width container to keep board perfectly square natively */}
                <div className="w-full h-full max-w-[92vh] max-h-[92vh] aspect-square relative transition-transform duration-500 z-10" style={{ perspective: "2000px" }}>
                    {/* The Game Board */}
                    <div
                        className="grid gap-1 sm:gap-1.5 p-1 sm:p-2 bg-[#050308] rounded-2xl relative w-full h-full border-[1px] border-white/5 shadow-[0_40px_100px_rgba(0,0,0,0.9)]"
                        style={{
                            gridTemplateRows: "1.2fr repeat(9, 1fr) 1.2fr",
                            gridTemplateColumns: "1.2fr repeat(9, 1fr) 1.2fr",
                        }}
                    >
                        {BOARD_SPACES.map((space) => {
                            const id = space.id;
                            const { gridRow, gridColumn } = getGridArea(id);
                            const bState = boardState[id];
                            const isCorner = id % 10 === 0;

                            // Determine orientation relative to board center
                            let edge: 'top' | 'bottom' | 'left' | 'right' = 'top';
                            if (id > 10 && id < 20) edge = 'right';
                            else if (id > 20 && id < 30) edge = 'bottom';
                            else if (id > 30 && id < 40) edge = 'left';

                            // Inner edge = opposite of the outer edge (faces board center)
                            const innerEdge = edge === 'top' ? 'bottom' : edge === 'bottom' ? 'top' : edge === 'left' ? 'right' : 'left';

                            return (
                                <motion.div
                                    key={id}
                                    onMouseEnter={() => setHoveredSpaceId(id)}
                                    onMouseLeave={() => setHoveredSpaceId(null)}
                                    whileHover={{
                                        scale: 1.05,
                                        zIndex: 40,
                                        boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
                                    }}
                                    className="relative flex flex-col items-center justify-center overflow-hidden transition-all duration-200 border cursor-pointer group/space"
                                    onClick={() => (space.type === 'property' || space.type === 'station' || space.type === 'utility') && setActiveModalSpaceId(id)}
                                    style={{
                                        gridRow,
                                        gridColumn,
                                        background: isCorner
                                            ? 'linear-gradient(145deg, #1a1535 0%, #0d0a1a 100%)'
                                            : space.type === 'chance'
                                                ? 'linear-gradient(145deg, #2a1535 0%, #150a22 100%)'
                                                : space.type === 'chest'
                                                    ? 'linear-gradient(145deg, #102030 0%, #060e18 100%)'
                                                    : space.type === 'tax'
                                                        ? 'linear-gradient(145deg, #251010 0%, #120505 100%)'
                                                        : space.type === 'station'
                                                            ? 'linear-gradient(145deg, #1a1a2e 0%, #0a0a18 100%)'
                                                            : space.type === 'utility'
                                                                ? 'linear-gradient(145deg, #101828 0%, #060d18 100%)'
                                                                : 'linear-gradient(145deg, #181530 0%, #0c0a1e 100%)',
                                        borderColor: bState?.ownerId
                                            ? (players.find(p => p.id === bState.ownerId)?.color || 'rgba(255,255,255,0.1)')
                                            : hoveredSpaceId === id
                                                ? 'rgba(203,178,106,0.5)'
                                                : 'rgba(255,255,255,0.06)',
                                        borderWidth: bState?.ownerId ? '2px' : '1px',
                                        borderRadius: isCorner ? '14px' : '10px',
                                        boxShadow: bState?.ownerId
                                            ? `0 0 18px ${players.find(p => p.id === bState.ownerId)?.color}55`
                                            : 'none',
                                    }}
                                >
                                    {/* Property Color Band — on INNER side (facing board center) */}
                                    {space.type === 'property' && space.color && (
                                        <div
                                            className="absolute z-10 flex items-center justify-center overflow-hidden"
                                            style={{
                                                ...(innerEdge === 'top' ? { top: 0, left: 0, right: 0, height: '22px' } : {}),
                                                ...(innerEdge === 'bottom' ? { bottom: 0, left: 0, right: 0, height: '22px' } : {}),
                                                ...(innerEdge === 'left' ? { left: 0, top: 0, bottom: 0, width: '22px' } : {}),
                                                ...(innerEdge === 'right' ? { right: 0, top: 0, bottom: 0, width: '22px' } : {}),
                                                background: space.color,
                                                boxShadow: `0 0 14px ${space.color}88`,
                                                writingMode: (innerEdge === 'left' || innerEdge === 'right') ? 'vertical-rl' : 'horizontal-tb',
                                            }}
                                        >
                                            {/* House/Hotel Indicator - Premium Glass Dock Design */}
                                            {bState?.houses > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className={`absolute z-20 pointer-events-none flex items-center justify-center
                                                        ${(innerEdge === 'top' || innerEdge === 'bottom') ? 'inset-x-0 h-full px-1.5' : 'inset-y-0 w-full py-1.5'}
                                                    `}
                                                >
                                                    <div
                                                        className={`bg-[#0F172A]/40 backdrop-blur-md rounded-[10px] p-1.5 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.1)] border border-white/20
                                                            ${(innerEdge === 'left' || innerEdge === 'right')
                                                                ? (bState.houses === 4 ? 'grid grid-cols-2 gap-1' : 'flex flex-col gap-1')
                                                                : (bState.houses === 4 ? 'grid grid-rows-2 grid-flow-col gap-1' : 'flex flex-row gap-1')
                                                            }
                                                        `}
                                                    >
                                                        <AnimatePresence mode="popLayout">
                                                            {bState.houses < 5 ? (
                                                                Array.from({ length: bState.houses }).map((_, i) => (
                                                                    <motion.div
                                                                        key={`house-${i}-${bState.houses}`}
                                                                        initial={{ scale: 0, y: 5 }}
                                                                        animate={{ scale: 1, y: 0 }}
                                                                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                                                        className="text-[11px] sm:text-[13px] leading-none drop-shadow-[0_2px_5px_rgba(0,0,0,1)] relative"
                                                                    >
                                                                        🏠
                                                                        {i === bState.houses - 1 && (
                                                                            <motion.div
                                                                                initial={{ scale: 0, opacity: 1 }}
                                                                                animate={{ scale: 4.5, opacity: 0 }}
                                                                                className="absolute inset-0 bg-white rounded-full blur-md z-[-1]"
                                                                            />
                                                                        )}
                                                                    </motion.div>
                                                                ))
                                                            ) : (
                                                                <motion.div
                                                                    key="hotel"
                                                                    initial={{ scale: 0, rotate: 180 }}
                                                                    animate={{
                                                                        scale: [1, 1.15, 1],
                                                                        rotate: 0,
                                                                        filter: [
                                                                            'drop-shadow(0 0 8px rgba(56,189,248,0.6))',
                                                                            'drop-shadow(0 0 20px rgba(56,189,248,1))',
                                                                            'drop-shadow(0 0 8px rgba(56,189,248,0.6))'
                                                                        ]
                                                                    }}
                                                                    transition={{
                                                                        scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                                                                        filter: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                                                                    }}
                                                                    className="relative"
                                                                >
                                                                    <div className="text-[18px] sm:text-[22px] leading-none">💎</div>
                                                                    <motion.div
                                                                        initial={{ scale: 0, opacity: 1 }}
                                                                        animate={{ scale: 8, opacity: 0 }}
                                                                        className="absolute inset-0 bg-blue-400 rounded-full blur-2xl z-[-1]"
                                                                    />
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </motion.div>
                                            )}

                                            {/* Price Tag - Only visible if no houses to avoid overlap */}
                                            {(!bState?.houses || bState.houses === 0) && (
                                                <span
                                                    className="font-black leading-none whitespace-nowrap select-none"
                                                    style={{
                                                        fontSize: '9px',
                                                        fontFamily: 'JetBrains Mono, monospace',
                                                        color: '#fff',
                                                        textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.7)',
                                                        transform: innerEdge === 'left' ? 'rotate(180deg)' : 'none',
                                                        letterSpacing: '0.02em',
                                                    }}
                                                >
                                                    {space.price}$
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Price for non-property tiles (tax, utility, station) */}
                                    {space.type !== 'property' && (space.price || space.type === 'tax') && !isCorner && (
                                        <div className="absolute z-20 bottom-1 left-1/2 -translate-x-1/2">
                                            <span
                                                className="font-black text-[#CBB26A] leading-none whitespace-nowrap"
                                                style={{ fontSize: '8px', fontFamily: 'JetBrains Mono, monospace', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                                            >
                                                {space.type === 'tax' ? (id === 4 ? '10%' : `${space.price}$`) : `${space.price}$`}
                                            </span>
                                        </div>
                                    )}

                                    {/* Inner Content */}
                                    <div
                                        className={`flex flex-col items-center justify-center w-full h-full relative z-10
                                        ${space.type === 'property' ?
                                                (innerEdge === 'top' ? 'pt-5 pb-1' : innerEdge === 'bottom' ? 'pb-5 pt-1' :
                                                    innerEdge === 'left' ? 'pl-5 pr-1' : 'pr-5 pl-1')
                                                : 'p-1'}`}
                                    >
                                        <div className="flex flex-col items-center justify-center w-full h-full relative gap-0.5">
                                            {/* Corner tiles */}
                                            {isCorner && id === 0 && <div className="text-2xl sm:text-3xl relative z-20 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">🚩</div>}
                                            {isCorner && id === 10 && (
                                                <div className="w-full h-full absolute inset-0 z-20 pointer-events-none rounded-[10px] sm:rounded-[14px]">
                                                    <div className="absolute top-0 right-0 w-[68%] h-[68%] bg-gradient-to-br from-red-950 to-rose-950 border-b border-l border-rose-500/40 rounded-bl-[10px] sm:rounded-bl-[14px] flex flex-col items-center justify-center shadow-[-4px_4px_15px_rgba(0,0,0,0.8)] overflow-hidden">
                                                        <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_6px,rgba(0,0,0,0.7)_6px,rgba(0,0,0,0.7)_8px)] z-0" />
                                                        <Lock size={16} className="text-white drop-shadow-[0_0_8px_white] z-10 mb-0.5 sm:scale-110" />
                                                        <span className="text-[6px] sm:text-[7px] font-black text-rose-100 uppercase tracking-widest z-10 drop-shadow-md">Prison</span>
                                                    </div>
                                                    <div className="absolute bottom-1 sm:bottom-1.5 left-0 w-full text-center text-[6.5px] sm:text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] sm:tracking-[0.3em] font-mono leading-none z-0">Visiting</div>
                                                    <div className="absolute top-[35%] left-[-20%] sm:left-[-15%] -rotate-90 origin-center text-[6.5px] sm:text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] sm:tracking-[0.3em] font-mono w-full text-center z-0">Just</div>
                                                </div>
                                            )}
                                            {isCorner && id === 20 && <div className="text-2xl sm:text-3xl relative z-20 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">🌴</div>}
                                            {isCorner && id === 30 && (
                                                <div className="w-full h-full absolute inset-0 bg-gradient-to-br from-[#1A1A2E] to-[#0A0A18] flex flex-col items-center justify-center p-1 sm:p-2 z-20 rounded-[10px] sm:rounded-[14px] overflow-hidden">
                                                    <div className="absolute top-1 right-1 opacity-80">
                                                        <Siren size={12} className="text-blue-500 animate-pulse drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                                                    </div>
                                                    <div className="absolute bottom-1 left-1 opacity-80">
                                                        <Siren size={12} className="text-rose-500 animate-pulse drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" style={{ animationDelay: '0.5s' }} />
                                                    </div>
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-950/80 border-2 border-indigo-500/30 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)] mb-1 z-10 relative overflow-hidden backdrop-blur-sm">
                                                        <Lock size={16} className="text-indigo-200 drop-shadow-[0_0_6px_currentColor] sm:scale-110" />
                                                    </div>
                                                    <div className="text-[7px] sm:text-[8.5px] font-black text-indigo-100 uppercase tracking-widest sm:tracking-[0.1em] text-center leading-[1.1] drop-shadow-[0_2px_4px_rgba(0,0,0,1)] flex flex-col z-10">
                                                        <span>Go To</span>
                                                        <span className="text-rose-400">Prison</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Station */}
                                            {!isCorner && space.type === 'station' && (
                                                <div className="text-xl sm:text-2xl leading-none">✈️</div>
                                            )}

                                            {/* Utility */}
                                            {!isCorner && space.type === 'utility' && id === 12 && (
                                                <Zap size={16} className="text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]" fill="currentColor" />
                                            )}
                                            {!isCorner && space.type === 'utility' && id === 28 && (
                                                <Droplets size={16} className="text-blue-300 drop-shadow-[0_0_8px_rgba(147,197,253,0.8)]" fill="currentColor" />
                                            )}

                                            {/* Tax */}
                                            {!isCorner && space.type === 'tax' && (
                                                <div className="text-xl leading-none">💸</div>
                                            )}

                                            {/* Chance */}
                                            {space.type === 'chance' && (
                                                <div
                                                    className="text-xl font-black leading-none"
                                                    style={{ color: '#e879a0', textShadow: '0 0 12px #e879a0aa, 0 0 24px #e879a044' }}
                                                >?</div>
                                            )}

                                            {/* Community Chest */}
                                            {space.type === 'chest' && (
                                                <div className="text-xl leading-none">🎁</div>
                                            )}

                                            {!(isCorner && (id === 10 || id === 30)) && space.type === 'property' && space.country && (
                                                <div className="mb-0.5 sm:mb-1 drop-shadow-md z-10 filter hover:brightness-110">
                                                    <CountryFlag country={space.country} />
                                                </div>
                                            )}

                                            {!(isCorner && (id === 10 || id === 30)) && (
                                                <span
                                                    className={`font-bold text-center w-full px-0.5 leading-tight z-10
                                                        ${isCorner ? 'text-[9px] sm:text-[10px] uppercase tracking-tight text-slate-200' : 'text-[7px] sm:text-[8px] text-slate-300'}
                                                        max-w-full whitespace-pre-wrap break-words`}
                                                    style={{ textShadow: '0 1px 4px rgba(0,0,0,1)' }}
                                                >
                                                    {isCorner ? space.name.split(' ').join('\n') : space.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Active glow overlay on hover */}
                                    <div
                                        className="absolute inset-0 rounded-[inherit] opacity-0 group-hover/space:opacity-100 pointer-events-none transition-opacity duration-300"
                                        style={{ background: 'radial-gradient(circle at center, rgba(203,178,106,0.08) 0%, transparent 70%)' }}
                                    />
                                    {/* Quick Build Controls - Hover and Owned by current player */}
                                    {space.type === 'property' && bState?.ownerId === players[currentTurn]?.id && hoveredSpaceId === id && !bState?.isMortgaged && (
                                        (() => {
                                            const countryProps = BOARD_SPACES.filter(s => s.country === space.country);
                                            const hasMonopoly = countryProps.length > 0 && countryProps.every(s => boardState[s.id]?.ownerId === players[currentTurn]?.id);
                                            return hasMonopoly;
                                        })()
                                    ) && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="absolute inset-0 z-[60] flex flex-col items-center justify-between p-0.5 bg-black/60 backdrop-blur-md rounded-[inherit] overflow-hidden"
                                            >
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); buildHouse(players[currentTurn].id, id); }}
                                                    className="w-full flex-1 flex items-center justify-center hover:bg-emerald-500/40 text-emerald-400 transition-all border-b border-white/10 group/btn"
                                                    title="Build House"
                                                >
                                                    <ChevronUp size={28} className="drop-shadow-[0_0_8px_currentColor] group-hover/btn:scale-125 transition-transform" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); sellHouse(players[currentTurn].id, id); }}
                                                    className="w-full flex-1 flex items-center justify-center hover:bg-rose-500/40 text-rose-400 transition-all group/btn"
                                                    title="Sell House"
                                                >
                                                    <ChevronDown size={28} className="drop-shadow-[0_0_8px_currentColor] group-hover/btn:scale-125 transition-transform" />
                                                </button>
                                            </motion.div>
                                        )}
                                </motion.div>
                            );
                        })}

                        {/* Tokens layer over the board grid */}
                        <div className="absolute inset-0 pointer-events-none" style={{ display: 'grid', gridTemplateRows: '1.2fr repeat(9, 1fr) 1.2fr', gridTemplateColumns: '1.2fr repeat(9, 1fr) 1.2fr', gap: '6px', padding: '8px' }}>
                            <AnimatePresence>
                                {players.map((player) => {
                                    const { gridRow, gridColumn } = getGridArea(player.position);

                                    // Calculate offset for multiple players on the same space
                                    const spacePlayers = players.filter(p => p.position === player.position);
                                    const playerIdx = spacePlayers.findIndex(p => p.id === player.id);
                                    const total = spacePlayers.length;

                                    let offsetX = 0;
                                    let offsetY = 0;
                                    if (total > 1) {
                                        // Arrange players in a small circle if they are together
                                        const angle = (playerIdx / total) * Math.PI * 2;
                                        const radius = 12; // pixels
                                        offsetX = Math.cos(angle) * radius;
                                        offsetY = Math.sin(angle) * radius;
                                    }

                                    const isActivePlayer = players[currentTurn]?.id === player.id;
                                    return (
                                        <motion.div
                                            key={player.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0, y: -20 }}
                                            animate={{
                                                gridRowStart: gridRow,
                                                gridColumnStart: gridColumn,
                                                x: offsetX,
                                                y: offsetY,
                                                opacity: 1,
                                                scale: 1,
                                            }}
                                            transition={{
                                                layout: { type: 'spring', stiffness: 120, damping: 22 },
                                                opacity: { duration: 0.2 },
                                                scale: { type: 'spring', stiffness: 200, damping: 18 },
                                            }}
                                            className="w-full h-full flex items-center justify-center pointer-events-none relative"
                                            style={{ zIndex: 100 + playerIdx }}
                                        >
                                            {/* Pulsing ring for active player */}
                                            {isActivePlayer && (
                                                <motion.div
                                                    className="absolute rounded-full pointer-events-none"
                                                    style={{
                                                        width: 36, height: 36,
                                                        border: `2px solid ${player.color}`,
                                                        boxShadow: `0 0 10px ${player.color}`,
                                                    }}
                                                    animate={{ scale: [1, 2.2], opacity: [0.9, 0] }}
                                                    transition={{ repeat: Infinity, duration: 1.2, ease: 'easeOut' }}
                                                />
                                            )}
                                            <PlayerToken
                                                color={player.color}
                                                shape={player.shape || 'sphere'}
                                                size={total > 2 ? 26 : 32}
                                                isActive={isActivePlayer}
                                            />
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* Center Info Area */}
                        <div
                            className="pointer-events-none relative w-full h-full"
                            style={{ gridRow: "2 / 11", gridColumn: "2 / 11" }}
                        >
                            <AnimatePresence>
                                {monopolyCelebration && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.5, y: 50 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
                                        transition={{ type: "spring", damping: 15 }}
                                        className="absolute z-[300] top-[15%] left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center"
                                    >
                                        <div className="relative">
                                            {/* Background sunburst rotation */}
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                                                className="absolute inset-[-100px] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(203,178,106,0.3)_30deg,transparent_60deg,rgba(203,178,106,0.3)_90deg,transparent_120deg,rgba(203,178,106,0.3)_150deg,transparent_180deg,rgba(203,178,106,0.3)_210deg,transparent_240deg,rgba(203,178,106,0.3)_270deg,transparent_300deg,rgba(203,178,106,0.3)_330deg,transparent_360deg)] drop-shadow-[0_0_50px_rgba(203,178,106,1)] rounded-full mix-blend-screen"
                                                style={{ width: 'calc(100% + 200px)', height: 'calc(100% + 200px)' }}
                                            />

                                            <div className="bg-[#111827]/90 backdrop-blur-xl border-2 border-[#CBB26A] p-6 sm:p-8 rounded-[2rem] shadow-[0_20px_100px_rgba(203,178,106,0.5)] flex flex-col items-center relative overflow-hidden min-w-[300px]">
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#CBB26A]/20 to-transparent pointer-events-none" />

                                                {/* Stars */}
                                                <div className="flex gap-2 mb-2 text-[#CBB26A]">
                                                    <Sparkles className="animate-pulse" />
                                                    <Sparkles className="animate-pulse delay-100" />
                                                    <Sparkles className="animate-pulse delay-200" />
                                                </div>

                                                <h2 className="text-[10px] sm:text-xs font-black uppercase text-[#CBB26A] tracking-[0.4em] mb-1 text-center">
                                                    Monopoly Achieved!
                                                </h2>
                                                <h1 className="text-3xl sm:text-5xl font-black text-white px-8 text-center uppercase" style={{ textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>
                                                    {monopolyCelebration.country}
                                                </h1>

                                                <div className="mt-4 flex items-center gap-3 bg-white/10 px-4 py-2 rounded-xl border border-white/20 relative z-10 w-fit">
                                                    <div className="w-5 h-5 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: players.find(p => p.id === monopolyCelebration.ownerId)?.color, color: players.find(p => p.id === monopolyCelebration.ownerId)?.color }} />
                                                    <span className="text-sm font-bold text-slate-200">
                                                        {players.find(p => p.id === monopolyCelebration.ownerId)?.name} controls the zone!
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* HOVER INFO PANEL */}
                            <AnimatePresence>
                                {hoveredSpaceId !== null && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.88, y: 8 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.88, y: 8 }}
                                        className="absolute z-[100] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-2xl rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.9)] w-64 overflow-hidden pointer-events-none"
                                        style={{
                                            background: 'linear-gradient(160deg, #1a1535ee 0%, #0d0a1aee 100%)',
                                            border: `1px solid ${BOARD_SPACES[hoveredSpaceId].color || 'rgba(255,255,255,0.1)'}55`,
                                        }}
                                    >
                                        {/* Color header strip */}
                                        {BOARD_SPACES[hoveredSpaceId].color && (
                                            <div className="w-full h-2" style={{ background: BOARD_SPACES[hoveredSpaceId].color, boxShadow: `0 0 20px ${BOARD_SPACES[hoveredSpaceId].color}` }} />
                                        )}

                                        <div className="px-5 pt-4 pb-3">
                                            {/* Country label */}
                                            <div className="text-[9px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: BOARD_SPACES[hoveredSpaceId].color || '#CBB26A' }}>
                                                {BOARD_SPACES[hoveredSpaceId].country || BOARD_SPACES[hoveredSpaceId].type}
                                            </div>
                                            {/* Property name */}
                                            <div className="text-xl font-black text-white leading-tight mb-4">
                                                {BOARD_SPACES[hoveredSpaceId].name}
                                            </div>

                                            {/* Owner Badge */}
                                            {boardState[hoveredSpaceId]?.ownerId && (
                                                <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 w-fit">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: players.find(p => p.id === boardState[hoveredSpaceId].ownerId)?.color }} />
                                                    <span className="text-[10px] font-black text-white">{players.find(p => p.id === boardState[hoveredSpaceId].ownerId)?.name}</span>
                                                </div>
                                            )}

                                            {/* RENT TABLE */}
                                            {BOARD_SPACES[hoveredSpaceId].type === 'property' && BOARD_SPACES[hoveredSpaceId].rent && (() => {
                                                const rent = BOARD_SPACES[hoveredSpaceId].rent!;
                                                const rows = [
                                                    { label: 'with rent', value: rent[0], highlight: false },
                                                    { label: 'with one house', value: rent[1], highlight: false },
                                                    { label: 'with two houses', value: rent[2], highlight: false },
                                                    { label: 'with three houses', value: rent[3], highlight: false },
                                                    { label: 'with four houses', value: rent[4], highlight: false },
                                                    { label: 'with a hotel', value: rent[5], highlight: true },
                                                ];
                                                return (
                                                    <div className="w-full border border-white/8 rounded-xl overflow-hidden mb-4" style={{ background: 'rgba(0,0,0,0.3)' }}>
                                                        <div className="flex justify-between px-3 py-1 border-b border-white/5">
                                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">when</span>
                                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">get</span>
                                                        </div>
                                                        {rows.map((row, i) => (
                                                            <div
                                                                key={i}
                                                                className="flex justify-between items-center px-3 py-1.5 border-b border-white/5 last:border-0"
                                                                style={{ background: row.highlight ? `${BOARD_SPACES[hoveredSpaceId].color}18` : 'transparent' }}
                                                            >
                                                                <span className={`text-[10px] font-semibold ${row.highlight ? 'text-white font-black' : 'text-slate-400'}`}>
                                                                    {row.label}
                                                                </span>
                                                                <span
                                                                    className="text-[11px] font-black font-mono"
                                                                    style={{ color: row.highlight ? (BOARD_SPACES[hoveredSpaceId].color || '#CBB26A') : '#fff' }}
                                                                >
                                                                    ${row.value}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            })()}

                                            {/* STATION rents */}
                                            {BOARD_SPACES[hoveredSpaceId].type === 'station' && (
                                                <div className="w-full border border-white/8 rounded-xl overflow-hidden mb-4" style={{ background: 'rgba(0,0,0,0.3)' }}>
                                                    {[['1 station owned', '$25'], ['2 stations owned', '$50'], ['3 stations owned', '$100'], ['4 stations owned', '$200']].map(([label, val], i) => (
                                                        <div key={i} className="flex justify-between items-center px-3 py-1.5 border-b border-white/5 last:border-0">
                                                            <span className="text-[10px] text-slate-400 font-semibold">{label}</span>
                                                            <span className="text-[11px] font-black text-white font-mono">{val}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* UTILITY info */}
                                            {BOARD_SPACES[hoveredSpaceId].type === 'utility' && (
                                                <div className="text-[10px] text-slate-400 font-semibold leading-relaxed italic text-center py-2 px-2">
                                                    Rent is <b className="text-white">4×</b> dice roll if 1 owned,<br />or <b className="text-white">10×</b> dice roll if both owned.
                                                </div>
                                            )}

                                            {/* TAX info */}
                                            {BOARD_SPACES[hoveredSpaceId].type === 'tax' && (
                                                <div className="text-[11px] text-rose-400 font-black text-center uppercase tracking-widest py-2">
                                                    Government Fee<br />${BOARD_SPACES[hoveredSpaceId].price || '10%'}
                                                </div>
                                            )}
                                        </div>

                                        {/* FOOTER: Price / House / Hotel */}
                                        {BOARD_SPACES[hoveredSpaceId].type === 'property' && (
                                            <div
                                                className="flex items-stretch divide-x divide-white/10 border-t border-white/10"
                                                style={{ background: 'rgba(0,0,0,0.35)' }}
                                            >
                                                <div className="flex-1 flex flex-col items-center py-2.5 gap-0.5">
                                                    <span className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Price</span>
                                                    <span className="text-[12px] font-black text-white font-mono">${BOARD_SPACES[hoveredSpaceId].price}</span>
                                                </div>
                                                <div className="w-px bg-white/8" />
                                                <div className="flex-1 flex flex-col items-center py-2.5 gap-0.5">
                                                    <span className="text-base leading-none">🏠</span>
                                                    <span className="text-[12px] font-black text-white font-mono">${BOARD_SPACES[hoveredSpaceId].housePrice}</span>
                                                </div>
                                                <div className="w-px bg-white/8" />
                                                <div className="flex-1 flex flex-col items-center py-2.5 gap-0.5">
                                                    <span className="text-base leading-none">🏨</span>
                                                    <span className="text-[12px] font-black text-white font-mono">${BOARD_SPACES[hoveredSpaceId].housePrice}</span>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>


                            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="absolute flex flex-col items-center justify-center top-[15%] inset-x-0 mx-auto pointer-events-none select-none z-10">
                                <div className="flex items-center gap-2 mb-2.5 opacity-40">
                                    <div className="w-5 h-[1px] bg-gradient-to-r from-transparent to-[#CBB26A]" />
                                    <span className="text-[8px] font-black tracking-[0.4em] text-[#CBB26A] uppercase">Empire Edition</span>
                                    <div className="w-5 h-[1px] bg-gradient-to-l from-transparent to-[#CBB26A]" />
                                </div>

                                <div className="relative group">
                                    <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-[0.1em] drop-shadow-[0_15px_40px_rgba(0,0,0,1)] bg-gradient-to-b from-[#FFF5D9] via-[#CBB26A] to-[#8E793E] bg-clip-text text-transparent flex items-center leading-none italic">
                                        MEDITERRANOPOLY
                                    </h1>
                                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                                        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-[35deg] translate-x-[-150%] animate-[shimmer_6s_infinite]" />
                                    </div>
                                </div>

                                <div className="flex flex-col items-center mt-5 gap-0.5">
                                    <div className="w-64 h-[1px] bg-gradient-to-r from-transparent via-[#CBB26A]/40 to-transparent shadow-[0_0_10px_rgba(203,178,106,0.3)]" />
                                    <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#CBB26A]/20 to-transparent" />
                                </div>

                                {players.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-12 pointer-events-auto"
                                    >
                                        <button
                                            onClick={() => useGameStore.getState().initGame(tempPlayers, startMoney)}
                                            disabled={tempPlayers.length < 2}
                                            className="px-12 py-5 rounded-2xl bg-[#CBB26A] hover:bg-[#DBC27A] text-[#0A0810] font-black text-xl tracking-[0.2em] shadow-[0_20px_50px_rgba(203,178,106,0.3)] hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale transition-all flex items-center gap-4 group relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[120%] group-hover:animate-[shimmer_1.5s_infinite] skew-x-12" />
                                            START EMPIRE
                                            <Play size={24} fill="currentColor" />
                                        </button>
                                        {tempPlayers.length < 2 && (
                                            <p className="text-[#CBB26A]/60 text-[10px] uppercase font-black tracking-widest mt-4 text-center animate-pulse">Add at least 2 players in the sidebar</p>
                                        )}
                                    </motion.div>
                                )}
                            </motion.div>
                            {/* Animated Dice Engine in 3D */}
                            <div className="absolute inset-x-0 top-[28%] flex gap-4 md:gap-8 h-16 sm:h-24 md:h-32 items-center justify-center p-2">
                                {diceRoll || isRolling ? (
                                    <div className="flex w-[200px] sm:w-[320px] h-full relative">
                                        <Canvas shadows camera={{ position: [0, 10, 4], fov: 28 }}>
                                            <ambientLight intensity={1.2} />
                                            <spotLight position={[0, 15, 0]} intensity={3} angle={0.5} penumbra={1} castShadow color="#CBB26A" />
                                            <directionalLight position={[5, 10, 5]} intensity={1.5} color="#fff" />
                                            <group position={[-1.4, 0, 0]}>
                                                <Dice3D value={diceRoll ? diceRoll[0] : 1} rolling={isRolling} />
                                            </group>
                                            <group position={[1.4, 0, 0]}>
                                                <Dice3D value={diceRoll ? diceRoll[1] : 1} rolling={isRolling} />
                                            </group>
                                        </Canvas>
                                    </div>
                                ) : players.length > 0 ? (
                                    <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center animate-pulse border border-white/20 shadow-2xl">
                                        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full shadow-[0_0_30px_currentColor]" style={{ backgroundColor: players[currentTurn]?.color || 'white', color: players[currentTurn]?.color }} />
                                    </div>
                                ) : null}
                            </div>

                            {players.length > 0 && (
                                <motion.div
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                    className="absolute top-[55%] inset-x-0 mx-auto w-fit text-center font-black text-white pointer-events-auto flex items-center gap-4 bg-white/5 backdrop-blur-xl px-10 py-4 rounded-3xl border border-white/10 text-xs sm:text-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                                >
                                    <div className="w-3 h-3 rounded-full shadow-[0_0_15px_currentColor] animate-pulse" style={{ backgroundColor: players[currentTurn].color, color: players[currentTurn].color }} />
                                    <span className="tracking-[0.2em] uppercase">{players[currentTurn].name}'s Turn</span>
                                </motion.div>
                            )}

                            <div className="absolute bottom-[8%] flex flex-col items-center gap-4 pointer-events-auto w-full px-12">
                                {players.length > 0 && !boardState[players[currentTurn].position]?.ownerId && ['property', 'station', 'utility'].includes(BOARD_SPACES[players[currentTurn].position].type) && hasRolled && !isMoving && (
                                    <button
                                        onClick={() => buyProperty(players[currentTurn].id, players[currentTurn].position)}
                                        className="w-full max-w-xs py-4 rounded-full font-black text-[10px] sm:text-xs tracking-[0.4em] bg-emerald-500 text-white hover:bg-emerald-400 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-4 group border border-emerald-400/20"
                                    >
                                        ACQUIRE ASSET <div className="w-5 h-5 bg-white/20 rounded-lg flex items-center justify-center text-[10px] text-white">$</div>
                                    </button>
                                )}

                                {players.length > 0 && (
                                    <div className="flex flex-row gap-2 sm:gap-4 lg:gap-6 w-full justify-center">
                                        {players[currentTurn].inJail && !hasRolled && players[currentTurn].money >= 100 && (
                                            <motion.button
                                                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(244,63,94,0.4)" }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => postBail(players[currentTurn].id)}
                                                className={`
                                                    flex-1 max-w-[150px] sm:max-w-[180px] h-14 sm:h-16 rounded-2xl font-black text-[9px] sm:text-[10px] sm:tracking-[0.2em] uppercase 
                                                    transition-all duration-300 relative overflow-hidden group
                                                    bg-gradient-to-br from-rose-500 via-rose-600 to-rose-800 text-white shadow-[0_10px_20px_rgba(244,63,94,0.3)] cursor-pointer
                                                `}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-[120%] group-hover:animate-[shimmer_1.5s_infinite] skew-x-12" />
                                                <div className="relative flex items-center justify-center gap-1 sm:gap-2 h-full">
                                                    <span className="drop-shadow-sm text-center">PAY $100<br className="sm:hidden" /> BAIL</span>
                                                    <Lock size={14} className="hidden sm:block" />
                                                </div>
                                            </motion.button>
                                        )}

                                        <motion.button
                                            whileHover={canRoll ? { scale: 1.05, boxShadow: "0 30px 60px rgba(203,178,106,0.5)" } : {}}
                                            whileTap={canRoll ? { scale: 0.95 } : {}}
                                            onClick={handleRollClick}
                                            disabled={!canRoll}
                                            className={`
                                                flex-1 max-w-[180px] sm:max-w-[220px] h-14 sm:h-16 rounded-2xl font-black text-[10px] sm:text-[11px] sm:tracking-[0.4em] uppercase 
                                                transition-all duration-500 relative overflow-hidden group
                                                ${!canRoll
                                                    ? 'opacity-0 scale-90 pointer-events-none hidden'
                                                    : 'bg-gradient-to-br from-[#F0D080] via-[#CBB26A] to-[#8E793E] text-[#0A0810] shadow-[0_20px_40px_rgba(0,0,0,0.5)] cursor-pointer'
                                                }
                                            `}
                                        >
                                            {/* Shine effect that only activates on hover */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-[120%] group-hover:animate-[shimmer_1.5s_infinite] skew-x-12" />

                                            <div className="relative flex items-center justify-center gap-3">
                                                <span className="drop-shadow-sm">ROLL DICE</span>
                                                <div className="w-8 h-8 bg-black/10 rounded-xl flex items-center justify-center text-xl group-hover:rotate-[360deg] transition-transform duration-1000">
                                                    🎲
                                                </div>
                                            </div>

                                            {/* Pulse ring for when it's your turn and you haven't rolled yet */}
                                            {canRoll && (
                                                <div className="absolute inset-0 rounded-2xl border-2 border-[#F0D080] animate-ping opacity-20 pointer-events-none" />
                                            )}
                                        </motion.button>

                                        <motion.button
                                            whileHover={canEndTurn ? { scale: 1.05, backgroundColor: "rgba(203,178,106,1)", color: "#0A0810" } : {}}
                                            whileTap={canEndTurn ? { scale: 0.95 } : {}}
                                            onClick={() => { if (canEndTurn) endTurn() }}
                                            disabled={!canEndTurn}
                                            className={`
                                                flex-1 max-w-[180px] h-16 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase
                                                border-2 border-[#CBB26A]/40 text-[#CBB26A] bg-black/40 backdrop-blur-md
                                                transition-all duration-500 relative overflow-hidden group
                                                ${!canEndTurn ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 cursor-pointer'}
                                            `}
                                        >
                                            <div className="relative flex items-center justify-center gap-2">
                                                END TURN
                                                <ArrowRight size={14} className="group-hover:translate-x-1 cursor-pointer transition-transform" />
                                            </div>
                                        </motion.button>
                                    </div>
                                )}
                            </div>

                            {/* Purchase Modal / Property Info Center */}
                            <AnimatePresence>
                                {activeModalSpaceId !== null && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        className="absolute z-[100] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#111827]/96 backdrop-blur-3xl border border-[#CBB26A]/30 p-8 rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.9)] w-80 pointer-events-auto flex flex-col items-center"
                                    >
                                        <button
                                            onClick={() => setActiveModalSpaceId(null)}
                                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-white/40 hover:text-white transition-colors"
                                        >✕</button>

                                        <div className="w-full h-12 rounded-2xl mb-6 shadow-inner" style={{ backgroundColor: BOARD_SPACES[activeModalSpaceId].color || '#CBB26A', background: `linear-gradient(to bottom, ${BOARD_SPACES[activeModalSpaceId].color || '#CBB26A'}, ${BOARD_SPACES[activeModalSpaceId].color || '#CBB26A'}cc)` }} />

                                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-[#CBB26A] mb-2">Investment Opportunity</div>
                                        <h2 className="text-2xl font-black text-white mb-2 text-center leading-none tracking-tighter">{BOARD_SPACES[activeModalSpaceId].name}</h2>
                                        <div className="text-xs font-bold text-slate-500 mb-6 uppercase tracking-widest">{BOARD_SPACES[activeModalSpaceId].country || 'Exclusive'}</div>

                                        <div className="grid grid-cols-2 gap-4 w-full mb-8">
                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
                                                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Cost</div>
                                                <div className="text-lg font-mono font-bold text-white">${BOARD_SPACES[activeModalSpaceId].price}</div>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
                                                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Rent</div>
                                                <div className="text-lg font-mono font-bold text-[#CBB26A]">${BOARD_SPACES[activeModalSpaceId].rent ? BOARD_SPACES[activeModalSpaceId].rent[boardState[activeModalSpaceId]?.houses || 0] : '0'}</div>
                                            </div>
                                        </div>

                                        {!boardState[activeModalSpaceId]?.ownerId ? (
                                            <div className="flex flex-col gap-2 w-full mb-4">
                                                <button
                                                    onClick={() => buyProperty(players[currentTurn].id, activeModalSpaceId)}
                                                    className="w-full py-4 rounded-2xl bg-[#CBB26A] text-[#0A0810] font-black text-sm tracking-[0.2em] shadow-[0_10px_30px_rgba(203,178,106,0.2)] hover:bg-[#DBC27A] hover:scale-[1.02] active:scale-95 transition-all"
                                                >
                                                    ACQUIRE ASSET
                                                </button>
                                                {rules.auctionEnabled && (
                                                    <button
                                                        onClick={() => useGameStore.getState().startAuction(activeModalSpaceId)}
                                                        className="w-full py-3 rounded-2xl border border-amber-500/30 text-amber-500/80 hover:text-amber-400 hover:bg-amber-500/5 font-black text-xs tracking-[0.2em] transition-all"
                                                    >
                                                        START AUCTION
                                                    </button>
                                                )}
                                            </div>
                                        ) : boardState[activeModalSpaceId]?.ownerId === players[currentTurn].id ? (
                                            (() => {
                                                const space = BOARD_SPACES[activeModalSpaceId];
                                                const player = players[currentTurn];
                                                const bState = boardState[activeModalSpaceId];
                                                if (!bState) return null;

                                                if (bState.isMortgaged) {
                                                    const unmortgageCost = Math.floor((space.price || 0) * 0.55);
                                                    const canAfford = player.money >= unmortgageCost;
                                                    return (
                                                        <div className="flex flex-col gap-2 w-full mb-4">
                                                            <div className="w-full py-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-center text-[10px] font-black uppercase tracking-widest font-bold">
                                                                ASSET MORTGAGED
                                                            </div>
                                                            <button
                                                                onClick={() => useGameStore.getState().unmortgageProperty(player.id, activeModalSpaceId)}
                                                                disabled={!canAfford}
                                                                className={`w-full py-4 rounded-2xl font-black text-sm tracking-[0.2em] transition-all ${canAfford
                                                                    ? 'bg-emerald-600 text-white shadow-lg hover:bg-emerald-500 hover:scale-[1.02] active:scale-95'
                                                                    : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                                                                    }`}
                                                            >
                                                                UNMORTGAGE (${unmortgageCost})
                                                            </button>
                                                        </div>
                                                    );
                                                }

                                                if (space.type !== 'property' || bState.houses >= 5) {
                                                    return (
                                                        <div className="flex flex-col gap-2 w-full mb-4">
                                                            <div className="w-full py-4 rounded-2xl bg-white/5 border border-[#CBB26A]/20 text-[#CBB26A] text-center text-xs font-black uppercase tracking-widest font-bold">
                                                                {bState.houses >= 5 ? 'ASSET MAXED OUT (HOTEL)' : 'YOU OWN THIS ASSET'}
                                                            </div>
                                                            {rules.mortgageEnabled && bState.houses === 0 && (
                                                                <button
                                                                    onClick={() => useGameStore.getState().mortgageProperty(player.id, activeModalSpaceId)}
                                                                    className="w-full py-3 rounded-2xl border border-rose-500/30 text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/5 font-black text-xs tracking-[0.2em] transition-all"
                                                                >
                                                                    MORTGAGE FOR ${Math.floor((space.price || 0) / 2)}
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                }

                                                let canBuild = true;
                                                let failReason = "";

                                                if (player.money < (space.housePrice || 0)) {
                                                    canBuild = false;
                                                    failReason = "Not enough money";
                                                }

                                                if (canBuild && monopolyRequiredToBuild) {
                                                    const totalInCountry = BOARD_SPACES.filter(s => s.country === space.country).length;
                                                    const ownedInCountry = BOARD_SPACES.filter(s =>
                                                        s.country === space.country &&
                                                        boardState[s.id]?.ownerId === player.id
                                                    ).length;
                                                    if (ownedInCountry < totalInCountry) {
                                                        canBuild = false;
                                                        failReason = `Need all ${totalInCountry} cities`;
                                                    }
                                                }

                                                if (canBuild && rules.evenBuild) {
                                                    const currentHouses = boardState[activeModalSpaceId].houses;
                                                    const countryProps = BOARD_SPACES.filter(s => s.country === space.country && s.id !== activeModalSpaceId);
                                                    const canBuildEvenly = countryProps.every(s => {
                                                        const st = boardState[s.id];
                                                        return st && st.houses >= currentHouses;
                                                    });
                                                    if (!canBuildEvenly) {
                                                        canBuild = false;
                                                        failReason = "Must build evenly";
                                                    }
                                                }

                                                return (
                                                    <div className="flex flex-col gap-2 w-full mb-4">
                                                        <button
                                                            onClick={() => canBuild && buildHouse(players[currentTurn].id, activeModalSpaceId)}
                                                            disabled={!canBuild}
                                                            className={`w-full py-4 rounded-2xl font-black text-sm tracking-[0.2em] transition-all ${canBuild
                                                                ? 'bg-[#8A58FF] text-white shadow-[0_10px_30px_rgba(138,88,255,0.2)] hover:bg-[#9E75FF] hover:scale-[1.02] active:scale-95 cursor-pointer'
                                                                : 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                                                                }`}
                                                        >
                                                            {canBuild ? `BUILD UPGRADE ($${space.housePrice})` : `CANNOT BUILD: ${failReason}`}
                                                        </button>
                                                        {rules.mortgageEnabled && bState.houses === 0 && (
                                                            <button
                                                                onClick={() => useGameStore.getState().mortgageProperty(player.id, activeModalSpaceId)}
                                                                className="w-full py-3 rounded-2xl border border-rose-500/30 text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/5 font-black text-xs tracking-[0.2em] transition-all"
                                                            >
                                                                MORTGAGE FOR ${Math.floor((space.price || 0) / 2)}
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })()
                                        ) : (
                                            <div className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-500 text-center text-xs font-black uppercase tracking-widest mb-4 flex flex-col gap-1">
                                                <div className="text-[10px] opacity-60">Owned by</div>
                                                <div className="text-white font-bold" style={{ color: players.find(p => p.id === boardState[activeModalSpaceId]?.ownerId)?.color }}>{players.find(p => p.id === boardState[activeModalSpaceId]?.ownerId)?.name || 'Another Player'}</div>
                                            </div>
                                        )}
                                        <div className="text-[9px] text-slate-500 font-bold uppercase tracking-tight italic">Increase your net worth and dominate the coast</div>
                                    </motion.div>
                                )}

                                {activeCard && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8, y: 50, rotateX: 45 }}
                                        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, y: -50, rotateX: -45 }}
                                        className={`absolute z-[110] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto p-10 rounded-[2.5rem] shadow-[0_60px_100px_rgba(0,0,0,0.9)] w-80 text-center border-2 overflow-hidden flex flex-col items-center ${activeCard.type === 'chance' ? 'bg-[#2A1D11]/95 border-[#EAB308]/50 shadow-[0_0_50px_rgba(234,179,8,0.2)]' : 'bg-[#112030]/95 border-[#38BDF8]/50 shadow-[0_0_50px_rgba(56,189,248,0.2)]'} backdrop-blur-2xl`}
                                    >
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-2xl ${activeCard.type === 'chance' ? 'bg-[#EAB308] shadow-[#EAB308]/30' : 'bg-[#38BDF8] shadow-[#38BDF8]/30'}`}>
                                            <span className="text-3xl font-black text-black">{activeCard.type === 'chance' ? '?' : '$'}</span>
                                        </div>

                                        <h3 className={`text-xs font-black uppercase tracking-[0.5em] mb-4 ${activeCard.type === 'chance' ? 'text-[#EAB308]' : 'text-[#38BDF8]'}`}>
                                            {activeCard.type === 'chance' ? 'Surprise Event' : 'Treasury Chest'}
                                        </h3>

                                        <h2 className="text-2xl font-black text-white mb-2 leading-tight tracking-tight">{activeCard.title}</h2>
                                        <p className="text-slate-400 font-bold text-sm mb-10 px-4 leading-relaxed italic border-t border-white/5 pt-4">"{activeCard.description}"</p>

                                        <button
                                            onClick={() => useGameStore.getState().dismissCard()}
                                            className={`w-full py-4 rounded-2xl font-black text-sm tracking-[0.2em] transition-all hover:scale-105 active:scale-95 shadow-xl ${activeCard.type === 'chance' ? 'bg-[#EAB308] text-[#0A0810] hover:bg-[#FACC15]' : 'bg-[#38BDF8] text-[#0A0810] hover:bg-[#7DD3FC]'}`}
                                        >
                                            ACKNOWLEDGE
                                        </button>
                                    </motion.div>
                                )}

                                {activeAuction && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                        className="absolute z-[150] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1A1625]/95 backdrop-blur-3xl p-8 rounded-[2rem] border-2 border-amber-500/50 shadow-[0_0_100px_rgba(245,158,11,0.2)] w-96 flex flex-col items-center"
                                    >
                                        <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mb-6 shadow-2xl">
                                            <Gavel size={32} className="text-[#0A0810]" />
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 mb-2">Live Auction</div>
                                        <h2 className="text-2xl font-black text-white mb-1">{BOARD_SPACES[activeAuction.spaceId].name}</h2>
                                        <div className="text-xs font-bold text-slate-500 mb-8 uppercase tracking-widest">{BOARD_SPACES[activeAuction.spaceId].country || 'Global Asset'}</div>

                                        <div className="w-full bg-black/40 rounded-2xl p-6 border border-white/5 mb-8 flex flex-col items-center">
                                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Current Highest Bid</div>
                                            <div className="text-4xl font-mono font-black text-amber-500 mb-4 animate-pulse">${activeAuction.currentBid}</div>
                                            {activeAuction.highestBidderId ? (
                                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: players.find(p => p.id === activeAuction.highestBidderId)?.color }} />
                                                    <span className="text-xs font-bold text-slate-300">{players.find(p => p.id === activeAuction.highestBidderId)?.name} is leading</span>
                                                </div>
                                            ) : (
                                                <div className="text-[10px] font-bold text-slate-500 uppercase italic">Waiting for first bid...</div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-4 w-full">
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    value={bidAmount || ''}
                                                    onChange={e => setBidAmount(Number(e.target.value))}
                                                    placeholder="Enter bid..."
                                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono font-bold focus:border-amber-500/50 outline-none transition-all"
                                                />
                                                <button
                                                    onClick={() => {
                                                        placeBid(players[currentTurn].id, bidAmount);
                                                        setBidAmount(0);
                                                    }}
                                                    disabled={bidAmount <= activeAuction.currentBid || bidAmount > players[currentTurn].money}
                                                    className="px-6 rounded-xl bg-amber-500 text-[#0A0810] font-black text-xs tracking-widest hover:bg-amber-400 disabled:opacity-50 disabled:grayscale transition-all"
                                                >
                                                    BID
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => placeBid(players[currentTurn].id, activeAuction.currentBid + 10)}
                                                    className="py-3 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black hover:bg-white/10 transition-all"
                                                >
                                                    +$10 FAST BID
                                                </button>
                                                <button
                                                    onClick={() => placeBid(players[currentTurn].id, activeAuction.currentBid + 50)}
                                                    className="py-3 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black hover:bg-white/10 transition-all"
                                                >
                                                    +$50 PRO BID
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => endAuction()}
                                                className="mt-4 w-full py-4 rounded-xl bg-emerald-600 text-white font-black text-sm tracking-[0.2em] shadow-xl hover:bg-emerald-500 transition-all border border-emerald-400/20"
                                            >
                                                HAMMER DOWN / END
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Setup Modal overlaying the board strictly during setup */}
                {/* The board remains visible in the background, making it feel smoother */}
                {players.length === 0 && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-none" />
                )}
            </div>

            {/* RIGHT SIDEBAR - MIDNIGHT LUXURY STYLE */}
            <div className="w-[300px] sm:w-[320px] bg-[#171324] border-l border-[#2A2438] flex flex-col flex-shrink-0 z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)] overflow-y-auto">
                {players.length === 0 ? (
                    // Setup Mode Panel
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b border-[#2A2438] text-center text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-widest bg-[#120F1D]">
                            {tempPlayers.length === 0 ? "Waiting for players..." : tempPlayers.length < 2 ? "Waiting for players..." : "Ready to start!"}
                        </div>
                        <div className="p-4 sm:p-6 flex-1 flex flex-col gap-6">
                            {/* Added Players preview list */}
                            {tempPlayers.length > 0 && (
                                <div className="flex flex-col gap-2 bg-[#0E0B16] p-4 rounded-2xl border border-[#2A2438]">
                                    <div className="text-sm font-bold text-slate-200 mb-2 flex justify-between items-center">
                                        <span>Lobby Roster</span>
                                        <span className="text-[#CBB26A] text-xs font-mono bg-[#CBB26A]/10 px-2 py-0.5 rounded border border-[#CBB26A]/20">{tempPlayers.length}/8</span>
                                    </div>
                                    <AnimatePresence>
                                        {tempPlayers.map((p) => (
                                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} key={p.id} className="flex justify-between items-center bg-[#171324] p-3 rounded-xl border border-[#2A2438]">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-inner" style={{ backgroundColor: p.color }}>
                                                        <div className="flex gap-1 opacity-90 mix-blend-overlay pointer-events-none">
                                                            <div className="w-2 h-2 bg-white rounded-full" />
                                                            <div className="w-2 h-2 bg-white rounded-full" />
                                                        </div>
                                                    </div>
                                                    <span className="text-sm font-bold text-slate-200 truncate max-w-[120px]">{p.name}</span>
                                                </div>
                                                <button onClick={() => handleRemovePlayer(p.id)} className="text-slate-500 hover:text-rose-500 font-black w-6 h-6 flex items-center justify-center bg-[#0E0B16] rounded-md transition-colors">✕</button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}

                            {/* Game settings panel */}
                            <div>
                                <div className="text-xs font-bold text-white mb-4 bg-[#2A2438] py-2 px-3 rounded-lg text-center uppercase tracking-widest shadow-inner">Game settings</div>
                                <div className="flex flex-col gap-4 px-2">
                                    <div className="flex justify-between items-center bg-[#0E0B16] p-3 rounded-2xl border border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-200">Dice Theme</span>
                                            <span className="text-[10px] text-slate-500 font-medium">Select your lucky dice</span>
                                        </div>
                                        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                                            <button
                                                onClick={() => setDicePreference('white')}
                                                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${dicePreference === 'white' ? 'bg-[#CBB26A] text-[#0A0810] shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                            >
                                                WHITE
                                            </button>
                                            <button
                                                onClick={() => setDicePreference('red')}
                                                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${dicePreference === 'red' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                            >
                                                RED
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center bg-[#0E0B16] p-3 rounded-2xl border border-white/5">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-200">Building Rules</span>
                                            <span className="text-[10px] text-slate-500 font-medium">Free Build vs Monopoly</span>
                                        </div>
                                        <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                                            <button
                                                onClick={() => setMonopolyRequiredToBuild(false)}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${!monopolyRequiredToBuild ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                            >
                                                FREE
                                            </button>
                                            <button
                                                onClick={() => setMonopolyRequiredToBuild(true)}
                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all ${monopolyRequiredToBuild ? 'bg-[#CBB26A] text-[#0A0810] shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                            >
                                                MONOPOLY
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 mt-6 px-1">Gameplay rules</div>
                                    <div className="flex flex-col bg-[#0E0B16] rounded-2xl border border-white/5 divide-y divide-white/5 overflow-hidden">
                                        <RuleToggle
                                            icon={Coins}
                                            title="x2 rent on full-sets"
                                            description="Base rent is doubled when owning a full country set"
                                            value={rules.doubleRentOnSets}
                                            onChange={(v) => setRule('doubleRentOnSets', v)}
                                        />
                                        <RuleToggle
                                            icon={Palmtree}
                                            title="Vacation cash"
                                            description="Collected taxes are earned by landing on Vacation"
                                            value={rules.vacationCash}
                                            onChange={(v) => setRule('vacationCash', v)}
                                        />
                                        <RuleToggle
                                            icon={Gavel}
                                            title="Auction"
                                            description="Unpurchased properties are sold to highest bidder"
                                            value={rules.auctionEnabled}
                                            onChange={(v) => setRule('auctionEnabled', v)}
                                        />
                                        <RuleToggle
                                            icon={Lock}
                                            title="No rent in jail"
                                            description="Rent is not collected while owner is in prison"
                                            value={rules.noRentInJail}
                                            onChange={(v) => setRule('noRentInJail', v)}
                                        />
                                        <RuleToggle
                                            icon={DollarSign}
                                            title="Mortgage"
                                            description="Mortgage properties to earn 50% of cost back"
                                            value={rules.mortgageEnabled}
                                            onChange={(v) => setRule('mortgageEnabled', v)}
                                        />
                                        <RuleToggle
                                            icon={Home}
                                            title="Even build"
                                            description="Houses must be distributed evenly within sets"
                                            value={rules.evenBuild}
                                            onChange={(v) => setRule('evenBuild', v)}
                                        />
                                        <RuleToggle
                                            icon={Shuffle}
                                            title="Randomize player order"
                                            description="Randomly reorder players at the match start"
                                            value={rules.randomizeOrder}
                                            onChange={(v) => setRule('randomizeOrder', v)}
                                        />
                                    </div>

                                    <div className="flex justify-between items-center mt-8 px-2 mb-2">
                                        <div className="flex flex-col">
                                            <span className="text-lg font-black text-white tracking-tighter">Starting cash</span>
                                            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Initial bank balance</span>
                                        </div>
                                        <div className="relative">
                                            <select
                                                value={startMoney}
                                                onChange={e => setStartMoney(Number(e.target.value))}
                                                className="bg-[#1A1625] border border-white/10 rounded-2xl px-6 py-3 text-sm font-mono font-black text-white outline-none focus:border-[#CBB26A] shadow-2xl cursor-pointer appearance-none pr-10 transition-all hover:bg-[#231E32]"
                                            >
                                                {[1500, 2000, 2500, 3000, 3500, 4000].map(val => (
                                                    <option key={val} value={val}>${val}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#CBB26A]">
                                                <ChevronRight size={16} className="rotate-90" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 sm:p-6 border-t border-[#2A2438] bg-[#120F1D] flex items-center justify-center">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Setup your match rules above</span>
                        </div>
                    </div>
                ) : (
                    // Play Mode Panel
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b border-[#2A2438] bg-[#120F1D] flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Players</span>
                            <span className="text-xs text-[#CBB26A] font-bold bg-[#CBB26A]/10 px-2 py-1 rounded-md">{players.length} Playing</span>
                        </div>
                        <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto border-b border-[#2A2438]">
                            {players.map((p, i) => (
                                <motion.div layout key={p.id} className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${currentTurn === i ? 'border-[#CBB26A] bg-[#2A2438] shadow-[0_0_15px_rgba(203,178,106,0.15)] scale-[1.02] z-10' : 'border-[#2A2438] bg-[#1D182E]'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] bg-slate-800" style={{ backgroundColor: p.color }}>
                                            {/* Mini Eyes */}
                                            <div className="flex gap-1.5 opacity-90 mix-blend-overlay pointer-events-none">
                                                <div className="w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center"><div className="w-1 h-1 bg-black rounded-full" /></div>
                                                <div className="w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center"><div className="w-1 h-1 bg-black rounded-full" /></div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="font-bold text-sm text-slate-100 truncate w-24">
                                                {p.name}
                                            </div>
                                            {currentTurn === i && <div className="text-[9px] text-[#8A58FF] uppercase font-black tracking-widest mt-1">Playing</div>}
                                        </div>
                                    </div>
                                    <div className="font-mono text-sm font-bold text-slate-200 bg-[#0E0B16] px-3 py-1.5 rounded-lg border border-[#2A2438] shadow-inner">${p.money}</div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-[#2A2438] bg-[#120F1D]">
                            <button
                                onClick={() => {
                                    const otherPlayers = players.filter((_, i) => i !== currentTurn);
                                    if (otherPlayers.length > 0) {
                                        setTradeTargetPlayerId(otherPlayers[0].id);
                                        setIsTradeModalOpen(true);
                                    }
                                }}
                                className="w-full bg-[#1D182E] hover:bg-[#2A2438] active:bg-[#1D182E] border border-[#2A2438] text-slate-300 py-4 rounded-xl font-bold transition-all shadow-lg text-sm uppercase tracking-widest"
                            >
                                Propose Trade
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* TRADE PROPOSAL MODAL */}
            <AnimatePresence>
                {isTradeModalOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#171324] border border-[#2A2438] w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-[#2A2438] flex justify-between items-center bg-[#120F1D]">
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">New Trade Proposal</h3>
                                <button onClick={() => setIsTradeModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">✕</button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-8 bg-[#120F1D]/50">
                                {/* Left Side: Your Offer */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="text-xs font-black text-[#8A58FF] uppercase tracking-widest">Your Offer</div>
                                        <div className="text-[10px] font-mono text-slate-500">${players[currentTurn].money} available</div>
                                    </div>
                                    <div className="space-y-2 bg-[#0E0B16] p-4 rounded-2xl border border-[#2A2438]">
                                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Money Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                            <input type="number" value={offeredMoney} onChange={e => setOfferedMoney(Number(e.target.value))} className="w-full bg-[#171324] border border-[#2A2438] rounded-xl py-3 pl-8 pr-4 text-white font-mono font-bold outline-none focus:border-[#8A58FF] transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 flex-1 flex flex-col min-h-0">
                                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-tight ml-1">Select Properties</label>
                                        <div className="grid grid-cols-1 gap-2 overflow-y-auto pr-2 custom-scrollbar">
                                            {BOARD_SPACES.filter(s => boardState[s.id]?.ownerId === players[currentTurn].id).length === 0 ? (
                                                <div className="text-[10px] text-slate-600 italic p-4 border border-dashed border-[#2A2438] rounded-xl text-center">No properties owned</div>
                                            ) : (
                                                BOARD_SPACES.filter(s => boardState[s.id]?.ownerId === players[currentTurn].id).map(s => (
                                                    <button key={s.id} onClick={() => offeredPropertyIds.includes(s.id) ? setOfferedPropertyIds(offeredPropertyIds.filter(id => id !== s.id)) : setOfferedPropertyIds([...offeredPropertyIds, s.id])} className={`p-3 rounded-xl border text-[11px] font-bold text-left flex items-center justify-between transition-all group ${offeredPropertyIds.includes(s.id) ? 'bg-[#8A58FF] border-[#8A58FF] text-white shadow-[0_0_15px_rgba(138,88,255,0.2)]' : 'bg-[#0E0B16] border-[#2A2438] text-slate-400 hover:border-slate-600'}`}>
                                                        <span>{s.name}</span>
                                                        {offeredPropertyIds.includes(s.id) && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white]" />}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Request From */}
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-between items-center">
                                        <div className="text-xs font-black text-emerald-400 uppercase tracking-widest">Request From</div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: players.find(p => p.id === tradeTargetPlayerId)?.color }} />
                                            <select value={tradeTargetPlayerId} onChange={e => setTradeTargetPlayerId(e.target.value)} className="bg-[#0E0B16] border border-[#2A2438] text-[10px] font-bold text-white rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:bg-[#171324] transition-colors">
                                                {players.filter((_, i) => i !== currentTurn).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-2 bg-[#0E0B16] p-4 rounded-2xl border border-[#2A2438]">
                                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Money Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                                            <input type="number" value={requestMoney} onChange={e => setRequestMoney(Number(e.target.value))} className="w-full bg-[#171324] border border-[#2A2438] rounded-xl py-3 pl-8 pr-4 text-white font-mono font-bold outline-none focus:border-emerald-500 transition-all" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 flex-1 flex flex-col min-h-0">
                                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-tight ml-1">Request Properties</label>
                                        <div className="grid grid-cols-1 gap-2 overflow-y-auto pr-2 custom-scrollbar">
                                            {BOARD_SPACES.filter(s => boardState[s.id]?.ownerId === tradeTargetPlayerId).length === 0 ? (
                                                <div className="text-[10px] text-slate-600 italic p-4 border border-dashed border-[#2A2438] rounded-xl text-center">Player owns no properties</div>
                                            ) : (
                                                BOARD_SPACES.filter(s => boardState[s.id]?.ownerId === tradeTargetPlayerId).map(s => (
                                                    <button key={s.id} onClick={() => requestPropertyIds.includes(s.id) ? setRequestPropertyIds(requestPropertyIds.filter(id => id !== s.id)) : setRequestPropertyIds([...requestPropertyIds, s.id])} className={`p-3 rounded-xl border text-[11px] font-bold text-left flex items-center justify-between transition-all group ${requestPropertyIds.includes(s.id) ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-[#0E0B16] border-[#2A2438] text-slate-400 hover:border-slate-600'}`}>
                                                        <span>{s.name}</span>
                                                        {requestPropertyIds.includes(s.id) && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_white]" />}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-[#120F1D] border-t border-[#2A2438] flex gap-4">
                                <button onClick={() => setIsTradeModalOpen(false)} className="flex-1 py-4 rounded-xl font-bold bg-[#1D182E] text-slate-400 hover:text-white transition-colors">Cancel</button>
                                <button onClick={handleProposeTrade} className="flex-[2] py-4 rounded-xl font-black bg-[#8A58FF] text-white hover:bg-[#7241eb] shadow-lg shadow-[#8A58FF]/20 transition-all active:scale-95">Send Proposal</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* INCOMING TRADE OVERLAY */}
            <AnimatePresence>
                {activeTrade && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
                        <motion.div initial={{ scale: 0.8, y: 50 }} animate={{ scale: 1, y: 0 }} className="bg-[#171324] border-2 border-[#8A58FF] p-8 rounded-[2.5rem] w-full max-w-md shadow-[0_0_50px_rgba(138,88,255,0.3)] text-center">
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Trade Received!</h3>
                            <p className="text-slate-400 text-sm mb-8">
                                <span className="font-bold text-white">{players.find(p => p.id === activeTrade.fromPlayerId)?.name}</span> has proposed a deal to you.
                            </p>

                            <div className="bg-[#0E0B16] rounded-3xl p-6 mb-8 border border-[#2A2438] text-left space-y-6">
                                <div>
                                    <div className="text-[10px] font-black text-[#8A58FF] uppercase tracking-widest mb-2">You receive</div>
                                    <div className="text-xl font-mono font-bold text-white">${activeTrade.offeredMoney}</div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {activeTrade.offeredPropertyIds.map(id => <span key={id} className="text-[9px] bg-[#1d182e] px-2 py-1 rounded text-slate-300 border border-[#2A2438]">{BOARD_SPACES[id].name}</span>)}
                                    </div>
                                </div>
                                <div className="h-px bg-[#2A2438] w-full" />
                                <div>
                                    <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">You give</div>
                                    <div className="text-xl font-mono font-bold text-white">${activeTrade.requestMoney}</div>
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {activeTrade.requestPropertyIds.map(id => <span key={id} className="text-[9px] bg-[#1d182e] px-2 py-1 rounded text-slate-300 border border-[#2A2438]">{BOARD_SPACES[id].name}</span>)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => respondToTrade(false)} className="flex-1 py-4 rounded-2xl font-bold bg-[#1D182E] text-slate-300 hover:bg-rose-950/30 hover:text-rose-400 transition-all border border-[#2A2438]">Decline</button>
                                <button onClick={() => respondToTrade(true)} className="flex-1 py-4 rounded-2xl font-black bg-[#8A58FF] text-white hover:bg-[#7241eb] shadow-lg shadow-[#8A58FF]/20 transition-all active:scale-95">Accept Deal</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* CHAT FLOATING POPUP */}
            {players.length > 0 && (
                <div className="fixed bottom-6 left-6 z-[1000] flex flex-col items-start gap-4 pointer-events-none">
                    <AnimatePresence>
                        {isChatOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom left' }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="w-[320px] h-[450px] bg-[#0A0810]/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-[0_50px_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden pointer-events-auto"
                            >
                                <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#CBB26A]">Crew Chat</span>
                                    </div>
                                    <button onClick={() => setIsChatOpen(false)} className="text-slate-500 hover:text-white transition-colors">✕</button>
                                </div>

                                <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 custom-scrollbar">
                                    {chatMessages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center opacity-20 select-none">
                                            <div className="text-4xl mb-3">💬</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest">No signals yet</div>
                                        </div>
                                    ) : (
                                        chatMessages.map(msg => (
                                            <div key={msg.id} className="flex flex-col group">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <div className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: msg.senderColor, color: msg.senderColor }} />
                                                    <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter">{msg.senderName}</span>
                                                    <span className="text-[8px] text-white/20 font-mono ml-auto">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <div className="bg-white/5 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-200 border border-white/5 group-hover:bg-white/10 transition-colors leading-relaxed">
                                                    {msg.text}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                <div className="p-4 bg-[#0E0B16] border-t border-white/10">
                                    <form
                                        onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
                                        className="relative flex items-center bg-white/5 rounded-2xl border border-white/10 focus-within:border-[#CBB26A]/50 transition-all p-1.5"
                                    >
                                        <input
                                            type="text"
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            placeholder="Transmit message..."
                                            className="flex-1 bg-transparent py-2 pl-4 pr-12 text-xs text-white outline-none placeholder:text-slate-600 font-medium"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!chatInput.trim()}
                                            className="absolute right-1.5 w-9 h-9 rounded-xl bg-[#CBB26A] text-[#0A0810] flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale"
                                        >
                                            <Send size={16} />
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={() => setIsChatOpen(!isChatOpen)}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-90 pointer-events-auto relative ${isChatOpen ? 'bg-white text-black' : 'bg-[#CBB26A] text-[#0A0810]'}`}
                    >
                        {isChatOpen ? <span className="text-xl font-black">✕</span> : <Send size={24} />}
                        {chatMessages.length > 0 && !isChatOpen && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full border-2 border-[#0A0810] flex items-center justify-center text-[10px] font-black text-white">
                                {chatMessages.length > 9 ? '9+' : chatMessages.length}
                            </div>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};
