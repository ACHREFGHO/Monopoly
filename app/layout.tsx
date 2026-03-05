import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Mediterraneanopoly',
    description: 'A Super Design web-based Monopoly game',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="font-sans antialiased text-slate-100 bg-slate-900 selection:bg-[#CBB26A]/30">
                {children}
            </body>
        </html>
    );
}
