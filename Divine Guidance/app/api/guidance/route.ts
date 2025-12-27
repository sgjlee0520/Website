import { NextResponse } from 'next/server';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const API_KEY = process.env.DEEPSEEK_API_KEY;

export async function POST(request: Request) {
    if (!API_KEY) {
        return NextResponse.json(
            { error: 'API key not configured' },
            { status: 500 }
        );
    }

    try {
        const { worry, type } = await request.json();

        if (!worry) {
            return NextResponse.json(
                { error: 'Worry is required' },
                { status: 400 }
            );
        }

        let systemPrompt = '';
        if (type === 'verse') {
            systemPrompt = `You are a biblical scholar and theologian. The user is worried about: "${worry}". Provide 1-3 comforting and relevant Bible verses (book, chapter, verse text) that directly address this worry. Format them clearly. Do not add commentary, just the verses.`;
        } else if (type === 'homily') {
            systemPrompt = `You are a wise and compassionate priest. The user is worried about: "${worry}". Write a short, comforting homily (approx 150-200 words) based on biblical teachings to offer solace and guidance. Be gentle, empathetic, and divine in tone.`;
        } else {
            return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
        }

        const response = await fetch(DEEPSEEK_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: 'deepseek-chat', // Using 'deepseek-chat' as alias for v3 usually, or check documentation. User said deepseek-v3.
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: worry } // Redundant if prompt includes worry, but good for context structure.
                    // Actually, I put worry in system prompt. I'll put it in user message as well or just general system prompt.
                    // Better: System: "You are a ...". User: "I am worried about: <worry>".
                ],
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('DeepSeek API Error:', errorText);
            return NextResponse.json({ error: `API Error: ${response.statusText}` }, { status: response.status });
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content || 'No guidance received.';

        return NextResponse.json({ content });

    } catch (error) {
        console.error('Server Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
