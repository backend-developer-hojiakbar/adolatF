
import React, { useState, useRef, useEffect } from 'react';
import { CameraIcon, XMarkIcon, CheckCircleIcon, PlusIcon, PencilSquareIcon, PhotoIcon } from '../icons';
import { ScannedDoc } from './MobileLayout';

declare global {
    interface Window {
        cv: any;
        jspdf: any;
    }
}

interface Point {
    x: number;
    y: number;
}

interface DocumentScannerProps {
    t: (key: string) => string;
    onSave: (doc: ScannedDoc) => void;
}

export const DocumentScanner: React.FC<DocumentScannerProps> = ({ t, onSave }) => {
    const [mode, setMode] = useState<'idle' | 'camera' | 'crop' | 'processing' | 'review'>('idle');
    const [cvLoaded, setCvLoaded] = useState(false);

    const [currentSessionPages, setCurrentSessionPages] = useState<string[]>([]);
    const [docName, setDocName] = useState("");
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [cropPoints, setCropPoints] = useState<Point[]>([
        { x: 10, y: 10 }, { x: 90, y: 10 },
        { x: 90, y: 90 }, { x: 10, y: 90 }
    ]);
    const [activePoint, setActivePoint] = useState<number | null>(null);

    // Zoom states
    const [zoom, setZoom] = useState(1);
    const [minZoom, setMinZoom] = useState(1);
    const [maxZoom, setMaxZoom] = useState(3);
    const [zoomSupported, setZoomSupported] = useState(true); // Always supported (Digital Fallback)
    const [hardwareZoomAvailable, setHardwareZoomAvailable] = useState(false);
    const [pinchStartDist, setPinchStartDist] = useState<number | null>(null);
    const [startZoom, setStartZoom] = useState(1);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const checkCv = setInterval(() => {
            if (window.cv && window.cv.Mat) {
                setCvLoaded(true);
                clearInterval(checkCv);
            }
        }, 500);
        return () => clearInterval(checkCv);
    }, []);

    useEffect(() => {
        if (mode === 'review' && !docName) {
            setDocName(`Ҳужжат_${new Date().toLocaleDateString()}_${currentSessionPages.length}_бет`);
        }
    }, [mode, currentSessionPages.length]);

    const startCamera = () => {
        setMode('camera');
        setTimeout(async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: 'environment',
                        width: { ideal: 3840 },
                        height: { ideal: 2160 },
                        zoom: true
                    } as any
                });
                streamRef.current = stream;
                if (videoRef.current) videoRef.current.srcObject = stream;

                // Check for zoom capabilities
                const track = stream.getVideoTracks()[0];
                const capabilities = track.getCapabilities() as any;

                if (capabilities.zoom) {
                    setHardwareZoomAvailable(true);
                    // Support wider range if hardware supports it (e.g. 0.5x)
                    setMinZoom(capabilities.zoom.min);
                    setMaxZoom(capabilities.zoom.max);
                    // Default to 1x unless min is greater
                    setZoom(Math.max(1, capabilities.zoom.min));
                } else {
                    console.log("Zoom not supported by hardware, using Digital Zoom");
                    setHardwareZoomAvailable(false);
                    setMinZoom(1);
                    setMaxZoom(4); // Digital zoom limit
                }
                setZoomSupported(true);
            } catch (err) {
                console.error("Camera error", err);
                setMode('idle');
            }
        }, 100);
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setZoom(1);
        setZoomSupported(false);
    };

    const handleZoom = (newZoom: number) => {
        if (!streamRef.current) return;

        const clampedZoom = Math.min(Math.max(newZoom, minZoom), maxZoom);
        setZoom(clampedZoom);

        if (hardwareZoomAvailable) {
            const track = streamRef.current.getVideoTracks()[0];
            try {
                track.applyConstraints({
                    advanced: [{ zoom: clampedZoom } as any]
                });
            } catch (e) {
                console.error("Failed to apply hardware zoom", e);
            }
        }
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (mode === 'camera' && e.touches.length === 2 && zoomSupported) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            setPinchStartDist(dist);
            setStartZoom(zoom);
        } else if (mode === 'crop' && cropPoints) {
            // Existing crop logic would be here if needed explicitly, 
            // but the point move handler is separate.
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (mode === 'camera' && e.touches.length === 2 && zoomSupported && pinchStartDist !== null) {
            const dist = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );

            // Calculate zoom ratio
            const ratio = dist / pinchStartDist;

            // Direct multiplicative zoom is most natural
            const newZoom = startZoom * ratio;
            handleZoom(newZoom);
        }
    };

    const handleTouchEnd = () => {
        setPinchStartDist(null);
    };

    const takePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Digital Zoom Capture Logic
        if (!hardwareZoomAvailable && zoom > 1) {
            const sWidth = video.videoWidth / zoom;
            const sHeight = video.videoHeight / zoom;
            const sx = (video.videoWidth - sWidth) / 2;
            const sy = (video.videoHeight - sHeight) / 2;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
        } else {
            // Standard Capture
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0);
        }

        setCapturedImage(canvas.toDataURL('image/jpeg', 1.0));
        stopCamera();
        setMode('crop');
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                setCapturedImage(event.target?.result as string);
                stopCamera();
                setMode('crop');
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePointMove = (index: number, e: React.TouchEvent | React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
        const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
        const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
        const newPoints = [...cropPoints];
        newPoints[index] = { x, y };
        setCropPoints(newPoints);
        setActivePoint(index);
    };

    const processPage = async () => {
        if (!capturedImage || !window.cv) return;
        setMode('processing');

        const img = new Image();
        img.src = capturedImage;
        img.onload = () => {
            const cv = window.cv;
            let src = cv.imread(img);
            let dst = new cv.Mat();
            const srcCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [
                cropPoints[0].x * img.width / 100, cropPoints[0].y * img.height / 100,
                cropPoints[1].x * img.width / 100, cropPoints[1].y * img.height / 100,
                cropPoints[2].x * img.width / 100, cropPoints[2].y * img.height / 100,
                cropPoints[3].x * img.width / 100, cropPoints[3].y * img.height / 100
            ]);
            const w1 = Math.hypot(cropPoints[1].x - cropPoints[0].x, cropPoints[1].y - cropPoints[0].y) * img.width / 100;
            const w2 = Math.hypot(cropPoints[2].x - cropPoints[3].x, cropPoints[2].y - cropPoints[3].y) * img.width / 100;
            const targetWidth = Math.max(w1, w2);
            const h1 = Math.hypot(cropPoints[3].x - cropPoints[0].x, cropPoints[3].y - cropPoints[0].y) * img.height / 100;
            // Fix: Changed promoPoints to cropPoints
            const h2 = Math.hypot(cropPoints[2].x - cropPoints[1].x, cropPoints[2].y - cropPoints[1].y) * img.height / 100;
            const targetHeight = Math.max(h1, h2);
            const dstCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, targetWidth, 0, targetWidth, targetHeight, 0, targetHeight]);
            let M = cv.getPerspectiveTransform(srcCoords, dstCoords);
            cv.warpPerspective(src, dst, M, new cv.Size(targetWidth, targetHeight), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
            const outCanvas = document.createElement('canvas');
            cv.imshow(outCanvas, dst);
            const finalDataUrl = outCanvas.toDataURL('image/jpeg', 0.9);
            setCurrentSessionPages(prev => [...prev, finalDataUrl]);
            setMode('review');
            src.delete(); dst.delete(); M.delete(); srcCoords.delete(); dstCoords.delete();
            if (window.navigator.vibrate) window.navigator.vibrate(50);
        };
    };

    const finishSession = () => {
        if (currentSessionPages.length === 0) return;
        const finalName = docName.trim() || `Ҳужжат_${new Date().toLocaleDateString()}_${currentSessionPages.length}_бет`;
        const newDoc: ScannedDoc = {
            id: `doc-${Date.now()}`,
            pages: currentSessionPages,
            timestamp: new Date().toISOString(),
            name: finalName
        };
        onSave(newDoc);
        setCurrentSessionPages([]);
        setDocName("");
        setMode('idle');
    };

    return (
        <div className="w-full h-full flex flex-col animate-assemble-in overflow-hidden relative">
            <canvas ref={canvasRef} className="hidden" />
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
            />

            {mode === 'idle' && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                    <div className="w-24 h-24 bg-indigo-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-indigo-500/20 shadow-2xl">
                        <CameraIcon className="h-12 w-12 text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter">{t('mobile_scanner_title')}</h2>
                    <p className="text-slate-400 text-sm mb-10 max-w-xs">{t('mobile_scanner_desc')}</p>

                    <div className="w-full flex flex-col gap-4">
                        <button
                            onClick={startCamera}
                            disabled={!cvLoaded}
                            className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <CameraIcon className="h-6 w-6" /> {cvLoaded ? "Камерани очиш" : "Юкланмоқда..."}
                        </button>

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={!cvLoaded}
                            className="w-full bg-slate-800 border border-white/10 text-white font-black py-5 rounded-[2rem] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                        >
                            <PhotoIcon className="h-6 w-6 text-indigo-400" /> Галереядан танлаш
                        </button>
                    </div>
                </div>
            )}

            {mode === 'camera' && (
                <div
                    className="relative flex-1 bg-black overflow-hidden flex flex-col touch-none"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover transition-transform duration-100 ease-linear"
                        style={{ transform: !hardwareZoomAvailable ? `scale(${zoom})` : 'none' }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-10">
                        <div className="w-full h-full border-2 border-dashed border-white/20 rounded-3xl relative">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-indigo-400 shadow-[0_0_15px_indigo] animate-scan-line"></div>
                        </div>
                    </div>
                    <div className="absolute top-10 left-0 w-full flex justify-center z-20">
                        <div className="px-4 py-1.5 bg-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Саҳифа #{currentSessionPages.length + 1}</div>
                    </div>

                    {/* Zoom Slider */}
                    {zoomSupported && (
                        <div className="absolute bottom-32 left-0 w-full px-10 flex items-center justify-center gap-4 z-30">
                            <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">{minZoom}x</span>
                            <input
                                type="range"
                                min={minZoom}
                                max={maxZoom}
                                step="0.1"
                                value={zoom}
                                onChange={(e) => handleZoom(parseFloat(e.target.value))}
                                className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
                            />
                            <span className="text-xs font-bold text-white bg-black/50 px-2 py-1 rounded">{maxZoom.toFixed(1)}x</span>
                        </div>
                    )}

                    <div className="absolute bottom-10 left-0 w-full flex items-center justify-around z-20">
                        <button onClick={() => setMode(currentSessionPages.length > 0 ? 'review' : 'idle')} className="p-4 bg-slate-900/60 backdrop-blur-xl rounded-full text-white border border-white/10"><XMarkIcon className="h-6 w-6" /></button>

                        <button onClick={takePhoto} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center shadow-2xl">
                            <div className="w-16 h-16 bg-white rounded-full active:scale-90 transition-transform"></div>
                        </button>

                        <button onClick={() => fileInputRef.current?.click()} className="p-4 bg-indigo-600/60 backdrop-blur-xl rounded-full text-white border border-white/10 active:scale-90 transition-transform">
                            <PhotoIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            )}

            {mode === 'crop' && capturedImage && (
                <div className="relative flex-1 bg-[#0f172a] flex flex-col overflow-hidden">
                    <header className="p-4 flex items-center justify-between z-20 bg-slate-900/40 border-b border-white/5 backdrop-blur-md">
                        <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400">Чегараларни тўғирланг</h3>
                        <button onClick={() => setMode('camera')} className="p-2 text-slate-400"><XMarkIcon className="h-5 w-5" /></button>
                    </header>
                    <div ref={containerRef} className="flex-1 relative m-4 bg-black rounded-3xl overflow-hidden shadow-inner border border-white/5">
                        <img src={capturedImage} className="w-full h-full object-contain opacity-80" alt="To Crop" />
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            <polygon points={cropPoints.map(p => `${p.x}%,${p.y}%`).join(' ')} fill="rgba(99, 102, 241, 0.1)" stroke="rgba(99, 102, 241, 0.9)" strokeWidth="2.5" strokeDasharray="6 4" />
                        </svg>
                        {cropPoints.map((point, i) => (
                            <div key={i} onTouchMove={(e) => handlePointMove(i, e)} onTouchStart={() => setActivePoint(i)} onTouchEnd={() => setActivePoint(null)} className="absolute w-14 h-14 -ml-7 -mt-7 flex items-center justify-center z-30 touch-none" style={{ left: `${point.x}%`, top: `${point.y}%` }}>
                                <div className={`w-8 h-8 rounded-full border-4 border-white shadow-2xl transition-all ${activePoint === i ? 'scale-150 bg-indigo-500' : 'bg-indigo-600'}`}></div>
                            </div>
                        ))}
                    </div>
                    <div className="p-6 bg-slate-900/90 border-t border-white/10 backdrop-blur-3xl">
                        <button onClick={processPage} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-indigo-500/30">
                            <CheckCircleIcon className="h-6 w-6" /> Саҳифани қўшиш
                        </button>
                    </div>
                </div>
            )}

            {mode === 'review' && (
                <div className="flex-1 flex flex-col bg-[#0f172a] animate-assemble-in overflow-hidden">
                    <header className="p-6 text-center border-b border-white/5 bg-slate-900/20">
                        <h2 className="text-xl font-black uppercase tracking-tighter">Ҳужжат тайёр</h2>

                        <div className="mt-4 max-w-sm mx-auto w-full relative">
                            <input
                                type="text"
                                value={docName}
                                onChange={(e) => setDocName(e.target.value)}
                                placeholder="Ҳужжат номини ёзинг..."
                                className="w-full bg-slate-800/80 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-indigo-500/50"
                            />
                            <PencilSquareIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400" />
                        </div>
                    </header>
                    <div className="flex-1 overflow-x-auto flex items-center gap-6 px-10 py-4 snap-x bg-black/20">
                        {currentSessionPages.map((page, i) => (
                            <div key={i} className="flex-shrink-0 w-64 aspect-[3/4] bg-slate-900 rounded-2xl shadow-2xl relative snap-center border border-white/10 overflow-hidden">
                                <img src={page} className="w-full h-full object-contain p-1" alt={`Page ${i + 1}`} />
                                <div className="absolute top-2 right-2 w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-[10px] shadow-lg border border-white/20">{i + 1}</div>
                                <button onClick={() => setCurrentSessionPages(prev => prev.filter((_, idx) => idx !== i))} className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-red-500/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">Ўчириш</button>
                            </div>
                        ))}
                        <button onClick={startCamera} className="flex-shrink-0 w-40 aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-indigo-400 transition-all bg-slate-900/40"><PlusIcon className="h-10 w-10" /><span className="text-[10px] font-bold uppercase tracking-widest text-center">Яна саҳифа<br />камерадан</span></button>

                        <button onClick={() => fileInputRef.current?.click()} className="flex-shrink-0 w-40 aspect-[3/4] rounded-2xl border-2 border-dashed border-indigo-700/50 flex flex-col items-center justify-center gap-3 text-indigo-500 hover:text-indigo-400 transition-all bg-indigo-900/10"><PhotoIcon className="h-10 w-10" /><span className="text-[10px] font-bold uppercase tracking-widest text-center">Яна саҳифа<br />галереядан</span></button>
                    </div>
                    <div className="p-6 bg-slate-900/50 border-t border-white/10 backdrop-blur-xl flex flex-col gap-3">
                        <button onClick={finishSession} className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-indigo-500/40">
                            <CheckCircleIcon className="h-6 w-6" /> Тамомлаш ва Сақлаш
                        </button>
                    </div>
                </div>
            )}

            {mode === 'processing' && (
                <div className="absolute inset-0 bg-[#0f172a] z-50 flex flex-col items-center justify-center backdrop-blur-lg">
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
                    <span className="text-xs font-black uppercase tracking-[0.4em] text-indigo-400 animate-pulse">Қайта ишлаш...</span>
                </div>
            )}
        </div>
    );
};
