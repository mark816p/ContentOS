import { NextResponse } from 'next/server';
import { Gateway, AiTarget } from '@/lib/ai/Gateway';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { messages, target } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
    }

    // Extract the latest user message to save as an Idea in SQLite
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (lastUserMessage) {
      await prisma.contentItem.create({
        data: {
          type: 'idea',
          sourceText: lastUserMessage.content,
        }
      });
    }

    const gateway = new Gateway(target as AiTarget);
    const result = await gateway.execute(messages);

    if (result instanceof ReadableStream) {
      return new Response(result, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    return NextResponse.json({ response: result });
  } catch (error: unknown) {
    console.error('API Chat Error:', error);
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
