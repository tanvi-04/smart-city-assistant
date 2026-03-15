import { NextResponse } from 'next/server';
import { chatWithAssistant } from '@/lib/agent';

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();
        const response = await chatWithAssistant(message, history);
        return NextResponse.json(response);
    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
