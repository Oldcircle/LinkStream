

// WebUSB types are experimental and might not be fully available in all TS configurations
// We define basic shapes here for safety
export interface USBDevice {
    vendorId: number;
    productId: number;
    productName?: string;
    manufacturerName?: string;
    serialNumber?: string;
    opened: boolean;
    open(): Promise<void>;
    selectConfiguration(configurationValue: number): Promise<void>;
    claimInterface(interfaceNumber: number): Promise<void>;
}

export interface LogEntry {
    id: string;
    timestamp: Date;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

export enum ConnectionState {
    DISCONNECTED,
    CONNECTING,
    CONNECTED,
    ERROR
}

export interface AiResponse {
    text: string;
    suggestions?: string[];
}

export type AiProviderId = 'google' | 'openai' | 'deepseek' | 'anthropic' | 'ollama' | 'groq' | 'openrouter';

export interface ModelConfig {
    id: string;
    name: string;
    provider: AiProviderId;
    apiKey: string;
    baseUrl: string;
    model: string;
}

export const DEFAULT_PROVIDERS: { id: AiProviderId; name: string; defaultUrl: string; defaultModel: string }[] = [
    { id: 'google', name: 'Google Gemini', defaultUrl: '', defaultModel: 'gemini-2.5-flash' },
    { id: 'openai', name: 'OpenAI (GPT)', defaultUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4o' },
    { id: 'deepseek', name: 'DeepSeek', defaultUrl: 'https://api.deepseek.com', defaultModel: 'deepseek-chat' },
    { id: 'anthropic', name: 'Anthropic (Claude)', defaultUrl: 'https://api.anthropic.com/v1', defaultModel: 'claude-3-5-sonnet-20240620' },
    { id: 'ollama', name: 'Ollama (Local)', defaultUrl: 'http://localhost:11434/v1', defaultModel: 'llama3' },
    { id: 'groq', name: 'Groq', defaultUrl: 'https://api.groq.com/openai/v1', defaultModel: 'llama3-70b-8192' },
    { id: 'openrouter', name: 'OpenRouter', defaultUrl: 'https://openrouter.ai/api/v1', defaultModel: 'auto' },
];

// --- New Types for Network & Logcat ---

export interface NetworkRequest {
    id: string;
    timestamp: Date;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    url: string;
    status: number;
    duration: number; // ms
    size: string;
    type: string; // json, image, html etc
}

export type LogLevel = 'V' | 'D' | 'I' | 'W' | 'E';

export interface LogcatEntry {
    id: string;
    timestamp: Date;
    level: LogLevel;
    tag: string;
    pid: number;
    tid: number;
    message: string;
    packageName?: string;
}
