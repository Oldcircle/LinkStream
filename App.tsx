




import React, { useState, useCallback, useEffect, useRef } from 'react';
import { PhoneDisplay } from './components/PhoneDisplay';
import { TerminalLog } from './components/TerminalLog';
import { AiPanel } from './components/AiPanel';
import { Notebook } from './components/Notebook';
import { NetworkPanel } from './components/NetworkPanel';
import { LogcatPanel } from './components/LogcatPanel';
import { ModelSettingsModal } from './components/ModelSettingsModal';
import { ConnectionState, LogEntry, ModelConfig, NetworkRequest, LogcatEntry, LogLevel } from './types';
import { askGeminiChat, generateSmartNotes, ChatMessage } from './services/geminiService';
import { Sparkles, Cast, Zap, Moon, Sun, BookOpen, Activity, Settings, Network, FileCode, Disc, StopCircle } from 'lucide-react';
import { translations, Language } from './utils/translations';

// Initial default config
const INITIAL_CONFIGS: ModelConfig[] = [
    {
        id: 'default',
        name: 'Default (Gemini)',
        provider: 'google',
        apiKey: '',
        baseUrl: '',
        model: 'gemini-2.5-flash'
    }
];

const App: React.FC = () => {
    const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED);
    const [deviceName, setDeviceName] = useState<string>('');
    const [logs, setLogs] = useState<LogEntry[]>([]);
    
    // AI & Chat State
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
    
    // Notebook State
    const [notebookContent, setNotebookContent] = useState('');

    // Theme & Language State
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [language, setLanguage] = useState<Language>('en');

    // Right Panel Tabs
    const [activeTab, setActiveTab] = useState<'activity' | 'notebook' | 'network' | 'logcat'>('activity');

    // Network & Logcat State
    const [networkRequests, setNetworkRequests] = useState<NetworkRequest[]>([]);
    const [logcatLogs, setLogcatLogs] = useState<LogcatEntry[]>([]);
    const [targetPackage, setTargetPackage] = useState('com.example.app');

    // Settings Modal State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [modelConfigs, setModelConfigs] = useState<ModelConfig[]>(() => {
        const saved = localStorage.getItem('linkstream_model_configs');
        return saved ? JSON.parse(saved) : INITIAL_CONFIGS;
    });
    const [activeConfigId, setActiveConfigId] = useState<string>(() => {
        return localStorage.getItem('linkstream_active_config_id') || 'default';
    });

    // Workspace Recording State
    const [isWorkspaceRecording, setIsWorkspaceRecording] = useState(false);
    const workspaceRecorderRef = useRef<MediaRecorder | null>(null);
    const workspaceStreamRef = useRef<MediaStream | null>(null);

    const t = translations[language];

    // Theme toggle handler
    const toggleTheme = () => {
        setTheme(prev => {
            const newTheme = prev === 'dark' ? 'light' : 'dark';
            if (newTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            return newTheme;
        });
    };

    // Language toggle handler
    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'zh' : 'en');
    };

    const handleSaveConfigs = (newConfigs: ModelConfig[], newActiveId: string) => {
        setModelConfigs(newConfigs);
        setActiveConfigId(newActiveId);
        localStorage.setItem('linkstream_model_configs', JSON.stringify(newConfigs));
        localStorage.setItem('linkstream_active_config_id', newActiveId);
        addLog(t.save_success, 'success');
    };

    const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
        setLogs(prev => [...prev, {
            id: Math.random().toString(36).substring(7),
            timestamp: new Date(),
            message,
            type
        }]);
    }, []);

    const handleConnect = async () => {
        if (!(navigator as any).usb) {
            addLog('WebUSB API not supported. Please use Chrome/Edge.', 'error');
            return;
        }

        try {
            setConnectionState(ConnectionState.CONNECTING);
            addLog(t.scanning);
            
            const device = await (navigator as any).usb.requestDevice({ filters: [] });
            
            if (device) {
                await device.open();
                try {
                    if (device.configuration === null) {
                         await device.selectConfiguration(1);
                    }
                } catch (e) {
                    addLog(t.auto_negotiation, 'warning');
                }

                setDeviceName(device.productName || device.manufacturerName || 'Android Device');
                setConnectionState(ConnectionState.CONNECTED);
                
                addLog(`${t.connected_to} ${device.productName}`, 'success');
                setTimeout(() => addLog(t.video_handshake, 'info'), 800);
            }
        } catch (error: any) {
            setConnectionState(ConnectionState.ERROR);
            addLog(`${t.connection_failed}: ${error.message}`, 'error');
            setConnectionState(ConnectionState.DISCONNECTED);
        }
    };

    // --- Simulation Logic for Network & Logcat ---
    useEffect(() => {
        let interval: number;
        
        if (connectionState === ConnectionState.CONNECTED) {
            interval = window.setInterval(() => {
                // 1. Simulate Logcat
                if (Math.random() > 0.3) {
                    const levels: LogLevel[] = ['D', 'I', 'W', 'E', 'V'];
                    const level = Math.random() > 0.9 ? 'E' : levels[Math.floor(Math.random() * levels.length)];
                    const tags = ['ActivityManager', 'NetworkSecurity', 'OpenGLRenderer', 'MyApplication', 'OkHttp'];
                    const msgs = [
                        'Starting activity: Intent { cmp=com.example.app/.MainActivity }',
                        'ViewRootImpl: Hardware acceleration enabled',
                        'Response received 200 OK',
                        'Failed to connect to server: SocketTimeout',
                        'GC_CONCURRENT freed 2048K, 15% free 14MB/16MB',
                        'Rendering frame took 16.6ms',
                        'User interaction detected',
                    ];
                    
                    const newLog: LogcatEntry = {
                        id: Date.now().toString() + Math.random(),
                        timestamp: new Date(),
                        level,
                        tag: tags[Math.floor(Math.random() * tags.length)],
                        pid: 1234,
                        tid: 1,
                        message: msgs[Math.floor(Math.random() * msgs.length)],
                        packageName: Math.random() > 0.5 ? targetPackage : 'com.android.systemui'
                    };
                    setLogcatLogs(prev => [...prev.slice(-199), newLog]);
                }

                // 2. Simulate Network
                if (Math.random() > 0.6) {
                    const methods: ('GET'|'POST'|'PUT'|'DELETE')[] = ['GET', 'POST', 'PUT', 'GET', 'GET'];
                    const urls = [
                        '/api/v1/users',
                        '/api/v1/auth/token',
                        '/static/images/logo.png',
                        '/api/v2/feed',
                        '/analytics/event'
                    ];
                    const codes = [200, 200, 200, 201, 204, 400, 401, 404, 500];
                    const method = methods[Math.floor(Math.random() * methods.length)];
                    
                    const newReq: NetworkRequest = {
                        id: Date.now().toString() + Math.random(),
                        timestamp: new Date(),
                        method,
                        url: `https://api.example.com${urls[Math.floor(Math.random() * urls.length)]}`,
                        status: codes[Math.floor(Math.random() * codes.length)],
                        duration: Math.floor(Math.random() * 500) + 20,
                        size: (Math.random() * 5).toFixed(1) + 'KB',
                        type: 'json'
                    };
                    setNetworkRequests(prev => [...prev.slice(-49), newReq]);
                }
            }, 1500);
        }

        return () => clearInterval(interval);
    }, [connectionState, targetPackage]);

    // Chat Logic
    const handleSendMessage = async (text: string) => {
        const newHistory = [...chatHistory, { role: 'user', text } as ChatMessage];
        setChatHistory(newHistory);
        
        // Pass current config context (In a real app, you would pass the API keys here)
        // For now we still use the default env var in geminiService unless we refactor it
        const response = await askGeminiChat(chatHistory, text);
        
        setChatHistory([...newHistory, { role: 'model', text: response } as ChatMessage]);
    };

    // Smart Notes Logic
    const handleGenerateNotes = async () => {
        setIsGeneratingNotes(true);
        setActiveTab('notebook'); // Switch to notebook tab to see the magic
        addLog('Generating smart notes from conversation...', 'info');

        const notes = await generateSmartNotes(chatHistory);
        
        // Append to existing notes with a separator
        const dateHeader = `\n\n## Session Notes - ${new Date().toLocaleTimeString()}\n`;
        setNotebookContent(prev => prev + dateHeader + notes);
        
        setIsGeneratingNotes(false);
        addLog('Smart notes generated.', 'success');
    };

    // Deprecated for now, but kept for interface compatibility
    const handleFrameCapture = (imageData: string) => {
        // No-op since we moved to chat-based analysis
    };

    // --- Workspace Recording Logic ---
    const handleToggleWorkspaceRecording = async () => {
        if (isWorkspaceRecording) {
            // Stop Recording
            if (workspaceRecorderRef.current && workspaceRecorderRef.current.state !== 'inactive') {
                workspaceRecorderRef.current.stop();
            }
            if (workspaceStreamRef.current) {
                workspaceStreamRef.current.getTracks().forEach(track => track.stop());
            }
            setIsWorkspaceRecording(false);
            addLog(t.workspace_rec_save, 'success');
        } else {
            // Start Recording
            try {
                // 1. Get Screen Stream (Video + System Audio)
                const displayStream = await navigator.mediaDevices.getDisplayMedia({ 
                    video: true, 
                    audio: true 
                });

                // 2. Try to get Mic Stream
                let micStream: MediaStream | null = null;
                try {
                    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                } catch (e) {
                    addLog(t.mic_error, 'warning');
                }

                // 3. Mix Audio if mic is available
                let finalStream = displayStream;
                if (micStream) {
                    const audioContext = new AudioContext();
                    const dest = audioContext.createMediaStreamDestination();

                    if (displayStream.getAudioTracks().length > 0) {
                         const sourceDisplay = audioContext.createMediaStreamSource(displayStream);
                         sourceDisplay.connect(dest);
                    }
                    
                    const sourceMic = audioContext.createMediaStreamSource(micStream);
                    sourceMic.connect(dest);

                    const mixedAudioTracks = dest.stream.getAudioTracks();
                    const videoTracks = displayStream.getVideoTracks();
                    
                    finalStream = new MediaStream([...videoTracks, ...mixedAudioTracks]);
                }

                // 4. Create Recorder
                const recorder = new MediaRecorder(finalStream);
                workspaceRecorderRef.current = recorder;
                workspaceStreamRef.current = finalStream; // keep ref to stop tracks later

                const chunks: Blob[] = [];
                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) chunks.push(e.data);
                };

                recorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `workspace-recording-${new Date().toISOString()}.webm`;
                    a.click();
                    URL.revokeObjectURL(url);
                    
                    // Cleanup tracks
                    if (workspaceStreamRef.current) {
                        workspaceStreamRef.current.getTracks().forEach(track => track.stop());
                    }
                    if (micStream) {
                        micStream.getTracks().forEach(track => track.stop());
                    }
                };

                // Handle if user clicks "Stop Sharing" on the browser UI
                displayStream.getVideoTracks()[0].onended = () => {
                     if (workspaceRecorderRef.current && workspaceRecorderRef.current.state === 'recording') {
                         handleToggleWorkspaceRecording(); // Stop app state
                     }
                };

                recorder.start();
                setIsWorkspaceRecording(true);
                addLog(t.workspace_rec_start, 'info');

            } catch (error) {
                console.error("Recording error:", error);
                addLog(t.rec_error, 'error');
            }
        }
    };

    return (
        <div className="relative h-screen w-full transition-colors duration-500 font-sans selection:bg-primary-500/30 selection:text-white bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text overflow-hidden">
            
            <ModelSettingsModal 
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                language={language}
                configs={modelConfigs}
                activeConfigId={activeConfigId}
                onSaveConfigs={handleSaveConfigs}
            />

            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary-600/10 dark:bg-primary-600/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-40 animate-blob"></div>
                <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-accent-500/10 dark:bg-accent-500/20 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-blue-400/10 dark:bg-blue-600/10 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[120px] opacity-30 animate-blob animation-delay-4000"></div>
                {/* Noise Texture */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 dark:opacity-20 brightness-100 contrast-150"></div>
            </div>

            {/* Main Layout Container */}
            <div className="relative z-10 flex flex-col h-full max-w-[1920px] mx-auto">
                
                {/* Header - Z-Index 30: Interactive but below Phone Stage */}
                <header className="h-20 flex items-center justify-between px-8 py-4 shrink-0 relative z-30">
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000"></div>
                            <div className="relative w-10 h-10 bg-white dark:bg-black rounded-xl flex items-center justify-center border border-gray-200 dark:border-white/10 shadow-lg">
                                <Cast className="w-5 h-5 text-primary-600 dark:text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-white dark:to-gray-400">
                                {t.appTitle}
                            </h1>
                            <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">{t.edition}</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {/* Status Chip */}
                        {connectionState === ConnectionState.CONNECTED && (
                            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-white/50 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/5 backdrop-blur-sm shadow-sm">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{deviceName}</span>
                            </div>
                        )}

                        {/* Workspace Record Button */}
                        <button
                            onClick={handleToggleWorkspaceRecording}
                            className={`flex items-center gap-2 px-3 py-2 rounded-full border transition-all duration-300 ${
                                isWorkspaceRecording 
                                ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' 
                                : 'bg-gray-100 dark:bg-white/5 border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10'
                            }`}
                            title={isWorkspaceRecording ? t.stop_recording : t.record_workspace}
                        >
                            {isWorkspaceRecording ? <StopCircle className="w-4 h-4" /> : <Disc className="w-4 h-4" />}
                            <span className="text-xs font-semibold hidden md:inline">
                                {isWorkspaceRecording ? 'REC' : t.record_workspace}
                            </span>
                        </button>

                        {/* Settings Group */}
                        <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full backdrop-blur-sm">
                            <button 
                                onClick={() => setIsSettingsOpen(true)}
                                className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/10 hover:text-primary-600 dark:hover:text-white transition-all shadow-none hover:shadow-sm"
                                title={t.settings}
                            >
                                <Settings className="w-4 h-4" />
                            </button>
                            <div className="w-px h-4 bg-gray-300 dark:bg-white/10 mx-1"></div>
                            <button 
                                onClick={toggleTheme}
                                className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/10 hover:text-primary-600 dark:hover:text-white transition-all shadow-none hover:shadow-sm"
                            >
                                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                            </button>
                            <button 
                                onClick={toggleLanguage}
                                className="p-2 rounded-full text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-white/10 hover:text-primary-600 dark:hover:text-white transition-all shadow-none hover:shadow-sm font-medium text-xs w-8 h-8 flex items-center justify-center"
                            >
                                {language === 'en' ? 'ZH' : 'EN'}
                            </button>
                        </div>
                        
                        {/* Connect Button */}
                        <button
                            onClick={handleConnect}
                            disabled={connectionState === ConnectionState.CONNECTED}
                            className={`relative px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 overflow-hidden shadow-lg ${
                                connectionState === ConnectionState.CONNECTED
                                    ? 'bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 cursor-default border border-gray-200 dark:border-white/5 shadow-none'
                                    : 'bg-primary-600 dark:bg-white text-white dark:text-black hover:scale-105 hover:bg-primary-700 shadow-primary-500/30 dark:shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                {connectionState === ConnectionState.DISCONNECTED && <Zap className="w-4 h-4 fill-current" />}
                                {connectionState === ConnectionState.CONNECTED ? t.active : t.connect}
                            </div>
                        </button>
                    </div>
                </header>

                {/* Content Grid - No overflow hidden on main to allow phone drag */}
                <main className="flex-1 p-6 pt-2 pb-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
                    
                    {/* Left: AI Intelligence (3 cols) - Z-Index 20 */}
                    <div className="lg:col-span-3 h-full min-h-0 flex flex-col z-20">
                        <div className="glass-panel rounded-3xl h-full overflow-hidden flex flex-col transition-all duration-500">
                            <AiPanel 
                                language={language}
                                chatHistory={chatHistory}
                                onSendMessage={handleSendMessage}
                                onGenerateNotes={handleGenerateNotes}
                                isGeneratingNotes={isGeneratingNotes}
                            />
                        </div>
                    </div>

                    {/* Center: Device Stage (6 cols) - Z-Index 50 (TOP MOST) */}
                    <div className="lg:col-span-6 h-full min-h-0 relative flex flex-col z-50">
                        <div className="flex-1 flex items-center justify-center relative">
                            <PhoneDisplay 
                                connectionState={connectionState} 
                                onFrameCapture={handleFrameCapture}
                                isAnalyzing={false} // No longer using static visual analysis state
                                language={language}
                                onLog={addLog}
                            />
                        </div>
                    </div>

                    {/* Right: Tools & Logs (3 cols) - Z-Index 20 */}
                    <div className="lg:col-span-3 h-full min-h-0 flex flex-col z-20">
                        <div className="glass-panel-heavy rounded-3xl h-full overflow-hidden flex flex-col shadow-xl transition-all duration-500">
                            
                            {/* Tabs Header */}
                            <div className="flex items-center border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-transparent overflow-x-auto scrollbar-none">
                                <button
                                    onClick={() => setActiveTab('activity')}
                                    className={`flex-1 min-w-[80px] flex items-center justify-center gap-1.5 py-4 text-xs font-medium transition-colors relative
                                        ${activeTab === 'activity' 
                                            ? 'text-primary-600 dark:text-white' 
                                            : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    <Activity className="w-3.5 h-3.5" />
                                    <span>{t.system_activity}</span>
                                    {activeTab === 'activity' && (
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-white rounded-t-full"></div>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('network')}
                                    className={`flex-1 min-w-[80px] flex items-center justify-center gap-1.5 py-4 text-xs font-medium transition-colors relative
                                        ${activeTab === 'network' 
                                            ? 'text-primary-600 dark:text-white' 
                                            : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    <Network className="w-3.5 h-3.5" />
                                    <span>{t.network}</span>
                                    {activeTab === 'network' && (
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-white rounded-t-full"></div>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('logcat')}
                                    className={`flex-1 min-w-[80px] flex items-center justify-center gap-1.5 py-4 text-xs font-medium transition-colors relative
                                        ${activeTab === 'logcat' 
                                            ? 'text-primary-600 dark:text-white' 
                                            : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    <FileCode className="w-3.5 h-3.5" />
                                    <span>Logcat</span>
                                    {activeTab === 'logcat' && (
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-white rounded-t-full"></div>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab('notebook')}
                                    className={`flex-1 min-w-[80px] flex items-center justify-center gap-1.5 py-4 text-xs font-medium transition-colors relative
                                        ${activeTab === 'notebook' 
                                            ? 'text-primary-600 dark:text-white' 
                                            : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    <BookOpen className="w-3.5 h-3.5" />
                                    <span>{t.notebook}</span>
                                    {activeTab === 'notebook' && (
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-600 dark:bg-white rounded-t-full"></div>
                                    )}
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 min-h-0 bg-white/40 dark:bg-transparent relative">
                                {activeTab === 'activity' && (
                                    <TerminalLog logs={logs} language={language} />
                                )}
                                {activeTab === 'network' && (
                                    <NetworkPanel 
                                        language={language}
                                        requests={networkRequests}
                                        onClear={() => setNetworkRequests([])}
                                    />
                                )}
                                {activeTab === 'logcat' && (
                                    <LogcatPanel 
                                        language={language}
                                        logs={logcatLogs}
                                        onClear={() => setLogcatLogs([])}
                                        targetPackage={targetPackage}
                                        onTargetPackageChange={setTargetPackage}
                                    />
                                )}
                                {activeTab === 'notebook' && (
                                    <Notebook 
                                        language={language}
                                        content={notebookContent}
                                        onChange={setNotebookContent}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;