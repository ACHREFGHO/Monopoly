"use client";

import { Board } from '../components/ui/Board';
// Remove this if PropertyModal doesn't exist, else keep it
import { PropertyModal } from '../components/modals/PropertyModal';

export default function Home() {
    return (
        <main className="min-h-screen relative font-sans">
            <Board />
            {PropertyModal && <PropertyModal />}
        </main>
    );
}
