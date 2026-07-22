import { NextResponse } from 'next/server';
import { Gateway, AiTarget } from '@/lib/ai/Gateway';

export async function POST(req: Request) {
  try {
    const { messages, target } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages array' }, { status: 400 });
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
  } catch (error: any) {
    console.error('API Chat Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
