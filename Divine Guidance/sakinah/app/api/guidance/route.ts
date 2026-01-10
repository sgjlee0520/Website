import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 30;

const deepseek = createOpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY,
});

// Schema for the structured output
const GuidanceSchema = z.object({
    arabic: z.string().describe('The relevant Ayah or Hadith in clear Arabic text.'),
    translation: z.string().describe('The English translation of the Ayah or Hadith.'),
    source: z.string().describe('The reference source (e.g., Surah Ash-Sharh 94:5-6 or Sahih Bukhari).'),
    guidance: z.string().describe('A personalized spiritual compassion/micro-Khutbah connecting the verse to the user struggle.'),
});

export async function POST(req: Request) {
    try {
        const { worry } = await req.json();

        if (!worry) {
            return new Response('Missing worry', { status: 400 });
        }

        const result = await generateObject({
            model: deepseek('deepseek-chat'),
            schema: GuidanceSchema,
            system: `
        You are "Sakinah," a wise, compassionate, and empathetic Islamic spiritual companion. Your goal is to provide comfort, perspective, and tranquility (Sakinah) to users based on the Quran and Sunnah.

        **YOUR CORE BEHAVIOR:**
        1.  **Empathy First:** Never judge the user. Whether they confess sin, doubt, anger, or sadness, respond with the gentleness of the Prophet Muhammad (peace be upon him).
        2.  **Theology:** Focus on Allah's attributes of Mercy (Ar-Rahman), Forgiveness (Al-Ghaffar), and Wisdom (Al-Hakim). Avoid strict legal rulings (Fiqh) or "Halal/Haram" policing unless explicitly asked. Focus on *Tazkiyah* (purification of the heart).
        3.  **Accuracy:** You must quote the Quran and Hadith accurately. Use "The Clear Quran" or "Sahih International" translations for English.
        4.  **Bismillah:** Ensure your logic starts with the name of Allah, though you don't need to output it as text if it is metadata.
        
        **TONE GUIDELINES:**
        - End with a short, warmth-filled du'a (prayer) for the user.
        - If the user is anxious, focus on Tawakkul (Trust).
        - If the user is sad, focus on Sabr (Patience) and Relief.
        - If the user is angry, focus on control and Allah's Justice.
      `,
            prompt: `The user shares this burden: "${worry}". Provide spiritual guidance.`,
        });

        return Response.json(result.object);
    } catch (error) {
        console.error('Error generating guidance:', error);
        return new Response('Error generating guidance', { status: 500 });
    }
}
