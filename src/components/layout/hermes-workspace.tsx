"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Search, Monitor, Code, Settings, Server, Database, PanelLeftClose, PanelLeftOpen, Terminal, Send, Loader2, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getSystemStatus, getContentItems, getAgentFiles } from '@/app/actions';

type SystemStatus = { ollama: boolean; mcp: boolean; sqlite: boolean };
type AgentFiles = { soul: string; memory: string };

export default function HermesWorkspace() {
  const { theme, setTheme } = useTheme();
  const { aiTarget, setAiTarget, leftPanelOpen, toggleLeftPanel, contextTokens, setContextTokens } = useAppStore();
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [status, setStatus] = useState<SystemStatus>({ ollama: false, mcp: false, sqlite: false });
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [agentFiles, setAgentFiles] = useState<AgentFiles>({ soul: '', memory: '' });
  const [activeRightTab, setActiveRightTab] = useState<'preview' | 'files' | 'logs'>('preview');

  useEffect(() => {
    async function loadInitialData() {
      const [sysStatus, items, files] = await Promise.all([
        getSystemStatus(),
        getContentItems(),
        getAgentFiles()
      ]);
      setStatus(sysStatus);
      setContentItems(items);
      setAgentFiles(files);
    }
    loadInitialData();
    const interval = setInterval(async () => {
      setStatus(await getSystemStatus());
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const themes = [
    { id: 'default-hermes', name: 'Hermes Gold' },
    { id: 'slate-dev', name: 'Slate Dev' },
    { id: 'ares-red', name: 'Ares Red' },
    { id: 'poseidon-ocean', name: 'Poseidon Ocean' },
    { id: 'mono-minimal', name: 'Mono Minimal' },
    { id: 'warm-parchment', name: 'Warm Parchment' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    // Update token count (mock calculation: chars / 4)
    const tokenCount = messages.reduce((acc, m) => acc + m.content.length, 0) / 4;
    setContextTokens(Math.max(4096, 4096 + Math.floor(tokenCount)));
  }, [messages, isGenerating, setContextTokens]);

  const handleSubmit = async () => {
    if (!input.trim() || isGenerating) return;
    
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, target: aiTarget }),
      });

      if (!response.ok) throw new Error('Request failed');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response || data.message || 'Received response.' }]);
      
      // Auto-refresh file tree
      const updatedItems = await getContentItems();
      setContentItems(updatedItems);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error generating response.' }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const StatusIndicator = ({ online }: { online: boolean }) => (
    online ? 
      <span className="text-green-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online</span> :
      <span className="text-red-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Offline</span>
  );

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground transition-colors duration-300">
      <div className={`${leftPanelOpen ? 'w-64' : 'w-16'} flex flex-col border-r border-border transition-all duration-300 bg-background/50 backdrop-blur shrink-0`}>
        <div className="p-4 flex items-center justify-between border-b border-border">
          {leftPanelOpen && <div className="font-bold text-accent tracking-widest uppercase text-xs">Hermes</div>}
          <button onClick={toggleLeftPanel} className="p-1 hover:bg-border/50 rounded text-foreground/70">
            {leftPanelOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
        </div>
        
        {leftPanelOpen && (
          <>
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-foreground/50" />
                <input 
                  type="text" 
                  placeholder="FTS5 Search..." 
                  className="w-full bg-background border border-border rounded px-8 py-2 text-sm focus:outline-none focus:border-accent"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
              <div>
                <h3 className="text-xs font-semibold text-foreground/50 mb-2 uppercase tracking-wider">File Tree</h3>
                <ul className="space-y-1">
                  <li className="cursor-pointer hover:text-accent flex items-center gap-2"><span className="text-accent/50">▶</span> [Idea Inbox]</li>
                  <li className="cursor-pointer hover:text-accent flex items-center gap-2"><span className="text-accent/50">▶</span> [Drafts]</li>
                  <li className="cursor-pointer hover:text-accent flex items-center gap-2"><span className="text-accent/50">▶</span> [Scheduled]</li>
                  <li className="cursor-pointer hover:text-accent flex items-center gap-2"><span className="text-accent/50">▶</span> [Published]</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-foreground/50 mb-2 uppercase tracking-wider">Recent Documents</h3>
                <ul className="space-y-1 text-xs">
                  {contentItems.length === 0 ? (
                    <li className="text-foreground/40 italic">No content found</li>
                  ) : (
                    contentItems.map(item => (
                      <li key={item.id} className="truncate cursor-pointer hover:text-accent flex items-center gap-2">
                        <FileText size={12} /> {item.id.slice(0, 8)} - {item.type}
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            <div className="p-4 border-t border-border bg-background/80">
              <h3 className="text-xs font-semibold text-foreground/50 mb-2 uppercase tracking-wider">System Gateway</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1"><Server size={14}/> Ollama</span>
                  <StatusIndicator online={status.ollama} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1"><Terminal size={14}/> MCP Server</span>
                  <StatusIndicator online={status.mcp} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1"><Database size={14}/> SQLite</span>
                  <StatusIndicator online={status.sqlite} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex-1 flex flex-col h-full bg-background relative">
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur shrink-0">
          <div className="flex items-center gap-4">
            <select 
              value={aiTarget}
              onChange={(e) => setAiTarget(e.target.value as any)}
              className="bg-transparent border border-border rounded px-3 py-1.5 text-sm focus:outline-none focus:border-accent"
            >
              <option value="cloud">Cloud (OpenRouter / Anthropic)</option>
              <option value="ollama">Local (Ollama)</option>
              <option value="mcp">MCP Execute</option>
            </select>
            <span className="text-xs text-foreground/50 font-mono bg-border/30 px-2 py-1 rounded">
              Ctx: {contextTokens.toLocaleString()} / 128k
            </span>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="bg-transparent border border-border rounded px-3 py-1.5 text-sm focus:outline-none focus:border-accent"
            >
              {themes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-foreground/30 flex-col gap-4">
              <Monitor size={48} />
              <p>Initialize System. Awaiting Input.</p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] space-y-4 ${msg.role === 'user' ? 'bg-accent/10 border border-accent/20 rounded-lg p-4 text-sm' : 'pr-4'}`}>
                <div className="text-sm prose prose-invert max-w-none whitespace-pre-wrap">
                  {msg.content}
                </div>
                {msg.role === 'assistant' && idx === 0 && (
                  <details className="group border border-border/50 rounded bg-background/50">
                    <summary className="font-mono text-xs text-zinc-500 p-2 cursor-pointer select-none flex items-center gap-2 hover:text-zinc-300">
                      <Code size={12} />
                      <span>mcp_tool_execution [read_soul_md]</span>
                    </summary>
                    <div className="p-3 border-t border-border/50 font-mono text-xs text-zinc-400 bg-black/20 whitespace-pre-wrap">
                      {`{\n  "action": "read_file",\n  "target": "SOUL.md",\n  "result": "System Brand Voice constraints loaded."\n}`}
                    </div>
                  </details>
                )}
              </div>
            </div>
          ))}
          {isGenerating && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 text-accent/50">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs">Generating response...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-border bg-background/50 backdrop-blur shrink-0">
          <div className="relative flex items-center">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="Ask Hermes or reference files with @..." 
              className="w-full bg-background border border-border rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-accent resize-none min-h-[50px] max-h-[200px]"
              rows={1}
            />
            <button 
              onClick={handleSubmit}
              disabled={isGenerating || !input.trim()}
              className="absolute right-3 top-2.5 p-1.5 bg-accent text-background rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="w-80 border-l border-border bg-background/50 backdrop-blur flex flex-col shrink-0">
        <div className="flex border-b border-border">
          <button onClick={() => setActiveRightTab('preview')} className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider ${activeRightTab === 'preview' ? 'text-accent border-b-2 border-accent' : 'text-foreground/50 hover:text-foreground'}`}>Live Preview</button>
          <button onClick={() => setActiveRightTab('files')} className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider ${activeRightTab === 'files' ? 'text-accent border-b-2 border-accent' : 'text-foreground/50 hover:text-foreground'}`}>Files</button>
          <button onClick={() => setActiveRightTab('logs')} className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider ${activeRightTab === 'logs' ? 'text-accent border-b-2 border-accent' : 'text-foreground/50 hover:text-foreground'}`}>MCP Logs</button>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          {activeRightTab === 'preview' && (
            <div className="border border-border rounded-lg bg-background shadow-lg overflow-hidden">
              <div className="bg-border/30 px-3 py-2 text-xs font-mono text-foreground/70 flex items-center gap-2 border-b border-border">
                <Monitor size={14} /> Output Renderer
              </div>
              <div className="p-4 space-y-3">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20"></div>
                  <div>
                    <div className="font-bold text-sm">System Architect</div>
                    <div className="text-xs text-foreground/50">@hermes_sys</div>
                  </div>
                </div>
                <p className="text-sm">
                  Local-first AI is the future. By combining Ollama with MCP and Hermes 3-panel layout, we unlock zero-latency workflows.
                </p>
                <div className="text-accent text-xs">#LocalAI #Hermes #NextJS</div>
              </div>
            </div>
          )}

          {activeRightTab === 'files' && (
            <div className="space-y-4">
              <div className="border border-border rounded-lg bg-background shadow-lg overflow-hidden">
                <div className="bg-border/30 px-3 py-2 text-xs font-mono text-foreground/70 flex items-center gap-2 border-b border-border">
                  <FileText size={14} /> SOUL.md
                </div>
                <div className="p-4 text-xs font-mono text-foreground/80 whitespace-pre-wrap bg-background/50">
                  {agentFiles.soul || 'Loading SOUL.md...'}
                </div>
              </div>
              <div className="border border-border rounded-lg bg-background shadow-lg overflow-hidden">
                <div className="bg-border/30 px-3 py-2 text-xs font-mono text-foreground/70 flex items-center gap-2 border-b border-border">
                  <FileText size={14} /> MEMORY.md
                </div>
                <div className="p-4 text-xs font-mono text-foreground/80 whitespace-pre-wrap bg-background/50">
                  {agentFiles.memory || 'Loading MEMORY.md...'}
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'logs' && (
            <div className="border border-border rounded-lg bg-background shadow-lg overflow-hidden h-full flex flex-col">
              <div className="bg-border/30 px-3 py-2 text-xs font-mono text-foreground/70 flex items-center gap-2 border-b border-border shrink-0">
                <Terminal size={14} /> MCP Execution Trace
              </div>
              <div className="p-4 text-xs font-mono text-zinc-400 whitespace-pre-wrap bg-black/50 flex-1 overflow-y-auto">
                <div className="text-green-500">{'>'} MCP Server Listening on stdio...</div>
                <div className="text-zinc-500">{'>'} Client connected.</div>
                <div className="text-blue-400">{'>'} [req] mcp.tools.list</div>
                <div className="text-zinc-500">{'>'} [res] returned 14 tools.</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
