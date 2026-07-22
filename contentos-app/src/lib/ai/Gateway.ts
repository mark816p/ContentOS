export type AiTarget = 'cloud' | 'local' | 'mcp';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Gateway class responsible for routing messages to the appropriate AI backend.
 * Supports Local Engines, Cloud APIs, and Model Context Protocol (MCP) servers.
 */
export class Gateway {
  private target: AiTarget;

  constructor(target: AiTarget = 'cloud') {
    this.target = target;
  }

  setTarget(target: AiTarget) {
    this.target = target;
  }

  /**
   * Routes the message payload to the configured AI target and returns a response stream or string.
   * @param messages Array of chat messages
   * @returns A ReadableStream (for SSE) or a raw string response.
   */
  async execute(messages: Message[]): Promise<ReadableStream | string> {
    switch (this.target) {
      case 'local':
        return this.executeLocal(messages);
      case 'mcp':
        return this.executeMCP(messages);
      case 'cloud':
      default:
        return this.executeCloud(messages);
    }
  }

  private async executeLocal(messages: Message[]): Promise<ReadableStream> {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'default',
        messages,
        stream: true,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Local engine request failed: ${response.statusText}`);
    }
    
    return response.body as ReadableStream;
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  private async executeCloud(_messages: Message[]): Promise<string> {
    return "Cloud API response (mocked)";
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  private async executeMCP(_messages: Message[]): Promise<string> {
    // MCP client call to local /api/mcp endpoint
    return "MCP execution result (mocked)";
  }
}
