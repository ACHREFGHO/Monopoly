import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, BOARD_SPACES } from '../../store/useGameStore';
import { X } from 'lucide-react';

export const PropertyModal = () => {
    const {
        activeModalSpaceId,
        setActiveModalSpaceId,
        buyProperty,
        players,
        currentTurn
    } = useGameStore();

    if (activeModalSpaceId === null) return null;

    const space = BOARD_SPACES[activeModalSpaceId];
    if (!space) return null;

    const currentPlayer = players[currentTurn];
    const canAfford = currentPlayer && space.price && currentPlayer.money >= space.price;

    const handleBuy = () => {
        if (canAfford) {
            buyProperty(currentPlayer.id, activeModalSpaceId);
        }
    };

    const handleClose = () => {
        setActiveModalSpaceId(null);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-zinc-900 border border-white/20 shadow-2xl"
                >
                    {/* Header Color Band */}
                    <div
                        className="w-full h-24 border-b-2 border-black/40 flex items-center justify-center p-4 relative"
                        style={{ backgroundColor: space.color || '#475569' }}
                    >
                        <button
                            onClick={handleClose}
                            className="absolute top-3 right-3 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1 transition-all"
                        >
                            <X size={20} />
                        </button>
                        <div className="text-center text-white drop-shadow-md">
                            <p className="text-xs uppercase tracking-widest opacity-90">{space.country || 'Property'}</p>
                            <h2 className="text-2xl font-bold uppercase tracking-wide">{space.name}</h2>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="p-6 bg-white/5 backdrop-blur text-slate-200">
                        {space.rent && (
                            <div className="space-y-2 mb-6 text-sm text-center">
                                <p className="flex justify-between border-b border-white/10 pb-1">
                                    <span>Rent</span>
                                    <span className="font-mono text-[#CBB26A]">${space.rent[0]}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span>With 1 House</span>
                                    <span className="font-mono">${space.rent[1]}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span>With 2 Houses</span>
                                    <span className="font-mono">${space.rent[2]}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span>With 3 Houses</span>
                                    <span className="font-mono">${space.rent[3]}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span>With 4 Houses</span>
                                    <span className="font-mono">${space.rent[4]}</span>
                                </p>
                                <p className="flex justify-between pt-1 border-t border-white/10">
                                    <span>With HOTEL</span>
                                    <span className="font-mono text-emerald-400">${space.rent[5]}</span>
                                </p>
                            </div>
                        )}

                        {/* Price & Action */}
                        <div className="flex flex-col gap-3 mt-4">
                            <button
                                onClick={handleBuy}
                                disabled={!canAfford}
                                className={`w-full py-3 rounded-lg font-bold transition-all ${canAfford
                                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(5,150,105,0.4)]'
                                        : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
                                    }`}
                            >
                                Buy Property for ${space.price}
                            </button>
                            <button
                                onClick={handleClose}
                                className="w-full py-2 rounded-lg font-semibold bg-white/10 hover:bg-white/20 text-white transition-all"
                            >
                                Skip / Auction
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
