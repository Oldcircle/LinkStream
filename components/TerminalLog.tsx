import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Activity, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { translations, Language } from '../utils/translations';

interface TerminalLogProps {
    logs: LogEntry[];
    language: Language;
}

export const TerminalLog: React.FC<TerminalLogProps> = ({ logs, language }) => {
    const t = translations[language];
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    return (
        <div className="flex flex-col h-full bg-transparent">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pr-2">
                {logs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-400 dark:text-gray-600 gap-2">
                        <Activity className="w-5 h-5 opacity-40 dark:opacity-20" />
                        <span className="text-xs">{t.no_activity}</span>
                    </div>
                )}
                
                {logs.map((log) => (
                    <div key={log.id} className="relative pl-6 group">
                        {/* Timeline Line */}
                        <div className="absolute left-2 top-2 bottom-[-16px] w-[1px] bg-gray-200 dark:bg-white/5 group-last:bottom-2"></div>
                        
                        {/* Dot Indicator */}
                        <div className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#09090b] shadow-sm flex items-center justify-center ${
                            log.type === 'error' ? 'bg-red-500' :
                            log.type === 'success' ? 'bg-green-500' :
                            log.type === 'warning' ? 'bg-yellow-500' :
                            'bg-gray-400 dark:bg-gray-600'
                        }`}>
                            {log.type === 'success' && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                            {log.type === 'error' && <AlertCircle className="w-2.5 h-2.5 text-white" />}
                        </div>

                        {/* Content */}
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-xs font-medium ${
                                    log.type === 'error' ? 'text-red-500 dark:text-red-400' :
                                    log.type === 'success' ? 'text-green-600 dark:text-green-400' :
                                    log.type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                                    'text-gray-700 dark:text-white'
                                }`}>
                                    {log.type === 'info' ? t.system_info : log.type.charAt(0).toUpperCase() + log.type.slice(1)}
                                </span>
                                <span className="text-[10px] text-gray-400 dark:text-gray-600 flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" />
                                    {log.timestamp.toLocaleTimeString([], {hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-mono">
                                {log.message}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
};
