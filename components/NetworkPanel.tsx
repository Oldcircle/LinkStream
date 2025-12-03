
import React, { useRef, useEffect } from 'react';
import { translations, Language } from '../utils/translations';
import { NetworkRequest } from '../types';
import { Trash2, Activity, Wifi } from 'lucide-react';

interface NetworkPanelProps {
    language: Language;
    requests: NetworkRequest[];
    onClear: () => void;
}

export const NetworkPanel: React.FC<NetworkPanelProps> = ({ language, requests, onClear }) => {
    const t = translations[language];
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [requests]);

    const getStatusColor = (status: number) => {
        if (status >= 200 && status < 300) return 'text-green-500';
        if (status >= 300 && status < 400) return 'text-blue-500';
        if (status >= 400 && status < 500) return 'text-yellow-500';
        if (status >= 500) return 'text-red-500';
        return 'text-gray-500';
    };

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'GET': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300';
            case 'POST': return 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300';
            case 'DELETE': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300';
            case 'PUT': return 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300';
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-2 px-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.02]">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                    <Wifi className="w-3.5 h-3.5" />
                    <span>{requests.length} Requests</span>
                </div>
                <button 
                    onClick={onClear}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md text-gray-400 hover:text-red-500 transition-colors"
                    title={t.clear}
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>

            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[10px] font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider border-b border-gray-100 dark:border-white/5">
                <div className="col-span-2">{t.method}</div>
                <div className="col-span-2">{t.status}</div>
                <div className="col-span-6">{t.url}</div>
                <div className="col-span-2 text-right">{t.duration}</div>
            </div>

            {/* List */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-0 scrollbar-thin">
                {requests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400 dark:text-gray-600 gap-2">
                        <Activity className="w-5 h-5 opacity-40 dark:opacity-20" />
                        <span className="text-xs">{t.no_requests}</span>
                    </div>
                ) : (
                    <div className="flex flex-col divide-y divide-gray-100 dark:divide-white/5">
                        {requests.map((req) => (
                            <div key={req.id} className="grid grid-cols-12 gap-2 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 items-center transition-colors cursor-pointer group">
                                {/* Method */}
                                <div className="col-span-2">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${getMethodColor(req.method)}`}>
                                        {req.method}
                                    </span>
                                </div>
                                
                                {/* Status */}
                                <div className={`col-span-2 text-xs font-mono font-medium ${getStatusColor(req.status)}`}>
                                    {req.status}
                                </div>
                                
                                {/* URL */}
                                <div className="col-span-6 flex flex-col min-w-0">
                                    <span className="text-xs text-gray-700 dark:text-gray-200 truncate font-medium" title={req.url}>
                                        {req.url.split('?')[0].split('/').pop() || '/'}
                                    </span>
                                    <span className="text-[10px] text-gray-400 truncate hidden group-hover:block" title={req.url}>
                                        {req.url}
                                    </span>
                                </div>
                                
                                {/* Time/Size */}
                                <div className="col-span-2 text-right flex flex-col">
                                    <span className="text-xs text-gray-600 dark:text-gray-400">{req.duration}ms</span>
                                    <span className="text-[10px] text-gray-400">{req.size}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
