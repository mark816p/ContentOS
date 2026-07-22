import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (body.action === 'list_items') {
      const items = await prisma.contentItem.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 20
      });
      return NextResponse.json({ items });
    }
    
    // Placeholder for other MCP (Model Context Protocol) server interaction
    return NextResponse.json({ 
      status: 'success', 
      message: 'MCP endpoint reached. Integration pending.',
      data: body 
    });
  } catch (error: unknown) {
    console.error('API MCP Error:', error);
    const err = error as Error;
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
