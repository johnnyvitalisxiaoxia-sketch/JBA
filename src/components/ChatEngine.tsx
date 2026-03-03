import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, Cpu, X, Bot, User, Trash2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { Player } from '../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatEngineProps {
  players: Player[];
  onClose: () => void;
}

export function ChatEngine({ players, onClose }: ChatEngineProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: `你好！我是 **NEXUS 战术分析助手**，已加载当前球员数据库中的 **${players.length}** 名球员的完整数据。\n\n你可以问我任何关于球队、球员、战术搭配、阵型优化的问题，例如：\n- "谁是最适合担任组织后卫的球员？"\n- "推荐一套最强的3v3阵容"\n- "分析一下控球最强的三名球员的协作潜力"`,
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

  const buildSystemContext = () => {
    const rosterText = players.map(p => {
      const total = p.handling + p.shooting + p.defense + p.rebounding + p.stamina;
      return `- ${p.name}：控球组织 ${p.handling}/10，投篮效率 ${p.shooting}/10，防守影响 ${p.defense}/10，篮板内线 ${p.rebounding}/10，体能冲击 ${p.stamina}/10（综合评分 ${total}/50）`;
    }).join('\n');

    return `你是 NEXUS HOOPS 战术分析系统的高级AI助手，专精于篮球战术分析。你已经掌握以下球队的完整球员数据：

【球员数据库】（共 ${players.length} 名球员）
${rosterText}

【你的职责】
1. 根据上述真实球员数据，回答用户提出的战术、阵容、球员分析等问题
2. 分析要专业、深入、有洞察力，结合具体的数据佐证
3. 推荐战术时要考虑班级篮球赛的特点（3v3、4v4或5v5模式）
4. 使用 Markdown 格式排版，语言专业热血，富有科技感
5. 永远基于真实数据分析，不要编造不存在的球员

请根据用户的问题给出专业且有价值的回答。`;
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
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

      const conversationHistory = messages.filter(m => m.id !== '0').map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }],
      }));

      conversationHistory.push({
        role: 'user',
        parts: [{ text: trimmed }],
      });

      const systemContext = buildSystemContext();

      const fullContents = [
        {
          role: 'user',
          parts: [{ text: systemContext + '\n\n用户问题：' + trimmed }],
        },
        ...conversationHistory.slice(0, -1).map(m => ({
          role: m.role as 'user' | 'model',
          parts: m.parts,
        })),
        {
          role: 'user' as const,
          parts: [{ text: trimmed }],
        }
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: systemContext }],
          },
          {
            role: 'model',
            parts: [{ text: `已接收球员数据库，共 ${players.length} 名球员。请提问，我将为您提供专业的战术分析。` }],
          },
          ...conversationHistory,
        ],
      });

      const text = response.text || '抱歉，无法生成回答，请重试。';

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `**系统错误**：${error.message || '请求失败，请稍后重试。'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: '0',
      role: 'assistant',
      content: `你好！我是 **NEXUS 战术分析助手**，已加载当前球员数据库中的 **${players.length}** 名球员的完整数据。\n\n你可以问我任何关于球队、球员、战术搭配、阵型优化的问题，例如：\n- "谁是最适合担任组织后卫的球员？"\n- "推荐一套最强的3v3阵容"\n- "分析一下控球最强的三名球员的协作潜力"`,
      timestamp: new Date(),
    }]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#050505] flex flex-col"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/20 via-black to-blue-950/20 pointer-events-none" />

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
            <p className="text-[10px] text-cyan-500/70 font-mono tracking-widest uppercase">
              {players.length} Players Loaded · Gemini 3.1 Pro Preview
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={clearChat}
            className="px-3 py-1.5 text-xs font-mono text-gray-400 border border-gray-700 rounded hover:bg-white/5 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" /> 清空对话
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-500/10 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" /> 退出对话
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar px-4 py-6 max-w-4xl w-full mx-auto">
        <div className="space-y-6">
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border ${
                  msg.role === 'user'
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                    : 'bg-blue-900/40 border-blue-500/30 text-blue-400'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                  msg.role === 'user'
                    ? 'bg-cyan-900/30 border border-cyan-500/30 text-white'
                    : 'bg-black/50 border border-white/10 text-gray-200'
                }`}>
                  {msg.role === 'assistant' ? (
                    <div className="markdown-body prose-sm prose-invert">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  )}
                  <p className="text-[10px] text-gray-600 mt-2 font-mono">
                    {msg.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 flex-row"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border bg-blue-900/40 border-blue-500/30 text-blue-400">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-black/50 border border-white/10 rounded-2xl px-5 py-4 flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  <Cpu className="w-4 h-4 text-cyan-400" />
                </motion.div>
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 bg-cyan-400 rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500 font-mono">AI 分析中...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="relative z-10 border-t border-cyan-500/20 bg-black/60 backdrop-blur-md px-4 py-4">
        <div className="max-w-4xl mx-auto flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={1}
              placeholder="提问关于球员、战术、阵容的任何问题... (Enter 发送，Shift+Enter 换行)"
              className="w-full bg-black/60 border border-cyan-500/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-cyan-400 transition-all resize-none placeholder-gray-600 max-h-32"
              style={{ minHeight: '48px' }}
              onInput={e => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = Math.min(el.scrollHeight, 128) + 'px';
              }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
              input.trim() && !isLoading
                ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.4)]'
                : 'bg-gray-800 text-gray-600 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-700 font-mono mt-2">
          NEXUS AI · Powered by Gemini 3.1 Pro Preview · 基于实时球员数据库
        </p>
      </div>
    </motion.div>
  );
}
