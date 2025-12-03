
import React, { useRef, useState, useEffect } from 'react';
import { ConnectionState } from '../types';
import { Maximize2, Loader2, Smartphone, Video, StopCircle, GripHorizontal, MoveDiagonal, Globe, Cable, Search, RefreshCw, ArrowRight } from 'lucide-react';
import { translations, Language } from '../utils/translations';

interface PhoneDisplayProps {
    connectionState: ConnectionState;
    onFrameCapture: (imageData: string) => void;
    isAnalyzing: boolean;
    language: Language;
    onLog: (message: string, type: 'info' | 'error' | 'success') => void;
}

type DisplayMode = 'usb' | 'browser';

export const PhoneDisplay: React.FC<PhoneDisplayProps> = ({ 
    connectionState, 
    onFrameCapture, 
    isAnalyzing,
    language,
    onLog
}) => {
    const t = translations[language];
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const usbControllerRef = useRef<any>(null);
    
    // Modes
    const [displayMode, setDisplayMode] = useState<DisplayMode>('usb');
    const [url, setUrl] = useState('https://www.google.com/webhp?igu=1'); // igu=1 allows some google content in iframes
    const [iframeUrl, setIframeUrl] = useState(url);

    const [streamActive, setStreamActive] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const timerRef = useRef<number | null>(null);

    // Draggable & Resizable State
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    
    // Refs for drag calculations to avoid stale closures in listeners
    const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });
    const resizeStartRef = useRef({ mouseX: 0, scale: 1 });

    // --- Drag Logic ---
    const handleDragStart = (e: React.MouseEvent) => {
        // Prevent default to avoid text selection etc
        e.preventDefault();
        setIsDragging(true);
        dragStartRef.current = {
            mouseX: e.clientX,
            mouseY: e.clientY,
            posX: position.x,
            posY: position.y
        };
    };

    // --- Resize Logic ---
    const handleResizeStart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Don't trigger drag
        setIsResizing(true);
        resizeStartRef.current = {
            mouseX: e.clientX,
            scale: scale
        };
    };

    // --- Global Mouse Listeners ---
    useEffect(() => {
        const handleWindowMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                const deltaX = e.clientX - dragStartRef.current.mouseX;
                const deltaY = e.clientY - dragStartRef.current.mouseY;
                setPosition({
                    x: dragStartRef.current.posX + deltaX,
                    y: dragStartRef.current.posY + deltaY
                });
            } else if (isResizing) {
                const deltaX = e.clientX - resizeStartRef.current.mouseX;
                // Sensitivity factor: 1000px drag = 100% scale change roughly
                const scaleDelta = deltaX * 0.002; 
                const newScale = Math.min(Math.max(resizeStartRef.current.scale + scaleDelta, 0.5), 1.5);
                setScale(newScale);
            }
        };

        const handleWindowMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleWindowMouseMove);
            window.addEventListener('mouseup', handleWindowMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleWindowMouseMove);
            window.removeEventListener('mouseup', handleWindowMouseUp);
        };
    }, [isDragging, isResizing]);


    // --- Media & Browser Logic ---

    const startUsbMirror = async () => {
        if (!canvasRef.current) {
            onLog("Canvas not available", "error");
            return;
        }
        try {
            const { startUsbMirror } = await import('../services/usbMirror');
            // Keep ref so we can stop later
            // @ts-ignore dynamic module shape
            (usbControllerRef as any).current = await startUsbMirror(canvasRef.current, (m: string, t: any = 'info') => onLog(m, t));
            setStreamActive(true);
        } catch (err: any) {
            console.error("USB mirror error:", err);
            const msg = err?.message ? `USB mirror failed: ${err.message}` : 'USB mirror failed';
            onLog(msg, 'error');
        }
    };

    const stopStream = () => {
        if (isRecording) stopRecording();
        // Stop browser capture if any
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        // Stop USB mirror if active
        if ((usbControllerRef as any).current) {
            (usbControllerRef as any).current.stop?.().catch(() => {});
            (usbControllerRef as any).current = null;
        }
        setStreamActive(false);
    };

    const startRecording = async () => {
        if (displayMode === 'browser') {
             onLog("Recording only available in USB Mirror mode", "error");
             return;
        }

        if (!videoRef.current?.srcObject) return;

        try {
            const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const screenStream = videoRef.current.srcObject as MediaStream;

            const tracks = [
                ...screenStream.getVideoTracks(),
                ...audioStream.getAudioTracks()
            ];
            const combinedStream = new MediaStream(tracks);

            const mimeType = MediaRecorder.isTypeSupported('video/webm; codecs=vp9') 
                ? 'video/webm; codecs=vp9' 
                : 'video/webm';

            const recorder = new MediaRecorder(combinedStream, { mimeType });
            mediaRecorderRef.current = recorder;

            const chunks: Blob[] = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunks.push(e.data);
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `recording-${new Date().toISOString()}.webm`;
                a.click();
                URL.revokeObjectURL(url);
                audioStream.getTracks().forEach(track => track.stop());
                onLog(t.recording_saved, "success");
            };

            recorder.start();
            setIsRecording(true);
            onLog(t.recording_started, "info");

            setRecordingTime(0);
            timerRef.current = window.setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Recording error:", err);
            onLog(t.mic_error, "error");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleUrlSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        let targetUrl = url;
        if (!targetUrl.startsWith('http')) {
            targetUrl = 'https://' + targetUrl;
        }
        setIframeUrl(targetUrl);
    };

    return (
        <div 
            className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden"
        >
            {/* Stage Grid Background */}
            <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10" 
                 style={{ 
                     backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', 
                     backgroundSize: '20px 20px' 
                 }}>
            </div>

            {/* Draggable Container */}
            <div 
                className="relative transition-transform duration-75 ease-out will-change-transform z-20"
                style={{ 
                    transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                    cursor: isDragging ? 'grabbing' : 'default'
                }}
            >
                {/* Drag Handle (Visible on Hover/Interaction) */}
                <div 
                    className="absolute -top-16 left-0 right-0 h-16 flex items-center justify-center cursor-grab active:cursor-grabbing group opacity-0 hover:opacity-100 transition-opacity z-50"
                    onMouseDown={handleDragStart}
                >
                    <div className="bg-white/80 dark:bg-black/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-gray-200 dark:border-white/10 shadow-lg flex items-center gap-2 pointer-events-none">
                        <GripHorizontal className="w-4 h-4 text-gray-500" />
                        <span className="text-[10px] font-medium text-gray-500">{t.drag_hint}</span>
                    </div>
                </div>

                {/* Device Container */}
                <div className={`relative transition-all duration-700 ease-out transform`}>
                    
                    {/* Outer Glow */}
                    <div className={`absolute -inset-1 bg-gradient-to-b from-primary-500/20 to-accent-500/20 dark:from-primary-500/30 dark:to-accent-500/30 rounded-[3.5rem] blur-xl transition-opacity duration-500 ${streamActive || displayMode === 'browser' ? 'opacity-100' : 'opacity-0'}`}></div>

                    {/* Device Frame */}
                    <div className="relative border-[6px] border-gray-200 dark:border-[#2a2a2c] rounded-[3.2rem] shadow-2xl bg-black overflow-hidden w-[340px] h-[700px] z-10 ring-1 ring-black/5 dark:ring-white/10 transition-colors duration-500">
                        
                        {/* Screen Content Area */}
                        <div className="relative w-full h-full bg-slate-900 flex flex-col overflow-hidden rounded-[2.8rem] bg-clip-border">
                            
                            {/* Dynamic Island Area / Mode Switcher */}
                            <div className="absolute top-0 w-full h-16 z-50 flex flex-col items-center pt-3 pointer-events-none">
                                 {/* Island */}
                                 <div className={`
                                     h-[32px] bg-black rounded-full flex items-center justify-center gap-3 px-4 transition-all duration-300 shadow-xl z-50 pointer-events-auto
                                     ${isAnalyzing || isRecording ? 'w-[160px]' : 'w-[120px]'}
                                 `}>
                                     {/* Simple Mode Toggle in Island if idle */}
                                    {!isAnalyzing && !isRecording && (
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => setDisplayMode('usb')}
                                                className={`p-1 rounded-full transition-colors ${displayMode === 'usb' ? 'text-white' : 'text-gray-600'}`}
                                                title={t.usb_mode}
                                            >
                                                <Cable className="w-3.5 h-3.5" />
                                            </button>
                                            <div className="w-[1px] h-3 bg-gray-800"></div>
                                            <button 
                                                onClick={() => setDisplayMode('browser')}
                                                className={`p-1 rounded-full transition-colors ${displayMode === 'browser' ? 'text-white' : 'text-gray-600'}`}
                                                title={t.browser_mode}
                                            >
                                                <Globe className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Active States */}
                                    {isAnalyzing && (
                                        <>
                                            <Loader2 className="w-3 h-3 text-primary-400 animate-spin" />
                                            <span className="text-[10px] text-white font-medium">{t.processing}</span>
                                        </>
                                    )}
                                    {isRecording && !isAnalyzing && (
                                        <>
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                            <span className="text-[10px] text-white font-medium">{formatTime(recordingTime)}</span>
                                        </>
                                    )}
                                 </div>
                            </div>
                            
                            {/* --- USB MIRROR MODE --- */}
                            <div className={`absolute inset-0 transition-opacity duration-300 ${displayMode === 'usb' ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
                                <canvas 
                                    ref={canvasRef}
                                    className={`w-full h-full object-cover transition-opacity duration-500 ${streamActive ? 'opacity-100' : 'opacity-0'}`}
                                />

                                {!streamActive && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-100 dark:bg-gradient-to-br dark:from-gray-900 dark:to-black transition-colors duration-500">
                                        {connectionState === ConnectionState.CONNECTED ? (
                                            <div className="animate-in fade-in zoom-in duration-500 flex flex-col items-center">
                                                <div className="w-20 h-20 rounded-full bg-primary-50 dark:bg-gradient-to-br dark:from-primary-500/20 dark:to-accent-500/20 flex items-center justify-center mb-6 ring-1 ring-primary-100 dark:ring-white/10 backdrop-blur-md">
                                                    <Smartphone className="w-10 h-10 text-primary-600 dark:text-white" />
                                                </div>
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t.ready}</h3>
                                                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">{t.device_auth}</p>
                                                
                                                <button 
                                                    onClick={startUsbMirror}
                                                    className="group relative inline-flex items-center justify-center px-8 py-3 font-medium text-white transition-all duration-200 bg-primary-600 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-full hover:bg-primary-700 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                                >
                                                    <span className="relative flex items-center gap-2">
                                                        <Maximize2 className="w-4 h-4" />
                                                        {t.start_projection}
                                                    </span>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center opacity-40">
                                                <div className="w-16 h-16 border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-2xl flex items-center justify-center mb-4">
                                                    <Smartphone className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                                </div>
                                                <p className="text-sm text-gray-500">{t.waiting}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                             {/* --- BROWSER MODE --- */}
                             <div className={`absolute inset-0 flex flex-col bg-white dark:bg-gray-900 transition-opacity duration-300 ${displayMode === 'browser' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                                {/* Browser Toolbar */}
                                <div className="mt-14 px-3 pb-2 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-900">
                                    <form onSubmit={handleUrlSubmit} className="flex gap-2 relative">
                                        <div className="absolute left-3 top-2.5 text-gray-400">
                                            <Search className="w-3.5 h-3.5" />
                                        </div>
                                        <input 
                                            type="text" 
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder={t.enter_url}
                                            className="w-full pl-8 pr-8 py-1.5 text-xs rounded-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-gray-200"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setIframeUrl(url)}
                                            className="absolute right-2 top-1.5 p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-md text-gray-400 transition-colors"
                                        >
                                            <RefreshCw className="w-3 h-3" />
                                        </button>
                                    </form>
                                </div>
                                {/* Iframe */}
                                <div className="flex-1 bg-white relative">
                                    <iframe 
                                        src={iframeUrl}
                                        className="w-full h-full border-none"
                                        sandbox="allow-scripts allow-same-origin allow-forms"
                                        title="Embedded Browser"
                                    />
                                    {/* Overlay for when dragging to prevent iframe capturing mouse events */}
                                    {isDragging && <div className="absolute inset-0 bg-transparent z-50"></div>}
                                </div>
                             </div>


                            {/* Analysis Overlay Effect (Visual Only) */}
                            {isAnalyzing && displayMode === 'usb' && (
                                <div className="absolute inset-0 z-20 overflow-hidden rounded-[3rem] pointer-events-none">
                                    <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-transparent via-primary-400 to-transparent shadow-[0_0_20px_rgba(99,102,241,0.5)] animate-scan"></div>
                                    <div className="absolute inset-0 bg-primary-500/5 backdrop-blur-[1px]"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reflection Overlay */}
                    <div className="absolute inset-0 rounded-[3.2rem] bg-gradient-to-tr from-white/20 via-transparent to-transparent pointer-events-none z-20 opacity-50 dark:opacity-20"></div>
                </div>

                {/* Resize Handle (Right Bottom) - Functional Now */}
                <div 
                    className="absolute -bottom-6 -right-6 w-12 h-12 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-nwse-resize z-50"
                    onMouseDown={handleResizeStart}
                >
                     <div className="p-2 bg-white/20 hover:bg-white/40 rounded-full backdrop-blur-md">
                        <MoveDiagonal className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                     </div>
                </div>
            </div>

            {/* Floating Action Bar - Recording Only */}
            <div className="absolute bottom-10 z-30 flex gap-3 pointer-events-auto">
                {streamActive && displayMode === 'usb' && (
                    <button 
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`group relative flex items-center gap-3 px-5 py-2.5 rounded-xl border transition-all hover:shadow-lg shadow-sm backdrop-blur-md
                        ${isRecording 
                            ? 'bg-red-50/90 dark:bg-red-950/60 border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400' 
                            : 'bg-white/90 dark:bg-black/60 border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10'
                        }`}
                    >
                        <div className={`p-1 rounded-md transition-transform group-hover:scale-110 ${isRecording ? 'bg-red-200 dark:bg-red-500/20 text-red-700 dark:text-red-300' : 'bg-gray-100 dark:bg-white/10'}`}>
                            {isRecording ? <StopCircle className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-sm font-medium">{isRecording ? t.stop : t.record}</span>
                    </button>
                )}
            </div>

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};
