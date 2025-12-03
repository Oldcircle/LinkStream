
import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Trash2, Settings2, Check } from 'lucide-react';
import { translations, Language } from '../utils/translations';
import { ModelConfig, DEFAULT_PROVIDERS, AiProviderId } from '../types';

interface ModelSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: Language;
    configs: ModelConfig[];
    activeConfigId: string;
    onSaveConfigs: (configs: ModelConfig[], activeId: string) => void;
}

export const ModelSettingsModal: React.FC<ModelSettingsModalProps> = ({
    isOpen,
    onClose,
    language,
    configs,
    activeConfigId,
    onSaveConfigs
}) => {
    const t = translations[language];
    const [localConfigs, setLocalConfigs] = useState<ModelConfig[]>([]);
    const [selectedConfigId, setSelectedConfigId] = useState<string>('');
    const [isDirty, setIsDirty] = useState(false);

    // Sync props to state when modal opens
    useEffect(() => {
        if (isOpen) {
            setLocalConfigs(JSON.parse(JSON.stringify(configs)));
            setSelectedConfigId(activeConfigId);
            setIsDirty(false);
        }
    }, [isOpen, configs, activeConfigId]);

    if (!isOpen) return null;

    const activeConfig = localConfigs.find(c => c.id === selectedConfigId) || localConfigs[0];

    const handleAddConfig = () => {
        const newConfig: ModelConfig = {
            id: Date.now().toString(),
            name: 'New Config',
            provider: 'openai',
            apiKey: '',
            baseUrl: '',
            model: 'gpt-4o'
        };
        setLocalConfigs([...localConfigs, newConfig]);
        setSelectedConfigId(newConfig.id);
        setIsDirty(true);
    };

    const handleDeleteConfig = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (localConfigs.length <= 1) return; // Prevent deleting last config
        if (window.confirm(t.confirm_delete)) {
            const newConfigs = localConfigs.filter(c => c.id !== id);
            setLocalConfigs(newConfigs);
            if (id === selectedConfigId) {
                setSelectedConfigId(newConfigs[0].id);
            }
            setIsDirty(true);
        }
    };

    const updateConfig = (key: keyof ModelConfig, value: string) => {
        if (!activeConfig) return;
        
        const updatedConfigs = localConfigs.map(c => {
            if (c.id === activeConfig.id) {
                const newConfig = { ...c, [key]: value };
                // Auto-fill defaults if provider changes
                if (key === 'provider') {
                    const providerData = DEFAULT_PROVIDERS.find(p => p.id === value);
                    if (providerData) {
                        newConfig.baseUrl = providerData.defaultUrl;
                        newConfig.model = providerData.defaultModel;
                    }
                }
                return newConfig;
            }
            return c;
        });
        setLocalConfigs(updatedConfigs);
        setIsDirty(true);
    };

    const handleSave = () => {
        onSaveConfigs(localConfigs, selectedConfigId);
        onClose();
    };

    // Helper to get provider name
    const getProviderName = (id: string) => DEFAULT_PROVIDERS.find(p => p.id === id)?.name || id;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl bg-white dark:bg-[#18181b] rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-gray-200 dark:border-white/10 max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
                
                {/* Left Sidebar: Config List */}
                <div className="w-full md:w-1/3 bg-gray-50/50 dark:bg-black/20 border-b md:border-b-0 md:border-r border-gray-200 dark:border-white/10 flex flex-col">
                    <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-gray-100/50 dark:bg-white/5">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Settings2 className="w-4 h-4" />
                            {t.config_list}
                        </h3>
                        <button 
                            onClick={handleAddConfig}
                            className="p-1.5 rounded-lg bg-white dark:bg-white/10 hover:bg-primary-50 dark:hover:bg-primary-900/30 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 border border-gray-200 dark:border-white/5 shadow-sm transition-all"
                            title={t.add_config}
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {localConfigs.map(config => (
                            <div 
                                key={config.id}
                                onClick={() => setSelectedConfigId(config.id)}
                                className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                                    selectedConfigId === config.id
                                        ? 'bg-white dark:bg-white/10 border-primary-200 dark:border-primary-500/50 shadow-md ring-1 ring-primary-500/20'
                                        : 'hover:bg-gray-100 dark:hover:bg-white/5 border-transparent'
                                }`}
                            >
                                <div className="flex flex-col min-w-0">
                                    <div className="flex items-center gap-2">
                                        {/* Active Indicator */}
                                        <div className={`w-1 h-4 rounded-full ${selectedConfigId === config.id ? 'bg-primary-500' : 'bg-gray-300 dark:bg-white/10'}`}></div>
                                        <span className={`font-medium truncate text-sm ${selectedConfigId === config.id ? 'text-primary-700 dark:text-white' : 'text-gray-700 dark:text-gray-400'}`}>
                                            {config.name}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-3 truncate">
                                        {getProviderName(config.provider)}
                                    </span>
                                </div>
                                {localConfigs.length > 1 && (
                                    <button
                                        onClick={(e) => handleDeleteConfig(config.id, e)}
                                        className={`p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all ${selectedConfigId === config.id ? 'opacity-100' : ''}`}
                                        title={t.delete_config}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Content: Config Form */}
                <div className="flex-1 flex flex-col bg-white dark:bg-[#18181b]">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
                             <Settings2 className="w-5 h-5 animate-spin-slow" />
                             <h2 className="font-semibold text-lg text-gray-900 dark:text-white">{t.config_ai_model}</h2>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form Fields */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {activeConfig ? (
                            <>
                                {/* Config Name */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">
                                        {t.config_name}
                                    </label>
                                    <input
                                        type="text"
                                        value={activeConfig.name}
                                        onChange={(e) => updateConfig('name', e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-gray-900 dark:text-white transition-all"
                                    />
                                </div>

                                {/* Provider */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">
                                        {t.provider}
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={activeConfig.provider}
                                            onChange={(e) => updateConfig('provider', e.target.value as AiProviderId)}
                                            className="w-full appearance-none px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-gray-900 dark:text-white transition-all pr-10"
                                        >
                                            {DEFAULT_PROVIDERS.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-3 pointer-events-none text-gray-500">
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                                        </div>
                                    </div>
                                </div>

                                {/* API Key */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">
                                        {t.api_key}
                                    </label>
                                    <input
                                        type="password"
                                        value={activeConfig.apiKey}
                                        onChange={(e) => updateConfig('apiKey', e.target.value)}
                                        placeholder={t.api_key_placeholder}
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 font-mono text-sm transition-all"
                                    />
                                    <p className="text-[10px] text-gray-400 dark:text-gray-500 ml-1">
                                        {t.api_key_placeholder}
                                    </p>
                                </div>

                                {/* Base URL */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">
                                        {t.base_url}
                                    </label>
                                    <input
                                        type="text"
                                        value={activeConfig.baseUrl}
                                        onChange={(e) => updateConfig('baseUrl', e.target.value)}
                                        placeholder={DEFAULT_PROVIDERS.find(p => p.id === activeConfig.provider)?.defaultUrl || "https://api.example.com/v1"}
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 font-mono text-sm transition-all"
                                    />
                                </div>

                                {/* Model Name */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide ml-1">
                                        {t.model_name}
                                    </label>
                                    <input
                                        type="text"
                                        value={activeConfig.model}
                                        onChange={(e) => updateConfig('model', e.target.value)}
                                        placeholder={DEFAULT_PROVIDERS.find(p => p.id === activeConfig.provider)?.defaultModel}
                                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 font-mono text-sm transition-all"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <p>Select a configuration to edit</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200 dark:border-white/10 flex justify-end gap-3 bg-gray-50/50 dark:bg-white/[0.02]">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-white/10 transition-colors border border-transparent"
                        >
                            {t.cancel}
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2.5 rounded-xl bg-[#09090b] dark:bg-white text-white dark:text-[#09090b] font-semibold hover:opacity-90 transition-all shadow-lg flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {t.save_close}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
