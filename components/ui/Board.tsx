import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, BOARD_SPACES } from '../../store/useGameStore';

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

import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';

import { Car, Zap, Droplets, Train, AlertTriangle, Play, Lock, Siren, Send } from 'lucide-react';

const Token3D = ({ color, shape }: { color: string, shape?: string }) => {
    const meshRef = React.useRef<THREE.Group>(null);
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
            meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 2) * 0.1;
        }
    });

    const materialProps = {
        color: color,
        metalness: 0.7,
        roughness: 0.2,
        envMapIntensity: 2
    };

    return (
        <group ref={meshRef} scale={1.5}>
            {shape === 'cube' && (
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial {...materialProps} />
                </mesh>
            )}
            {shape === 'sphere' && (
                <mesh castShadow receiveShadow>
                    <sphereGeometry args={[0.7, 32, 32]} />
                    <meshStandardMaterial {...materialProps} />
                </mesh>
            )}
            {shape === 'car' && (
                <group>
                    <mesh castShadow receiveShadow position={[0, 0.2, 0]}>
                        <boxGeometry args={[1.2, 0.6, 2.2]} />
                        <meshStandardMaterial {...materialProps} />
                    </mesh>
                    <mesh castShadow position={[0, 0.7, -0.2]}>
                        <boxGeometry args={[1, 0.5, 1]} />
                        <meshStandardMaterial {...materialProps} />
                    </mesh>
                </group>
            )}
            {shape === 'horse' && (
                <group scale={0.8} position={[0, -0.2, 0]}>
                    <mesh castShadow position={[0, 0, 0]}>
                        <cylinderGeometry args={[0.6, 0.8, 0.4, 16]} />
                        <meshStandardMaterial {...materialProps} />
                    </mesh>
                    <mesh castShadow position={[0, 0.8, 0]} rotation={[0.4, 0, 0]}>
                        <boxGeometry args={[0.4, 1.4, 0.5]} />
                        <meshStandardMaterial {...materialProps} />
                    </mesh>
                    <mesh castShadow position={[0, 1.4, 0.3]} rotation={[-0.2, 0, 0]}>
                        <boxGeometry args={[0.4, 0.5, 0.8]} />
                        <meshStandardMaterial {...materialProps} />
                    </mesh>
                </group>
            )}
            {shape === 'hat' && (
                <group scale={0.8} position={[0, -0.2, 0]}>
                    <mesh castShadow position={[0, 0, 0]}>
                        <cylinderGeometry args={[0.9, 0.9, 0.15, 32]} />
                        <meshStandardMaterial {...materialProps} />
                    </mesh>
                    <mesh castShadow position={[0, 0.6, 0]}>
                        <cylinderGeometry args={[0.6, 0.6, 1.2, 32]} />
                        <meshStandardMaterial {...materialProps} />
                    </mesh>
                </group>
            )}
            {shape === 'ship' && (
                <group rotation={[0, Math.PI, 0]} scale={0.8}>
                    <mesh castShadow rotation={[0, 0, Math.PI]} scale={[1, 0.4, 1.2]}>
                        <coneGeometry args={[0.8, 2.5, 3]} />
                        <meshStandardMaterial {...materialProps} />
                    </mesh>
                    <mesh castShadow position={[0, 0.6, 0.2]}>
                        <boxGeometry args={[0.2, 1, 0.2]} />
                        <meshStandardMaterial {...materialProps} />
                    </mesh>
                </group>
            )}
            {(shape === 'cylinder' || !shape) && (
                <mesh castShadow receiveShadow>
                    <cylinderGeometry args={[0.5, 0.7, 1.5, 32]} />
                    <meshStandardMaterial {...materialProps} />
                </mesh>
            )}
            {shape === 'cone' && (
                <mesh castShadow receiveShadow>
                    <coneGeometry args={[0.7, 1.5, 32]} />
                    <meshStandardMaterial {...materialProps} />
                </mesh>
            )}
            <ContactShadows position={[0, -0.8, 0]} opacity={0.6} scale={4} blur={2.5} far={1.5} />
        </group>
    );
};

const DicePip = ({ position }: { position: [number, number, number] }) => (
    <mesh position={position}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
    </mesh>
);

const Dice3D = ({ value, rolling }: { value: number, rolling: boolean }) => {
    const meshRef = React.useRef<THREE.Group>(null);

    const targetRotations: Record<number, [number, number, number]> = {
        1: [-Math.PI / 2, 0, 0],
        2: [0, 0, Math.PI / 2],
        3: [0, 0, 0],
        4: [Math.PI, 0, 0],
        5: [0, 0, -Math.PI / 2],
        6: [Math.PI / 2, 0, 0],
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

    const d = 0.4;
    const offset = 0.73;

    return (
        <group ref={meshRef}>
            <RoundedBox args={[1.5, 1.5, 1.5]} radius={0.15} smoothness={4} castShadow receiveShadow>
                <meshStandardMaterial color="#f0f2f5" roughness={0.3} metalness={0.1} />
            </RoundedBox>

            <DicePip position={[0, 0, offset]} />

            <DicePip position={[-d, -d, -offset]} />
            <DicePip position={[-d, 0, -offset]} />
            <DicePip position={[-d, d, -offset]} />
            <DicePip position={[d, -d, -offset]} />
            <DicePip position={[d, 0, -offset]} />
            <DicePip position={[d, d, -offset]} />

            <DicePip position={[offset, -d, -d]} />
            <DicePip position={[offset, d, d]} />

            <DicePip position={[-offset, -d, -d]} />
            <DicePip position={[-offset, d, d]} />
            <DicePip position={[-offset, 0, 0]} />
            <DicePip position={[-offset, -d, d]} />
            <DicePip position={[-offset, d, -d]} />

            <DicePip position={[-d, offset, -d]} />
            <DicePip position={[0, offset, 0]} />
            <DicePip position={[d, offset, d]} />

            <DicePip position={[-d, -offset, -d]} />
            <DicePip position={[-d, -offset, d]} />
            <DicePip position={[d, -offset, -d]} />
            <DicePip position={[d, -offset, d]} />
        </group>
    );
};

export const Board = () => {
    const { players, currentTurn, boardState, rollDice, endTurn, diceRoll, activeCard, activeTrade, hasRolled, respondToTrade, proposeTrade, chatMessages, sendMessage } = useGameStore();
    const [isRolling, setIsRolling] = useState(false);
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

    const canRoll = !hasRolled;
    const canEndTurn = hasRolled;

    const handleRollClick = () => {
        if (!canRoll) return;
        setIsRolling(true);
        setTimeout(() => setIsRolling(false), 300);
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

                            {/* Preview Area for Item Shaper */}
                            <div className="w-full h-40 bg-[#0E0B16] rounded-2xl border border-[#2A2438] relative overflow-hidden group shadow-inner">
                                <div className="absolute top-2 left-3 text-[9px] uppercase font-bold text-slate-600 tracking-widest z-10">Preview</div>
                                <Canvas camera={{ position: [0, 2, 5], fov: 35 }}>
                                    <ambientLight intensity={0.6} />
                                    <pointLight position={[10, 10, 10]} intensity={1.2} />
                                    <Token3D color={newPlayerColor} shape={newPlayerShape} />
                                </Canvas>
                                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0E0B16] to-transparent pointer-events-none" />
                            </div>

                            <button onClick={handleAddPlayer} disabled={tempPlayers.length >= 8} className="w-full bg-[#CBB26A] hover:bg-[#B19859] text-[#0E0B16] py-4 rounded-xl font-black transition-all active:scale-[0.98] shadow-lg shadow-[#CBB26A]/20 flex items-center justify-center gap-2 group">
                                JOIN LOBBY <Play size={16} fill="#0E0B16" className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                ) : (
                    /* ACTIVE GAME SIDEBAR CONTENT */
                    <>
                        <div className="px-4 mb-4">
                            <div className="bg-[#0E0B16] p-4 rounded-xl border border-[#2A2438]">
                                <div className="text-xs text-slate-400 font-bold mb-3">Share this game</div>
                                <div className="flex gap-2">
                                    <input type="text" readOnly value="Local Play Only" className="bg-[#171324] border border-[#2A2438] rounded-lg outline-none text-[11px] w-full px-3 text-slate-300 font-mono" />
                                    <button className="bg-[#2A2438] hover:bg-[#3B3450] text-xs px-3 py-2 rounded-lg transition-colors font-bold whitespace-nowrap text-white" title="Copy">
                                        Copy
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col mx-4 mb-4 bg-[#0E0B16] rounded-xl border border-white/5 overflow-hidden flex-shrink-0 min-h-0 shadow-2xl">
                            <div className="px-5 py-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#CBB26A]">Crew Chat</span>
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">Live</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar bg-[#0A0810]/50">
                                {chatMessages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center opacity-20 select-none">
                                        <div className="text-3xl mb-2">💬</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest">No messages yet</div>
                                    </div>
                                ) : (
                                    chatMessages.map(msg => (
                                        <div key={msg.id} className="flex flex-col group">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: msg.senderColor }} />
                                                <span className="text-[10px] font-black text-white/50 uppercase tracking-tighter">{msg.senderName}</span>
                                                <span className="text-[8px] text-white/20 font-mono ml-auto">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <div className="bg-white/5 rounded-2xl rounded-tl-none px-3 py-2 text-xs text-slate-200 border border-white/5 group-hover:bg-white/10 transition-colors">
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <div className="p-3 bg-[#0E0B16] border-t border-white/5">
                                <form
                                    onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
                                    className="relative flex items-center bg-white/5 rounded-xl border border-white/10 focus-within:border-[#CBB26A]/50 transition-all p-1"
                                >
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Send a message..."
                                        className="flex-1 bg-transparent py-2 pl-3 pr-10 text-xs text-white outline-none placeholder:text-slate-600 font-medium"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!chatInput.trim()}
                                        className="absolute right-1 w-8 h-8 rounded-lg bg-[#CBB26A] text-[#0A0810] flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
                                    >
                                        <Send size={14} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="flex-1 relative flex items-center justify-center p-2 sm:p-4 lg:p-8 overflow-hidden bg-[#0E0B16]">
                {/* Fixed width container to keep board perfectly square natively */}
                <div className="w-full h-full max-w-[85vh] max-h-[85vh] aspect-square relative transition-transform duration-500" style={{ perspective: "1500px" }}>
                    {/* The Game Board */}
                    <div
                        className="grid gap-1 sm:gap-1.5 p-1 sm:p-2 bg-[#0E0B16] rounded-xl relative w-full h-full border-[2px] border-[#2A2438]/50 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                        style={{
                            gridTemplateRows: "1.2fr repeat(9, 1fr) 1.2fr",
                            gridTemplateColumns: "1.2fr repeat(9, 1fr) 1.2fr",
                        }}
                    >
                        {BOARD_SPACES.map((space) => {
                            const { gridRow, gridColumn } = getGridArea(space.id);
                            const bState = boardState[space.id];
                            const isCorner = space.id % 10 === 0;

                            let edge = 'top';
                            if (space.id > 10 && space.id < 20) edge = 'right';
                            if (space.id > 20 && space.id < 30) edge = 'bottom';
                            if (space.id > 30 && space.id < 40) edge = 'left';

                            return (
                                <div
                                    key={space.id}
                                    className={`relative flex flex-col items-center justify-center bg-[#171421] rounded-lg overflow-hidden transition-all duration-300 border border-white/10 group/space ${isCorner ? 'p-1 sm:p-2' : ''} shadow-[0_4px_0_0_rgba(0,0,0,0.4)] hover:shadow-none hover:translate-y-[2px]`}
                                    style={{ gridRow, gridColumn }}
                                >
                                    {/* Glass Reflection Top */}
                                    <div className="absolute inset-x-0 top-0 h-[10%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                                    {/* Color header for properties with gradient */}
                                    {space.type === 'property' && space.color && (
                                        <div
                                            className="absolute z-0 shadow-inner"
                                            style={{
                                                ... (edge === 'bottom' ? { top: 0, left: 0, right: 0, height: '26%' } : {}),
                                                ... (edge === 'left' ? { top: 0, right: 0, bottom: 0, width: '26%' } : {}),
                                                ... (edge === 'top' ? { bottom: 0, left: 0, right: 0, height: '26%' } : {}),
                                                ... (edge === 'right' ? { top: 0, left: 0, bottom: 0, width: '26%' } : {}),
                                                background: `linear-gradient(to ${edge === 'top' ? 'top' : edge === 'bottom' ? 'bottom' : edge === 'left' ? 'left' : 'right'}, ${space.color}, ${space.color}cc)`,
                                                borderBottom: edge === 'bottom' ? '2px solid rgba(255,255,255,0.2)' : 'none',
                                                borderTop: edge === 'top' ? '2px solid rgba(255,255,255,0.2)' : 'none',
                                                borderLeft: edge === 'left' ? '2px solid rgba(255,255,255,0.2)' : 'none',
                                                borderRight: edge === 'right' ? '2px solid rgba(255,255,255,0.2)' : 'none',
                                            }}
                                        />
                                    )}

                                    {/* Inner Content Wrapper */}
                                    <div
                                        className={`flex flex-col items-center justify-between w-full h-full p-0.5 sm:p-1 text-center absolute inset-0 z-10 
                                        ${!isCorner && space.type === 'property' && edge === 'bottom' ? 'pt-[28%]' :
                                                !isCorner && space.type === 'property' && edge === 'top' ? 'pb-[28%]' :
                                                    !isCorner && space.type === 'property' && edge === 'left' ? 'pr-[28%]' :
                                                        !isCorner && space.type === 'property' && edge === 'right' ? 'pl-[28%]' : ''}`}
                                    >
                                        <div className="flex-1 flex flex-col items-center justify-center w-full mt-0.5">
                                            {isCorner && space.id === 0 && <Play size={20} className="text-[#CBB26A] mb-1 sm:mb-2" />}
                                            {isCorner && space.id === 10 && <Lock size={16} className="text-rose-500 mb-1 sm:mb-2" />}
                                            {isCorner && space.id === 20 && <Car size={20} className="text-sky-400 mb-1 sm:mb-2" />}
                                            {isCorner && space.id === 30 && <Siren size={20} className="text-amber-500 mb-1 sm:mb-2" />}
                                            {!isCorner && space.type === 'station' && <Train size={12} className="text-slate-400 mb-0.5" />}
                                            {!isCorner && space.type === 'utility' && space.id === 12 && <Zap size={12} className="text-yellow-400 mb-0.5" />}
                                            {!isCorner && space.type === 'utility' && space.id === 28 && <Droplets size={12} className="text-blue-400 mb-0.5" />}
                                            {!isCorner && space.type === 'tax' && <AlertTriangle size={12} className="text-[#CBB26A] mb-0.5" />}

                                            <span className={`font-black tracking-normal text-white leading-tight flex flex-col items-center justify-center w-full px-1 
                                                ${isCorner ? 'text-[11px] sm:text-[13px] md:text-[15px] uppercase' : 'text-[9px] sm:text-[11px] md:text-[12px]'} drop-shadow-lg`}
                                                style={{ wordBreak: 'break-word', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
                                                {space.name}
                                            </span>
                                        </div>


                                        {space.price && (
                                            <span className="font-mono font-black text-white pb-0.5 text-[8px] sm:text-[10px] md:text-[11px] px-1.5 py-0.5 rounded shadow-lg" style={{ background: 'rgba(0,0,0,0.5)', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                                                {space.price}$
                                            </span>
                                        )}
                                        {space.type === 'tax' && (
                                            <span className="font-mono font-black text-[#CBB26A] pb-1 text-[8px] sm:text-[10px] md:text-[11px] uppercase tracking-widest leading-none px-1.5 py-0.5 rounded shadow-lg" style={{ background: 'rgba(0,0,0,0.5)' }}>
                                                {space.id === 4 ? "10% FEE" : `${space.price}$ FEE`}
                                            </span>
                                        )}
                                    </div>

                                    {/* Ownership markers */}
                                    {bState?.ownerId && (
                                        <div className="absolute top-0 right-0 w-full h-full border-[2px] sm:border-[3px] rounded-md sm:rounded-lg opacity-80 pointer-events-none" style={{ borderColor: players.find(p => p.id === bState.ownerId)?.color || 'white' }} />
                                    )}
                                </div>
                            );
                        })}

                        {/* Tokens layer over the board grid */}
                        <div className="absolute inset-0 pointer-events-none" style={{ display: 'grid', gridTemplateRows: '1.2fr repeat(9, 1fr) 1.2fr', gridTemplateColumns: '1.2fr repeat(9, 1fr) 1.2fr', gap: '4px', padding: '8px' }}>
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

                                    return (
                                        <motion.div
                                            key={player.id}
                                            layout
                                            initial={false}
                                            animate={{
                                                gridRowStart: gridRow,
                                                gridColumnStart: gridColumn,
                                                x: offsetX,
                                                y: offsetY,
                                                // Jump animation using keyframes for y-offset
                                                translateY: [0, -25, 0]
                                            }}
                                            transition={{
                                                layout: { type: "spring", stiffness: 100, damping: 25 },
                                                translateY: { duration: 0.4, ease: "easeOut" }
                                            }}
                                            className="w-full h-full flex items-center justify-center pointer-events-auto"
                                            style={{ zIndex: 100 + playerIdx }}
                                        >
                                            <div className="w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 -mt-4 drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                                                <Canvas camera={{ position: [0, 2.5, 5], fov: 35 }} style={{ pointerEvents: 'none' }}>
                                                    <ambientLight intensity={0.7} />
                                                    <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
                                                    <Token3D color={player.color} shape={player.shape} />
                                                </Canvas>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {/* Center Info Area */}
                        <div
                            className="flex flex-col items-center justify-center p-4 sm:p-8 pointer-events-none relative"
                            style={{ gridRow: "2 / 11", gridColumn: "2 / 11" }}
                        >
                            {/* LUXURY CENTER LOGO */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none select-none">
                                <div className="text-[6vw] font-black tracking-tighter text-white rotate-[-45deg] blur-[3px]">OPOLY</div>
                            </div>

                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute flex flex-col items-center justify-center mb-28">

                                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
                                    MEDITERRAN<span className="text-[#CBB26A]">OPOLY</span>
                                </h1>
                                <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#CBB26A] to-transparent mt-2" />
                            </motion.div>
                            {/* Animated Dice Engine in 3D */}
                            <div className="flex gap-4 md:gap-8 mb-6 sm:mb-8 h-16 sm:h-24 md:h-32 items-center justify-center p-2">
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
                                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 4 }} className="text-center font-black text-white mb-8 sm:mb-12 pointer-events-auto flex items-center gap-4 bg-white/5 backdrop-blur-lg px-8 py-3 rounded-2xl border border-white/10 text-sm sm:text-base shadow-2xl">
                                    <div className="w-4 h-4 rounded-full shadow-[0_0_15px_currentColor]" style={{ backgroundColor: players[currentTurn].color, color: players[currentTurn].color }} />
                                    <span className="tracking-[0.1em] uppercase">{players[currentTurn].name}'s Turn</span>
                                </motion.div>
                            )}

                            <div className="flex flex-row gap-4 sm:gap-8 pointer-events-auto">
                                <button
                                    onClick={handleRollClick}
                                    disabled={!canRoll}
                                    className={`px-12 sm:px-16 py-5 sm:py-6 rounded-2xl font-black text-sm sm:text-lg tracking-[0.2em] bg-[#CBB26A] text-[#0A0810] hover:bg-[#DBC27A] hover:scale-105 active:scale-95 transition-all shadow-[0_10px_40px_rgba(203,178,106,0.4)] flex items-center gap-3 group ${!canRoll ? 'opacity-0 pointer-events-none scale-90' : 'scale-100'}`}
                                >
                                    ROLL DICE <div className="w-6 h-6 bg-[#0A0810] rounded flex items-center justify-center text-[10px] text-[#CBB26A] group-hover:rotate-12 transition-transform">🎲</div>
                                </button>
                                <button
                                    onClick={() => { if (canEndTurn) endTurn() }}
                                    disabled={!canEndTurn}
                                    className={`px-12 sm:px-16 py-5 sm:py-6 rounded-2xl font-black text-sm sm:text-lg tracking-[0.2em] border-2 border-[#CBB26A] text-[#CBB26A] hover:bg-[#CBB26A] hover:text-[#0A0810] hover:scale-105 active:scale-95 transition-all shadow-[0_10px_30px_rgba(203,178,106,0.2)] ${!canEndTurn ? 'opacity-0 pointer-events-none scale-90' : 'scale-100'}`}
                                >
                                    END TURN
                                </button>
                            </div>

                            {/* Center Cards Overlay */}
                            <AnimatePresence>
                                {activeCard && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className={`absolute pointer-events-auto p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center border overflow-hidden ${activeCard.type === 'chance' ? 'bg-[#2A1D11] border-[#EAB308]' : 'bg-[#112030] border-[#38BDF8]'}`}
                                    >
                                        <h3 className={`text-xl font-black uppercase tracking-widest mb-2 ${activeCard.type === 'chance' ? 'text-[#EAB308]' : 'text-[#38BDF8]'}`}>
                                            {activeCard.type === 'chance' ? 'Surprise' : 'Treasure'}
                                        </h3>
                                        <p className="text-2xl font-bold text-white mb-2">{activeCard.title}</p>
                                        <p className="text-slate-300 font-medium mb-6">{activeCard.description}</p>
                                        <button
                                            onClick={() => useGameStore.getState().dismissCard()}
                                            className="px-6 py-2 rounded-lg font-bold bg-white/10 hover:bg-white/20 text-white transition-colors"
                                        >
                                            Got it
                                        </button>
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
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-200">Start Money</span>
                                            <span className="text-[10px] text-slate-500 font-medium">Initial bank balance</span>
                                        </div>
                                        <input type="number" value={startMoney} onChange={e => setStartMoney(Number(e.target.value))} className="w-24 bg-[#0E0B16] border border-[#2A2438] rounded-xl px-2 py-2 text-sm outline-none focus:border-[#CBB26A] text-center font-mono font-bold text-white shadow-inner" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 sm:p-6 border-t border-[#2A2438] bg-[#120F1D]">
                            <button onClick={() => useGameStore.getState().initGame(tempPlayers, startMoney)} disabled={tempPlayers.length < 2} className="w-full bg-[#CBB26A] hover:bg-[#B19859] text-[#0E0B16] py-4 rounded-xl font-black text-lg transition-transform active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(203,178,106,0.3)]">
                                Start game →
                            </button>
                        </div>
                    </div>
                ) : (
                    // Play Mode Panel
                    <div className="flex flex-col h-full">
                        <div className="p-4 border-b border-[#2A2438] bg-[#120F1D] flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Players</span>
                            <span className="text-xs text-[#CBB26A] font-bold bg-[#CBB26A]/10 px-2 py-1 rounded-md">{players.length} Playing</span>
                        </div>
                        <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto">
                            {players.map((p, i) => (
                                <motion.div layout key={p.id} className={`p-4 rounded-2xl flex items-center justify-between border transition-all ${currentTurn === i ? 'border-[#CBB26A] bg-[#2A2438] shadow-[0_0_15px_rgba(203,178,106,0.15)] scale-[1.02] z-10' : 'border-[#2A2438] bg-[#1D182E]'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]" style={{ backgroundColor: p.color }}>
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
        </div>
    );
};
