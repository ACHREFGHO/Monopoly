import { create } from 'zustand';

// --- TYPES ---
export type SpaceType =
    | 'go' | 'property' | 'chance' | 'chest' | 'tax'
    | 'station' | 'utility' | 'jail' | 'parking' | 'gotojail';

export interface Space {
    id: number;
    name: string;
    type: SpaceType;
    country?: string;
    color?: string;
    price?: number;
    rent?: number[]; // [base, 1 house, 2 houses, 3 houses, 4 houses, hotel]
    housePrice?: number;
}

export interface Player {
    id: string;
    name: string;
    color: string;
    position: number;
    money: number;
    inJail: boolean;
    jailTurns: number;
    shape?: string;
}

export interface PropertyState {
    ownerId: string | null;
    houses: number; // 0-4, 5 is hotel
    isMortgaged: boolean;
}

export interface TradeOffer {
    fromPlayerId: string;
    toPlayerId: string;
    offeredMoney: number;
    requestMoney: number;
    offeredPropertyIds: number[];
    requestPropertyIds: number[];
}

interface Card {
    title: string;
    description: string;
    action: (playerId: string, get: () => GameState, set: (state: Partial<GameState> | ((state: GameState) => Partial<GameState>)) => void) => Promise<void> | void;
}

interface GameState {
    players: Player[];
    currentTurn: number; // index of the player whose turn it is
    boardState: Record<number, PropertyState>; // map spaceId to property state
    bank: number;
    diceRoll: [number, number] | null;
    activeModalSpaceId: number | null;

    hasRolled: boolean;

    // UI states
    isMoving: boolean;
    activeCard: { title: string, description: string, type: 'chance' | 'chest' } | null;
    activeTrade: TradeOffer | null;
    chatMessages: { id: string, senderName: string, senderColor: string, text: string, timestamp: number }[];
    dicePreference: 'red' | 'white';
    monopolyRequiredToBuild: boolean;
    rules: {
        doubleRentOnSets: boolean;
        vacationCash: boolean;
        auctionEnabled: boolean;
        noRentInJail: boolean;
        mortgageEnabled: boolean;
        evenBuild: boolean;
        randomizeOrder: boolean;
    };
    potMoney: number;

    // Actions
    rollDice: () => Promise<void>;
    movePlayerStepByStep: (playerId: string, steps: number) => Promise<void>;
    handleSpaceAction: (playerId: string) => void;
    buyProperty: (playerId: string, spaceId: number) => void;
    payRent: (fromPlayerId: string, toPlayerId: string, amount: number) => void;
    proposeTrade: (offer: TradeOffer) => void;
    respondToTrade: (accept: boolean) => void;
    sendMessage: (text: string) => void;
    endTurn: () => void;
    initGame: (players: Omit<Player, "position" | "money" | "inJail" | "jailTurns">[], startingMoney?: number) => void;
    setActiveModalSpaceId: (spaceId: number | null) => void;
    dismissCard: () => void;
    setDicePreference: (pref: 'red' | 'white') => void;
    setMonopolyRequiredToBuild: (required: boolean) => void;
    setRule: (rule: keyof GameState['rules'], value: boolean) => void;
    buildHouse: (playerId: string, spaceId: number) => void;
    postBail: (playerId: string) => void;
}

// --- BOARD DEFINITION (24 properties, 3 per country) ---
export const BOARD_SPACES: Space[] = [
    { id: 0, name: 'GO', type: 'go' },
    { id: 1, name: 'Kairouan', type: 'property', country: 'Tunisia', color: '#8B4513', price: 60, rent: [2, 10, 30, 90, 160, 250], housePrice: 50 },
    { id: 2, name: 'Comm. Chest', type: 'chest' },
    { id: 3, name: 'Tunis', type: 'property', country: 'Tunisia', color: '#8B4513', price: 60, rent: [4, 20, 60, 180, 320, 450], housePrice: 50 },
    { id: 4, name: 'Income Tax', type: 'tax' },
    { id: 5, name: 'Station 1', type: 'station', price: 200, rent: [25, 50, 100, 200] },
    { id: 6, name: 'Oran', type: 'property', country: 'Algeria', color: '#38BDF8', price: 100, rent: [6, 30, 90, 270, 400, 550], housePrice: 50 },
    { id: 7, name: 'Chance', type: 'chance' },
    { id: 8, name: 'Constantine', type: 'property', country: 'Algeria', color: '#38BDF8', price: 100, rent: [6, 30, 90, 270, 400, 550], housePrice: 50 },
    { id: 9, name: 'Algiers', type: 'property', country: 'Algeria', color: '#38BDF8', price: 120, rent: [8, 40, 100, 300, 450, 600], housePrice: 50 },
    { id: 10, name: 'Jail', type: 'jail' },
    { id: 11, name: 'Marrakech', type: 'property', country: 'Morocco', color: '#EC4899', price: 140, rent: [10, 50, 150, 450, 625, 750], housePrice: 100 },
    { id: 12, name: 'Electric Co.', type: 'utility', price: 150 },
    { id: 13, name: 'Casablanca', type: 'property', country: 'Morocco', color: '#EC4899', price: 140, rent: [10, 50, 150, 450, 625, 750], housePrice: 100 },
    { id: 14, name: 'Rabat', type: 'property', country: 'Morocco', color: '#EC4899', price: 160, rent: [12, 60, 180, 500, 700, 900], housePrice: 100 },
    { id: 15, name: 'Station 2', type: 'station', price: 200, rent: [25, 50, 100, 200] },
    { id: 16, name: 'Lyon', type: 'property', country: 'France', color: '#F97316', price: 180, rent: [14, 70, 200, 550, 750, 950], housePrice: 100 },
    { id: 17, name: 'Comm. Chest', type: 'chest' },
    { id: 18, name: 'Marseille', type: 'property', country: 'France', color: '#F97316', price: 180, rent: [14, 70, 200, 550, 750, 950], housePrice: 100 },
    { id: 19, name: 'Paris', type: 'property', country: 'France', color: '#F97316', price: 200, rent: [16, 80, 220, 600, 800, 1000], housePrice: 100 },
    { id: 20, name: 'Free Parking', type: 'parking' },
    { id: 21, name: 'Naples', type: 'property', country: 'Italy', color: '#EF4444', price: 220, rent: [18, 90, 250, 700, 875, 1050], housePrice: 150 },
    { id: 22, name: 'Chance', type: 'chance' },
    { id: 23, name: 'Milan', type: 'property', country: 'Italy', color: '#EF4444', price: 220, rent: [18, 90, 250, 700, 875, 1050], housePrice: 150 },
    { id: 24, name: 'Rome', type: 'property', country: 'Italy', color: '#EF4444', price: 240, rent: [20, 100, 300, 750, 925, 1100], housePrice: 150 },
    { id: 25, name: 'Station 3', type: 'station', price: 200, rent: [25, 50, 100, 200] },
    { id: 26, name: 'Valencia', type: 'property', country: 'Spain', color: '#EAB308', price: 260, rent: [22, 110, 330, 800, 975, 1150], housePrice: 150 },
    { id: 27, name: 'Barcelona', type: 'property', country: 'Spain', color: '#EAB308', price: 260, rent: [22, 110, 330, 800, 975, 1150], housePrice: 150 },
    { id: 28, name: 'Water Works', type: 'utility', price: 150 },
    { id: 29, name: 'Madrid', type: 'property', country: 'Spain', color: '#EAB308', price: 280, rent: [24, 120, 360, 850, 1025, 1200], housePrice: 150 },
    { id: 30, name: 'Go To Jail', type: 'gotojail' },
    { id: 31, name: 'Braga', type: 'property', country: 'Portugal', color: '#22C55E', price: 300, rent: [26, 130, 390, 900, 1100, 1275], housePrice: 200 },
    { id: 32, name: 'Porto', type: 'property', country: 'Portugal', color: '#22C55E', price: 300, rent: [26, 130, 390, 900, 1100, 1275], housePrice: 200 },
    { id: 33, name: 'Comm. Chest', type: 'chest' },
    { id: 34, name: 'Lisbon', type: 'property', country: 'Portugal', color: '#22C55E', price: 320, rent: [28, 150, 450, 1000, 1200, 1400], housePrice: 200 },
    { id: 35, name: 'Station 4', type: 'station', price: 200, rent: [25, 50, 100, 200] },
    { id: 36, name: 'Chance', type: 'chance' },
    { id: 37, name: 'Patras', type: 'property', country: 'Greece', color: '#3B82F6', price: 350, rent: [35, 175, 500, 1100, 1300, 1500], housePrice: 200 },
    { id: 38, name: 'Travel Tax', type: 'tax', price: 100 },
    { id: 39, name: 'Athens', type: 'property', country: 'Greece', color: '#3B82F6', price: 400, rent: [50, 200, 600, 1400, 1700, 2000], housePrice: 200 },
];

const CHANCE_CARDS: Card[] = [
    { title: "Advance to GO", description: "Collect $200", action: async (id, get, set) => { set(s => { const ps = [...s.players]; const p = ps.find(p => p.id === id); if (p) { p.position = 0; p.money += 200; } return { players: ps }; }); } },
    {
        title: "Kairouan Trip", description: "Advance to Kairouan. If you pass GO, collect $200", action: async (id, get, set) => {
            const store = get();
            const p = store.players.find(pl => pl.id === id);
            if (!p) return;
            let steps = (1 - p.position + 40) % 40;
            await store.movePlayerStepByStep(id, steps);
        }
    },
    {
        title: "Athens Express", description: "Advance to Athens", action: async (id, get, set) => {
            const store = get();
            const p = store.players.find(pl => pl.id === id);
            if (!p) return;
            let steps = (39 - p.position + 40) % 40;
            await store.movePlayerStepByStep(id, steps);
        }
    },
    { title: "Bank Pays Divided", description: "Receive $50", action: async (id, get, set) => { set(s => { const ps = [...s.players]; const p = ps.find(p => p.id === id); if (p) p.money += 50; return { players: ps }; }); } },
    { title: "Get Out of Jail Free", description: "Dismiss this encounter", action: async (id, get, set) => { /* Already handled by dismissal in UI for now */ } },
    { title: "Go Back 3 Spaces", description: "Move back 3 positions", action: async (id, get, set) => { await get().movePlayerStepByStep(id, -3); } },
    { title: "School Fees", description: "Pay $150", action: async (id, get, set) => { set(s => { const ps = [...s.players]; const p = ps.find(p => p.id === id); if (p) p.money -= 150; return { players: ps }; }); } },
    { title: "Speeding Fine", description: "Pay $15", action: async (id, get, set) => { set(s => { const ps = [...s.players]; const p = ps.find(p => p.id === id); if (p) p.money -= 15; return { players: ps }; }); } },
    { title: "Drunk in Charge", description: "Pay $20", action: async (id, get, set) => { set(s => { const ps = [...s.players]; const p = ps.find(p => p.id === id); if (p) p.money -= 20; return { players: ps }; }); } },
    { title: "Building Loan Mature", description: "Collect $150", action: async (id, get, set) => { set(s => { const ps = [...s.players]; const p = ps.find(p => p.id === id); if (p) p.money += 150; return { players: ps }; }); } },
    {
        title: "Street Repairs", description: "Pay $40 per house owned", action: async (id, get, set) => {
            set(s => {
                const ps = [...s.players];
                const p = ps.find(pl => pl.id === id);
                if (!p) return s;
                let houseCount = 0;
                Object.values(s.boardState).forEach(st => { if (st.ownerId === id) houseCount += st.houses; });
                p.money -= (houseCount * 40);
                return { players: ps };
            });
        }
    },
    {
        title: "Chairman of Board", description: "Pay each player $50", action: async (id, get, set) => {
            set(s => {
                const ps = [...s.players];
                const p = ps.find(pl => pl.id === id);
                if (!p) return s;
                ps.forEach(pl => { if (pl.id !== id) { pl.money += 50; p.money -= 50; } });
                return { players: ps };
            });
        }
    },
    {
        title: "Grand Larceny", description: "Steal $300 from a specific opponent!", action: async (id, get, set) => {
            set(s => {
                const others = s.players.filter(p => p.id !== id);
                if (others.length === 0) return s;
                const targetIdx = Math.floor(Math.random() * others.length);
                const target = others[targetIdx];
                const newPlayers = s.players.map(p => {
                    if (p.id === id) return { ...p, money: p.money + 300 };
                    if (p.id === target.id) return { ...p, money: p.money - 300 };
                    return p;
                });
                return { players: newPlayers };
            });
        }
    },
    {
        title: "Pickpocket", description: "Steal $100 from a specific opponent!", action: async (id, get, set) => {
            set(s => {
                const others = s.players.filter(p => p.id !== id);
                if (others.length === 0) return s;
                const targetIdx = Math.floor(Math.random() * others.length);
                const target = others[targetIdx];
                const newPlayers = s.players.map(p => {
                    if (p.id === id) return { ...p, money: p.money + 100 };
                    if (p.id === target.id) return { ...p, money: p.money - 100 };
                    return p;
                });
                return { players: newPlayers };
            });
        }
    },
];

const CHEST_CARDS: Card[] = [
    { title: "Inheritance", description: "Collect $100", action: async (id, get, set) => { set(s => { const ps = [...s.players]; const p = ps.find(p => p.id === id); if (p) p.money += 100; return { players: ps }; }); } },
    { title: "Stock Boom", description: "Collect $50", action: async (id, get, set) => { set(s => { const ps = [...s.players]; const p = ps.find(p => p.id === id); if (p) p.money += 50; return { players: ps }; }); } },
    { title: "Life Insurance", description: "Collect $100", action: async (id, get, set) => { set(s => { const ps = [...s.players]; const p = ps.find(p => p.id === id); if (p) p.money += 100; return { players: ps }; }); } },
    { title: "Hospital Fees", description: "Pay $100", action: async (id, get, set) => { set(s => { const ps = [...s.players]; const p = ps.find(p => p.id === id); if (p) p.money -= 100; return { players: ps }; }); } },
    { title: "Consultancy Fee", description: "Receive $25", action: async (id, get, set) => { set(s => { const ps = [...s.players]; const p = ps.find(p => p.id === id); if (p) p.money += 25; return { players: ps }; }); } },
    { title: "Income Tax Refund", description: "Collect $20", action: async (id, get, set) => { set(s => { const ps = [...s.players]; const p = ps.find(p => p.id === id); if (p) p.money += 20; return { players: ps }; }); } },
    { title: "Holiday Fund Matures", description: "Receive $100", action: async (id, get, set) => { set(s => { const ps = [...s.players]; const p = ps.find(p => p.id === id); if (p) p.money += 100; return { players: ps }; }); } },
    { title: "Go to Jail", description: "Move to Jail. Do not pass GO.", action: async (id, get, set) => { set(s => { const ps = [...s.players]; const p = ps.find(p => p.id === id); if (p) { p.position = 10; p.inJail = true; } return { players: ps }; }); } },
    { title: "Bank Overdraft", description: "Pay $50", action: async (id, get, set) => { set(s => { const ps = [...s.players]; const p = ps.find(p => p.id === id); if (p) p.money -= 50; return { players: ps }; }); } },
];

export const useGameStore = create<GameState>((set, get) => ({
    players: [],
    currentTurn: 0,
    boardState: {},
    bank: 20580,
    diceRoll: null,
    activeModalSpaceId: null,
    isMoving: false,
    activeCard: null,
    activeTrade: null,
    hasRolled: false,
    chatMessages: [],
    dicePreference: 'white',
    monopolyRequiredToBuild: true,
    rules: {
        doubleRentOnSets: true,
        vacationCash: true,
        auctionEnabled: true,
        noRentInJail: false,
        mortgageEnabled: true,
        evenBuild: true,
        randomizeOrder: true,
    },
    potMoney: 0,
    dismissCard: () => set({ activeCard: null }),

    setActiveModalSpaceId: (spaceId) => set({ activeModalSpaceId: spaceId }),

    proposeTrade: (offer) => set({ activeTrade: offer }),

    respondToTrade: (accept) => {
        const state = get();
        const trade = state.activeTrade;
        if (!trade || !accept) {
            set({ activeTrade: null });
            return;
        }

        set(s => {
            const players = [...s.players];
            const fromIdx = players.findIndex(p => p.id === trade.fromPlayerId);
            const toIdx = players.findIndex(p => p.id === trade.toPlayerId);

            if (fromIdx === -1 || toIdx === -1) return { activeTrade: null };

            // Check money
            if (players[fromIdx].money < trade.offeredMoney || players[toIdx].money < trade.requestMoney) {
                return { activeTrade: null };
            }

            // Execute switch
            players[fromIdx].money -= trade.offeredMoney;
            players[fromIdx].money += trade.requestMoney;
            players[toIdx].money += trade.offeredMoney;
            players[toIdx].money -= trade.requestMoney;

            const boardState = { ...s.boardState };
            trade.offeredPropertyIds.forEach(id => {
                if (boardState[id]) boardState[id] = { ...boardState[id], ownerId: trade.toPlayerId };
            });
            trade.requestPropertyIds.forEach(id => {
                if (boardState[id]) boardState[id] = { ...boardState[id], ownerId: trade.fromPlayerId };
            });

            return { players, boardState, activeTrade: null };
        });
    },

    initGame: (initialPlayers, startingMoney = 1500) => {
        let players: Player[] = initialPlayers.map(p => ({
            ...p, position: 0, money: startingMoney, inJail: false, jailTurns: 0
        }));

        if (get().rules.randomizeOrder) {
            players = [...players].sort(() => Math.random() - 0.5);
        }

        set({
            players,
            currentTurn: 0,
            boardState: {},
            diceRoll: null,
            isMoving: false,
            activeCard: null,
            activeModalSpaceId: null,
            hasRolled: false,
            chatMessages: [],
            potMoney: 0
        });
    },
    setDicePreference: (pref) => set({ dicePreference: pref }),

    sendMessage: (text) => {
        const state = get();
        const currentPlayer = state.players[state.currentTurn];
        if (!currentPlayer || !text.trim()) return;

        const newMessage = {
            id: Math.random().toString(36).substr(2, 9),
            senderName: currentPlayer.name,
            senderColor: currentPlayer.color,
            text: text.trim(),
            timestamp: Date.now()
        };

        set(s => ({ chatMessages: [...s.chatMessages, newMessage] }));
    },

    rollDice: async () => {
        if (get().isMoving || get().activeCard || get().activeModalSpaceId !== null || get().hasRolled) return;
        set({ isMoving: true });

        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const isDouble = d1 === d2;
        set({ diceRoll: [d1, d2] });

        // Wait to show dice roll
        await new Promise(resolve => setTimeout(resolve, 800));

        const store = get();
        const currentPlayer = store.players[store.currentTurn];
        if (!currentPlayer.inJail) {
            set({ hasRolled: !isDouble });
            await store.movePlayerStepByStep(currentPlayer.id, d1 + d2);
        } else {
            // Free from jail on doubles
            if (d1 === d2) {
                set(s => {
                    const ps = [...s.players];
                    const idx = ps.findIndex(p => p.id === currentPlayer.id);
                    if (idx > -1) ps[idx] = { ...ps[idx], inJail: false, jailTurns: 0 };
                    return { players: ps, hasRolled: true };
                });
                await get().movePlayerStepByStep(currentPlayer.id, d1 + d2);
            } else {
                set(s => {
                    const ps = [...s.players];
                    const idx = ps.findIndex(p => p.id === currentPlayer.id);
                    if (idx > -1) {
                        const newTurns = ps[idx].jailTurns + 1;
                        if (newTurns >= 3) {
                            // Forced to pay bail after 3 turns or just let out? Let's say let out.
                            ps[idx] = { ...ps[idx], inJail: false, jailTurns: 0 };
                        } else {
                            ps[idx] = { ...ps[idx], jailTurns: newTurns };
                        }
                    }
                    return { players: ps, hasRolled: true };
                });
            }
        }
    },

    movePlayerStepByStep: async (playerId, steps) => {
        const direction = steps > 0 ? 1 : -1;
        const absSteps = Math.abs(steps);

        for (let i = 0; i < absSteps; i++) {
            set(state => {
                const players = [...state.players];
                const pIdx = players.findIndex(p => p.id === playerId);
                if (pIdx === -1) return state;

                const player = { ...players[pIdx] };
                let nextPos = player.position + direction;

                // Handle board wrapping
                if (nextPos > 39) nextPos = 0;
                if (nextPos < 0) nextPos = 39;

                // Pass go bonus
                if (direction > 0 && nextPos === 0) {
                    player.money += 200;
                }

                player.position = nextPos;
                players[pIdx] = player;
                return { players };
            });
            // Delay for animation frame space by space
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        get().handleSpaceAction(playerId);
    },

    handleSpaceAction: async (playerId) => {
        const state = get();
        const player = state.players.find(p => p.id === playerId);
        if (!player) return set({ isMoving: false });

        const space = BOARD_SPACES[player.position];

        if (space.type === 'gotojail') {
            set(s => {
                const pList = [...s.players];
                const idx = pList.findIndex(p => p.id === playerId);
                if (idx > -1) pList[idx] = { ...pList[idx], position: 10, inJail: true, jailTurns: 0 };
                return { players: pList };
            });
            set({ isMoving: false });
            return;
        }

        if (space.type === 'chance' || space.type === 'chest') {
            const arr = space.type === 'chance' ? CHANCE_CARDS : CHEST_CARDS;
            const randomCard = arr[Math.floor(Math.random() * arr.length)];
            set({ activeCard: { title: randomCard.title, description: randomCard.description, type: space.type } });
            await randomCard.action(playerId, get, set);
            set({ isMoving: false });
            return;
        }

        if (space.type === 'tax') {
            set(s => {
                const ps = [...s.players];
                const idx = ps.findIndex(p => p.id === playerId);
                if (idx > -1) {
                    let taxAmount = 0;
                    if (space.id === 4) {
                        taxAmount = Math.floor(ps[idx].money * 0.1);
                    } else {
                        taxAmount = (space.price || 100);
                    }
                    ps[idx].money -= taxAmount;

                    if (s.rules.vacationCash) {
                        return { players: ps, potMoney: s.potMoney + taxAmount };
                    }
                }
                return { players: ps };
            });
            set({ isMoving: false });
            return;
        }

        if (space.type === 'parking') {
            if (state.rules.vacationCash && state.potMoney > 0) {
                set(s => {
                    const ps = [...s.players];
                    const idx = ps.findIndex(p => p.id === playerId);
                    if (idx > -1) {
                        ps[idx].money += s.potMoney;
                        return { players: ps, potMoney: 0 };
                    }
                    return s;
                });
            }
            set({ isMoving: false });
            return;
        }

        // Rent calculation
        if (space.type === 'property' || space.type === 'station' || space.type === 'utility') {
            const bState = state.boardState[space.id];
            if (bState && bState.ownerId && bState.ownerId !== playerId && !bState.isMortgaged) {
                const owner = state.players.find(p => p.id === bState.ownerId);
                // Rule: Don't collect rent while in prison
                if (state.rules.noRentInJail && owner?.inJail) {
                    set({ isMoving: false });
                    return;
                }

                let rentAmount = 0;
                if (space.type === 'property' && space.rent) {
                    const ownerProps = BOARD_SPACES.filter(s =>
                        s.country === space.country &&
                        state.boardState[s.id]?.ownerId === bState.ownerId
                    );
                    const totalInCountry = BOARD_SPACES.filter(s => s.country === space.country).length;
                    const hasMonopoly = ownerProps.length === totalInCountry;

                    if (bState.houses === 0) {
                        const multiplier = (hasMonopoly && state.rules.doubleRentOnSets) ? 2 : 1;
                        rentAmount = space.rent[0] * multiplier;
                    } else {
                        rentAmount = space.rent[bState.houses];
                    }
                } else if (space.type === 'station') {
                    const stationsOwned = BOARD_SPACES.filter(s =>
                        s.type === 'station' && state.boardState[s.id]?.ownerId === bState.ownerId
                    ).length;
                    rentAmount = [0, 25, 50, 100, 200][stationsOwned] || 0;
                } else if (space.type === 'utility' && state.diceRoll) {
                    const utilOwned = BOARD_SPACES.filter(s =>
                        s.type === 'utility' && state.boardState[s.id]?.ownerId === bState.ownerId
                    ).length;
                    const rollTotal = state.diceRoll[0] + state.diceRoll[1];
                    rentAmount = utilOwned === 2 ? rollTotal * 10 : rollTotal * 4;
                }

                if (rentAmount > 0) {
                    get().payRent(playerId, bState.ownerId, rentAmount);
                }
            } else if (!bState?.ownerId) {
                get().setActiveModalSpaceId(space.id);
            }
        }

        set({ isMoving: false });
    },

    buyProperty: (playerId, spaceId) => {
        set(state => {
            const space = BOARD_SPACES[spaceId];
            if (!space || typeof space.price !== 'number') return state;

            const players = [...state.players];
            const pIdx = players.findIndex(p => p.id === playerId);
            if (pIdx === -1 || players[pIdx].money < space.price) return state;

            players[pIdx] = { ...players[pIdx], money: players[pIdx].money - space.price };

            const boardState = { ...state.boardState, [spaceId]: { ownerId: playerId, houses: 0, isMortgaged: false } };

            return { players, boardState, activeModalSpaceId: null };
        });
    },

    payRent: (fromPlayerId, toPlayerId, amount) => {
        set(state => {
            const players = [...state.players];
            const fromIdx = players.findIndex(p => p.id === fromPlayerId);
            const toIdx = players.findIndex(p => p.id === toPlayerId);
            if (fromIdx !== -1 && toIdx !== -1) {
                players[fromIdx] = { ...players[fromIdx], money: players[fromIdx].money - amount };
                players[toIdx] = { ...players[toIdx], money: players[toIdx].money + amount };
            }
            return { players };
        });
    },

    setMonopolyRequiredToBuild: (required) => set({ monopolyRequiredToBuild: required }),
    setRule: (rule, value) => set(state => ({
        rules: { ...state.rules, [rule]: value }
    })),
    buildHouse: (playerId, spaceId) => {
        set(state => {
            const space = BOARD_SPACES[spaceId];
            if (!space || space.type !== 'property' || !space.housePrice) return state;

            const propertyState = state.boardState[spaceId];
            if (!propertyState || propertyState.ownerId !== playerId || propertyState.houses >= 5 || propertyState.isMortgaged) return state;

            // Check money
            const players = [...state.players];
            const pIdx = players.findIndex(p => p.id === playerId);
            if (pIdx === -1 || players[pIdx].money < space.housePrice) return state;

            // Check monopoly if required
            if (state.monopolyRequiredToBuild) {
                const totalInCountry = BOARD_SPACES.filter(s => s.country === space.country).length;
                const ownedInCountry = BOARD_SPACES.filter(s =>
                    s.country === space.country &&
                    state.boardState[s.id]?.ownerId === playerId
                ).length;

                if (ownedInCountry < totalInCountry) return state;
            }

            // Check even building
            if (state.rules.evenBuild) {
                const countryProps = BOARD_SPACES.filter(s => s.country === space.country);
                const currentHouses = propertyState.houses;
                const otherPropsInSet = countryProps.filter(s => s.id !== spaceId);

                // You can only build if all other properties in the set have at least as many houses as this one
                const canBuild = otherPropsInSet.every(s => {
                    const st = state.boardState[s.id];
                    return st && st.houses >= currentHouses;
                });

                if (!canBuild) return state;
            }

            // Execute build
            players[pIdx] = { ...players[pIdx], money: players[pIdx].money - space.housePrice };
            const newBoardState = {
                ...state.boardState,
                [spaceId]: { ...propertyState, houses: propertyState.houses + 1 }
            };

            return { players, boardState: newBoardState };
        });
    },
    postBail: (playerId) => {
        set(state => {
            const players = [...state.players];
            const pIdx = players.findIndex(p => p.id === playerId);
            if (pIdx === -1 || !players[pIdx].inJail || players[pIdx].money < 100) return state;

            players[pIdx] = { ...players[pIdx], money: players[pIdx].money - 100, inJail: false, jailTurns: 0 };
            return { players };
        });
    },
    endTurn: () => {
        if (get().isMoving || get().activeModalSpaceId !== null || !get().hasRolled) return;
        set(state => {
            const nextTurn = (state.currentTurn + 1) % state.players.length;
            return { currentTurn: nextTurn, diceRoll: null, activeCard: null, hasRolled: false };
        });
    }
}));

