"use client";

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import { Search, Monitor, Code, Settings, Server, Database, PanelLeftClose, PanelLeftOpen, Terminal } from 'lucide-react';

export default function HermesWorkspace() {
  const { theme, setTheme } = useTheme();
  const [leftOpen, setLeftOpen] = useState(true);
  
  const themes = [
    { id: 'default-hermes', name: 'Hermes Gold' },
    { id: 'slate-dev', name: 'Slate Dev' },
    { id: 'ares-red', name: 'Ares Red' },
    { id: 'poseidon-ocean', name: 'Poseidon Ocean' },
    { id: 'mono-minimal', name: 'Mono Minimal' },
    { id: 'warm-parchment', name: 'Warm Parchment' },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* Panel 1: Left Navigation & Session Manager */}
      <div className={`${leftOpen ? 'w-64' : 'w-16'} flex flex-col border-r border-border transition-all duration-300 bg-background/50 backdrop-blur`}>
        <div className="p-4 flex items-center justify-between border-b border-border">
          {leftOpen && <div className="font-bold text-accent tracking-widest uppercase text-xs">Hermes</div>}
          <button onClick={() => setLeftOpen(!leftOpen)} className="p-1 hover:bg-border/50 rounded text-foreground/70">
            {leftOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
        </div>
        
        {leftOpen && (
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
            </div>

            <div className="p-4 border-t border-border bg-background/80">
              <h3 className="text-xs font-semibold text-foreground/50 mb-2 uppercase tracking-wider">System Gateway</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1"><Server size={14}/> Ollama</span>
                  <span className="text-green-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1"><Terminal size={14}/> MCP Server</span>
                  <span className="text-green-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1"><Database size={14}/> SQLite</span>
                  <span className="text-green-500 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Panel 2: Center Studio & Live Composer */}
      <div className="flex-1 flex flex-col h-full bg-background relative">
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur">
          <div className="flex items-center gap-4">
            <select className="bg-transparent border border-border rounded px-3 py-1.5 text-sm focus:outline-none focus:border-accent">
              <option value="cloud">Cloud (OpenRouter / Anthropic)</option>
              <option value="ollama">Local (Ollama)</option>
              <option value="mcp">MCP Execute</option>
            </select>
            <span className="text-xs text-foreground/50 font-mono bg-border/30 px-2 py-1 rounded">
              Ctx: 4,096 / 128k
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
          {/* Mock Chat Interface */}
          <div className="flex justify-end">
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 max-w-[80%] text-sm">
              <p>Generate a thread about local LLM orchestration using Hermes.</p>
            </div>
          </div>
          
          <div className="flex justify-start">
            <div className="pr-4 max-w-[80%] space-y-4">
              <div className="text-sm prose prose-invert max-w-none">
                <p>I will synthesize a comprehensive thread on local LLM orchestration leveraging the Hermes architecture.</p>
              </div>
              
              {/* Tool Trace Privacy */}
              <details className="group border border-border/50 rounded bg-background/50">
                <summary className="font-mono text-xs text-zinc-500 p-2 cursor-pointer select-none flex items-center gap-2 hover:text-zinc-300">
                  <Code size={12} />
                  <span>mcp_tool_execution [read_soul_md]</span>
                </summary>
                <div className="p-3 border-t border-border/50 font-mono text-xs text-zinc-400 bg-black/20 whitespace-pre-wrap">
                  {`{\n  "action": "read_file",\n  "target": "SOUL.md",\n  "result": "System Brand Voice constraints loaded."\n}`}
                </div>
              </details>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-background/50 backdrop-blur">
          <div className="relative">
            <textarea 
              placeholder="Ask Hermes or reference files with @..." 
              className="w-full bg-background border border-border rounded-lg pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-accent resize-none min-h-[60px]"
              rows={1}
            />
            <button className="absolute right-3 top-3 p-1 bg-accent text-background rounded hover:opacity-90">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Panel 3: Inspector & File Browser */}
      <div className="w-80 border-l border-border bg-background/50 backdrop-blur flex flex-col">
        <div className="flex border-b border-border">
          <button className="flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-accent border-b-2 border-accent">Live Preview</button>
          <button className="flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-foreground/50 hover:text-foreground">Files</button>
          <button className="flex-1 py-3 text-xs font-semibold uppercase tracking-wider text-foreground/50 hover:text-foreground">MCP Logs</button>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
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
        </div>
      </div>
    </div>
  );
}
