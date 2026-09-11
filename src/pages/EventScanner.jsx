import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Scan, LogIn, LogOut, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { API_BASE_URL } from '../lib/api';

const EventScanner = () => {
    const [scanMode, setScanMode] = useState('in'); // 'in' ou 'out'
    const [scanResult, setScanResult] = useState(null);
    const [scanning, setScanning] = useState(false);
    // Read via a ref inside the scan callback so toggling the mode doesn't
    // need to tear down and restart the camera stream.
    const scanModeRef = useRef(scanMode);
    const scanningRef = useRef(scanning);

    useEffect(() => {
        scanModeRef.current = scanMode;
    }, [scanMode]);

    useEffect(() => {
        scanningRef.current = scanning;
    }, [scanning]);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
        );

        scanner.render(handleScanSuccess, handleScanError);

        return () => {
            scanner.clear().catch(error => console.error("Failed to clear scanner", error));
        };
    }, []); // Init once: the camera stream shouldn't restart when the mode toggles

    const handleScanSuccess = async (decodedText) => {
        if (scanningRef.current) return; // Empêcher les multi-scans
        setScanning(true);

        // Cacher le résultat précédent
        setScanResult(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/tickets/scan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ qrToken: decodedText, action: scanModeRef.current })
            });

            const data = await response.json();
            
            if (response.ok) {
                setScanResult({ type: 'success', message: data.message, tier: data.ticketType });
            } else {
                setScanResult({ type: 'error', message: data.message });
            }
        } catch (error) {
            setScanResult({ type: 'error', message: 'Erreur réseau ou QR Code invalide' });
        } finally {
            // Permettre un nouveau scan après 3 secondes
            setTimeout(() => setScanning(false), 3000);
        }
    };

    const handleScanError = (err) => {
        // Ignorer les erreurs de scan continues quand aucun QR n'est en face
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100/60">
            <div className="max-w-4xl mx-auto px-6 sm:px-8 py-10 sm:py-12">
            <div className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 mb-4">
                    Scanner
                </div>
                <Scan className="mx-auto text-slate-700 mb-4" size={48} />
                <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-slate-900">Scanner Sécurisé</h1>
                <p className="text-slate-500 mt-2">Déchiffrement dynamique des accès.</p>
            </div>

            {/* Mode Toggle */}
            <div className="flex bg-slate-100 border border-slate-200 rounded-2xl p-1 mb-10 max-w-md mx-auto">
                <button
                    onClick={() => setScanMode('in')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                        scanMode === 'in' ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-900"
                    )}
                >
                    <LogIn size={16} /> Entrée
                </button>
                <button
                    onClick={() => setScanMode('out')}
                    className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                        scanMode === 'out' ? "bg-slate-700 text-white shadow-lg" : "text-slate-500 hover:text-slate-900"
                    )}
                >
                    <LogOut size={16} /> Sortie (Pass-out)
                </button>
            </div>

            {/* Scanner Area */}
            <div className="bg-white border border-slate-200/70 p-4 rounded-[40px] shadow-[0_14px_40px_-24px_rgba(15,23,42,0.2)] relative overflow-hidden flex flex-col items-center">
                {/* Result Overlay */}
                {scanResult && (
                    <div className={cn(
                        "absolute inset-0 z-10 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300",
                        scanResult.type === 'success' ? "bg-emerald-900/90 backdrop-blur-md text-emerald-400" : "bg-red-900/90 backdrop-blur-md text-red-400"
                    )}>
                        {scanResult.type === 'success' ? <CheckCircle2 size={80} className="mb-4" /> : <XCircle size={80} className="mb-4" />}
                        <h2 className="text-3xl font-black text-white text-center mb-2 px-4">{scanResult.message}</h2>
                        {scanResult.tier && <p className="text-xl font-bold uppercase py-2 px-6 border-2 border-current rounded-full">PASS {scanResult.tier}</p>}
                    </div>
                )}

                {scanning && !scanResult && (
                    <div className="absolute inset-0 z-10 bg-black/80 flex items-center justify-center">
                        <Loader2 className="text-slate-700 animate-spin" size={60} />
                    </div>
                )}

                <div id="reader" className="w-full max-w-[400px] bg-black rounded-3xl overflow-hidden [&_video]:rounded-3xl [&_video]:object-cover" />
            </div>

            <div className="mt-8 text-center text-slate-500 text-sm">
                <p>Pointez le code QR roulant du participant.</p>
                <p>Mode actuel : le scan modifiera l'état à <strong>{scanMode === 'in' ? 'A L\'INTERIEUR' : 'SORTI'}</strong>.</p>
            </div>
            
            <style>{`
                /* Cacher les boutons par défaut moches de html5-qrcode */
                #reader__dashboard_section_csr button {
                    background-color: #0f172a !important;
                    color: white !important;
                    border: none !important;
                    padding: 8px 16px !important;
                    border-radius: 8px !important;
                    font-weight: bold !important;
                    cursor: pointer !important;
                }
                #reader__dashboard_section_csr select {
                    background-color: #ffffff !important;
                    color: #0f172a !important;
                    padding: 8px !important;
                    border-radius: 8px !important;
                    border: 1px solid #334155 !important;
                    margin-bottom: 10px !important;
                }
                #reader__scan_region img {
                    border-radius: 24px;
                }
            `}</style>
            </div>
        </div>
    );
};

export default EventScanner;
