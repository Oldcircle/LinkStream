
import React, { useRef, useEffect, useState } from 'react';
import { translations, Language } from '../utils/translations';
import { LogcatEntry, LogLevel } from '../types';
import { Trash2, Filter, Search, Terminal } from 'lucide-react';

interface LogcatPanelProps {
    language: Language;
    logs: LogcatEntry[];
    onClear: () => void;
    targetPackage: string;
    onTargetPackageChange: (pkg: string) => void;
}

export const LogcatPanel: React.FC<LogcatPanelProps> = ({ 
    language, 
    logs, 
    onClear,
    targetPackage,
    onTargetPackageChange
}) => {
    const t = translations[language];
    const scrollRef = useRef<HTMLDivElement>(null);
    const [filterLevel, setFilterLevel] = useState<LogLevel | 'ALL'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    // Auto-scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    // Filtering Logic
    const filteredLogs = logs.filter(log => {
        // 1. Package Name Filter (if provided)
        if (targetPackage && log.packageName && !log.packageName.includes(targetPackage)) {
            return false;
        }

        // 2. Level Filter
        if (filterLevel !== 'ALL' && log.level !== filterLevel) {
            // Simple strict equality. In real adb, levels are inclusive (e.g. W includes E), 
            // but for simplicity here we do strict match or implementation could be changed to ordinal check.
            const levels = ['V', 'D', 'I', 'W', 'E'];
            const filterIdx = levels.indexOf(filterLevel);
            const logIdx = levels.indexOf(log.level);
            if (logIdx < filterIdx) return false;
        }

        // 3. Search Term
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            return log.message.toLowerCase().includes(lowerTerm) || log.tag.toLowerCase().includes(lowerTerm);
        }

        return true;
    });

    const getLevelStyle = (level: LogLevel) => {
        switch (level) {
            case 'V': return 'text-gray-400';
            case 'D': return 'text-blue-400';
            case 'I': return 'text-green-400';
            case 'W': return 'text-yellow-400';
            case 'E': return 'text-red-500 font-bold';
            default: return 'text-gray-400';
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent">
            {/* Controls */}
            <div className="flex flex-col gap-2 p-3 border-b border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.02]">
                
                {/* Package Filter */}
                <div className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-gray-400" />
                    <input 
                        type="text" 
                        value={targetPackage}
                        onChange={(e) => onTargetPackageChange(e.target.value)}
                        placeholder={t.package_placeholder}
                        className="flex-1 bg-transparent text-xs border-b border-gray-200 dark:border-white/10 focus:border-primary-500 outline-none py-1 text-gray-700 dark:text-gray-200 placeholder-gray-400"
                    />
                </div>

                {/* Level & Clear */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="w-3 h-3 text-gray-400" />
                        <select 
                            value={filterLevel}
                            onChange={(e) => setFilterLevel(e.target.value as LogLevel | 'ALL')}
                            className="bg-transparent text-[10px] font-medium text-gray-600 dark:text-gray-300 outline-none cursor-pointer"
                        >
                            <option value="ALL">Verbose+</option>
                            <option value="D">Debug+</option>
                            <option value="I">Info+</option>
                            <option value="W">Warning+</option>
                            <option value="E">Error</option>
                        </select>
                    </div>

                    <button 
                        onClick={onClear}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-md text-gray-400 hover:text-red-500 transition-colors"
                        title={t.clear}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Log Output */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 bg-[#1e1e1e] font-mono text-[11px] leading-tight scrollbar-thin">
                {filteredLogs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-2">
                        <Terminal className="w-6 h-6 opacity-20" />
                        <span className="opacity-50">{t.no_logs}</span>
                    </div>
                ) : (
                    filteredLogs.map((log) => (
                        <div key={log.id} className="flex gap-2 mb-1 hover:bg-white/5 px-1 py-0.5 rounded-sm break-all">
                            <span className="text-gray-500 shrink-0 w-16">
                                {log.timestamp.toLocaleTimeString([], { hour12: false, hour:'2-digit', minute:'2-digit', second:'2-digit', fractionDigits: 3 })}
                            </span>
                            <span className={`shrink-0 w-3 text-center ${getLevelStyle(log.level)}`}>
                                {log.level}
                            </span>
                            <span className="text-gray-400 shrink-0 w-24 truncate" title={log.tag}>
                                {log.tag}:
                            </span>
                            <span className={`flex-1 ${getLevelStyle(log.level)}`}>
                                {log.message}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
