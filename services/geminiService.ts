
import { GoogleGenAI } from "@google/genai";

const getGeminiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY is not defined in environment variables");
    }
    return new GoogleGenAI({ apiKey });
};

// Kept for backward compatibility if needed, but primary focus is now chat
export const analyzeScreenContent = async (base64Image: string, promptText: string = "Analyze the UI on this screen."): Promise<string> => {
    try {
        const client = getGeminiClient();
        const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/png', data: cleanBase64 } },
                    { text: promptText + " \nProvide a concise analysis." }
                ]
            },
        });
        return response.text || "No analysis available.";
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return "Failed to analyze screen.";
    }
};

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export const askGeminiChat = async (history: ChatMessage[], newMessage: string): Promise<string> => {
    try {
        const client = getGeminiClient();
        
        // Convert internal history format to API format
        const contents = history.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

        // Add the new message
        contents.push({
            role: 'user',
            parts: [{ text: newMessage }]
        });

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: contents,
            config: {
                temperature: 0.7,
            }
        });
        return response.text || "I couldn't generate a response.";
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        return "Chat service currently unavailable. Please check API Key.";
    }
};

export const generateSmartNotes = async (history: ChatMessage[]): Promise<string> => {
    try {
        const client = getGeminiClient();
        const prompt = "Based on the following conversation, generate a concise, structured engineering notebook entry in Markdown format. Use bullet points, bold headers, and action items. Do not include pleasantries, just the technical notes.";
        
        const context = history.map(msg => `${msg.role}: ${msg.text}`).join('\n');
        
        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Context:\n${context}\n\nTask: ${prompt}`,
        });
        
        return response.text || "";
    } catch (error) {
        console.error("Smart Notes Error:", error);
        return "Failed to generate notes.";
    }
};