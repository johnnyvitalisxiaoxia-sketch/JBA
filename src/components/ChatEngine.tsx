import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Cpu, X, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from '@google/genai';
import { Player } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatEngineProps {
  players: Player[];
  gameMode: number;
  onClose: () => void;
}

export function ChatEngine({ players, gameMode, onClose }: ChatEngineProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'assistant',
      content: `系统已就绪。我已载入当前 **${players.length}** 名球员的完整数据，可以回答你关于阵容搭配、战术策略、球员分析等任何问题。`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildRosterContext = () => {
    return players.map(p =>
      `- ${p.name}: 控球组织 ${p.handling}/10, 投篮效率 ${p.shooting}/10, 防守影响 ${p.defense}/10, 篮板内线 ${p.rebounding}/10, 体能冲击 ${p.stamina}/10 (综合评分: ${p.handling + p.shooting + p.defense + p.rebounding + p.stamina}/50)`
    ).join('\n');
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const systemPrompt = `你是一位顶级的篮球战术分析师助手，专门为班级篮球赛（${gameMode}V${gameMode}模式）提供专业指导。

以下是当前球队的完整球员数据库：
${buildRosterContext()}

请根据以上球员数据，结合 ${gameMode}V${gameMode} 比赛规则和球员能力值，专业、深入地回答用户的问题。
- 语言要专业、热血、富有洞察力
- 使用Markdown格式排版，段落清晰
- 结合具体球员数据给出有针对性的建议
- 回答要简洁有力，突出重点`;

      const fullPrompt = `${systemPrompt}\n\n用户问题：${trimmed}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: fullPrompt,
      });

      const text = response.text ?? '抱歉，未能获取分析结果，请重试。';

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `系统错误：${error.message || '连接失败，请重试。'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#050505] flex flex-col"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/20 via-transparent to-blue-950/20 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 border-b border-cyan-500/20 px-6 py-4 flex justify-between items-center bg-black/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-wider">
              NEXUS <span className="text-cyan-400">对话引擎</span>
            </h2>
            <p className="text-[10px] text-cyan-500/60 font-mono tracking-widest uppercase">
              {players.length} Players Loaded · {gameMode}V{gameMode} Mode · gemini-3.1-pro-preview
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-500/10 transition-colors flex items-center gap-2 text-sm"
        >
          <X className="w-4 h-4" /> 退出对话
        </button>
      </div>

      {/* Roster strip */}
      <div className="relative z-10 bg-black/40 border-b border-cyan-500/10 px-6 py-2 flex gap-3 overflow-x-auto">
        {players.map(p => (
          <div
            key={p.id}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-cyan-500/5 border border-cyan-500/20 rounded-lg"
          >
            <span className="text-xs text-white font-medium">{p.name}</span>
            <span className="text-[10px] text-cyan-400 font-mono">
              {p.handling + p.shooting + p.defense + p.rebounding + p.stamina}
            </span>
          </div>
        ))}
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border ${
                msg.role === 'assistant'
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}>
                {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className={`max-w-2xl ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`rounded-2xl px-5 py-4 text-sm leading-relaxed ${
                  msg.role === 'assistant'
                    ? 'bg-black/50 border border-cyan-500/15 text-gray-200'
                    : 'bg-cyan-500/15 border border-cyan-500/30 text-white'
                }`}>
                  {msg.role === 'assistant' ? (
                    <div className="markdown-body prose-sm">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <span>{msg.content}</span>
                  )}
                </div>
                <span className="text-[10px] text-gray-600 font-mono px-1">
                  {msg.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4"
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border bg-cyan-500/10 border-cyan-500/30 text-cyan-400">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <Cpu className="w-4 h-4" />
              </motion.div>
            </div>
            <div className="bg-black/50 border border-cyan-500/15 rounded-2xl px-5 py-4 flex items-center gap-2">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
                  animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                />
              ))}
              <span className="text-xs text-cyan-400/70 font-mono ml-1">分析中...</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="relative z-10 border-t border-cyan-500/20 px-6 py-4 bg-black/60 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isLoading}
              placeholder="向战术引擎提问，例如：推荐一套适合当前阵容的进攻战术..."
              className="w-full bg-black/60 border border-cyan-500/30 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-400 transition-all resize-none placeholder-gray-600 leading-relaxed"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
              input.trim() && !isLoading
                ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.4)]'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-700 font-mono mt-2">Enter 发送 · Shift+Enter 换行</p>
      </div>
    </motion.div>
  );
}
