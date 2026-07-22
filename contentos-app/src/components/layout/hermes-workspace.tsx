'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, X, Cpu, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

// Mock File Tree component for the sidebar
const FileTree = ({ items }: { items: { sourceText: string }[] }) => (
  <div className="text-sm font-medium">
    {items.map((item, i) => (
      <div key={i} className="flex items-center gap-2 py-2 px-3 hover:bg-neutral-800 rounded-md cursor-pointer text-neutral-300">
        <MessageSquare size={14} className="text-neutral-500" />
        <span className="truncate">{item.sourceText.substring(0, 30) || 'New Conversation'}...</span>
      </div>
    ))}
  </div>
);

export default function ClaudeWorkspace() {
  const { aiTarget, setAiTarget, leftPanelOpen, toggleLeftPanel, contextTokens, setContextTokens } = useAppStore();
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'assistant', content: 'Hello! I am ContentOS Engine. How can I assist you today?' }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [contentItems, setContentItems] = useState<{ sourceText: string }[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('/api/mcp', { method: 'POST', body: JSON.stringify({ action: 'list_items' }) });
        const data = await response.json();
        if (data.items) setContentItems(data.items);
      } catch (e) {
        console.error(e);
      }
    };
    fetchItems();
  }, []);

  useEffect(() => {
    scrollToBottom();
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
      
      const refreshResponse = await fetch('/api/mcp', { method: 'POST', body: JSON.stringify({ action: 'list_items' }) });
      const refreshData = await refreshResponse.json();
      if (refreshData.items) setContentItems(refreshData.items);
      
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error generating response.' }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex h-screen bg-[#111111] text-[#ECECEC] font-sans overflow-hidden">
      
      {/* Left Sidebar (Conversations / History) */}
      <div 
        className={`fixed md:relative z-20 flex-shrink-0 bg-[#161616] border-r border-[#262626] h-full transition-all duration-300 ease-in-out ${leftPanelOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0 md:w-0 overflow-hidden'}`}
      >
        <div className="w-64 h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-[#262626]">
            <span className="font-semibold text-sm tracking-wide">Chats</span>
            <button onClick={toggleLeftPanel} className="text-neutral-400 hover:text-white md:hidden">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
             <FileTree items={contentItems} />
          </div>
          <div className="p-4 border-t border-[#262626] text-xs text-neutral-500 flex justify-between items-center">
            <span>Ctx: {contextTokens}</span>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> Online</div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative w-full">
        
        {/* Header */}
        <header className="flex items-center justify-between p-4 z-10 absolute top-0 w-full">
          <div className="flex items-center gap-2">
            <button onClick={toggleLeftPanel} className="p-2 rounded-md text-neutral-400 hover:bg-[#262626] hover:text-white transition-colors">
              {leftPanelOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
            </button>
            <h1 className="font-semibold tracking-tight text-lg hidden md:block">ContentOS</h1>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={aiTarget} 
              onChange={(e) => setAiTarget(e.target.value as 'cloud' | 'ollama' | 'mcp')}
              className="bg-[#262626] border-none text-sm rounded-md px-3 py-1.5 focus:ring-1 focus:ring-neutral-500 text-neutral-200 outline-none"
            >
              <option value="cloud">Cloud (OpenRouter)</option>
              <option value="ollama">Local (Ollama)</option>
              <option value="mcp">MCP</option>
            </select>
          </div>
        </header>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto pt-20 pb-32 px-4 scroll-smooth">
          <div className="max-w-3xl mx-auto flex flex-col gap-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role !== 'user' && (
                  <div className="w-8 h-8 rounded-md bg-[#262626] flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <Cpu size={16} className="text-neutral-400" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                  msg.role === 'user' 
                    ? 'bg-[#262626] text-white rounded-br-sm' 
                    : 'bg-transparent text-neutral-200 text-[15px] leading-relaxed prose prose-invert max-w-none'
                }`}>
                  {msg.content.split('\n').map((line, j) => (
                    <React.Fragment key={j}>
                      {line}
                      {j !== msg.content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="w-8 h-8 rounded-md bg-[#262626] flex items-center justify-center mr-3 flex-shrink-0">
                  <Cpu size={16} className="text-neutral-400" />
                </div>
                <div className="px-5 py-3 text-neutral-500">Thinking...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-[#111111] via-[#111111] to-transparent pt-10 pb-6 px-4">
          <div className="max-w-3xl mx-auto relative">
            <div className="bg-[#202020] border border-[#333333] rounded-2xl flex items-end p-2 shadow-xl focus-within:border-[#555555] transition-colors">
              <textarea
                autoFocus
                className="flex-1 bg-transparent border-0 focus:ring-0 resize-none max-h-48 min-h-[44px] p-3 text-[15px] text-neutral-100 placeholder-neutral-500 outline-none"
                placeholder="Message ContentOS Engine..."
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = '44px';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                }}
                onKeyDown={handleKeyDown}
              />
              <button 
                onClick={handleSubmit}
                disabled={!input.trim() || isGenerating}
                className="p-2 mb-1 mr-1 rounded-xl bg-white text-black hover:bg-neutral-200 disabled:opacity-50 disabled:bg-[#333333] disabled:text-neutral-500 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="text-center text-[11px] text-neutral-500 mt-3">
              AI can make mistakes. Verify important information.
            </div>
          </div>
        </div>

      </div>
      
      {/* Overlay for mobile when sidebar is open */}
      {leftPanelOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={toggleLeftPanel}
        />
      )}
    </div>
  );
}
