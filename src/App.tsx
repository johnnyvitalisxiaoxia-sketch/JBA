import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ShieldAlert, Plus, Trash2, CreditCard as Edit2, Check, X, Cpu, Activity, Database, Lock, Clock as Unlock, Zap, ChevronRight, Users, Map, Target, ChartPie as PieChart } from 'lucide-react';
import ParticleBackground from './components/ParticleBackground';
import { TacticalVisuals } from './components/TacticalVisuals';
import { LandingPage } from './components/LandingPage';
import { Player, AnalysisResult } from './types';
import ReactMarkdown from 'react-markdown';
import { supabase } from './lib/supabase';

const TABS: { key: keyof AnalysisResult; label: string; icon: React.ReactNode }[] = [
  { key: 'structure', label: '阵容结构', icon: <Users className="w-5 h-5" /> },
  { key: 'positions', label: '位置分配', icon: <Map className="w-5 h-5" /> },
  { key: 'roles', label: '个人职责', icon: <Target className="w-5 h-5" /> },
  { key: 'offense', label: '进攻体系', icon: <Zap className="w-5 h-5" /> },
  { key: 'defense', label: '防守体系', icon: <Shield className="w-5 h-5" /> },
  { key: 'possession', label: '球权分配', icon: <PieChart className="w-5 h-5" /> },
];

const StatBar = ({ label, value, colorClass, bgClass }: { label: string, value: number, colorClass: string, bgClass: string }) => (
  <div className="mb-1.5">
    <div className="flex justify-between text-[10px] text-gray-400 mb-0.5 font-mono uppercase">
      <span>{label}</span>
      <span className={colorClass}>{value}/10</span>
    </div>
    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${(value / 10) * 100}%` }}
        className={`h-full ${bgClass}`}
        style={{ boxShadow: `0 0 8px currentColor` }}
      />
    </div>
  </div>
);

export default function App() {
  const [appState, setAppState] = useState<'landing' | 'app'>('landing');
  const [gameMode, setGameMode] = useState<number>(5);

  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');

  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [extraInfo, setExtraInfo] = useState('');

  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState<Omit<Player, 'id'>>({
    name: '', handling: 5, shooting: 5, defense: 5, rebounding: 5, stamina: 5
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'deep' | 'fast'>('deep');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<keyof AnalysisResult>('structure');
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && data) {
      setPlayers(data.map(p => ({
        id: p.id,
        name: p.name,
        handling: p.handling,
        shooting: p.shooting,
        defense: p.defense,
        rebounding: p.rebounding,
        stamina: p.stamina,
      })));
    }
    setLoadingPlayers(false);
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'cqz12345') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPassword('');
      setAdminError('');
    } else {
      setAdminError('密码错误，访问被拒绝。');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  const togglePlayerSelection = (id: string) => {
    if (selectedPlayerIds.includes(id)) {
      setSelectedPlayerIds(selectedPlayerIds.filter(pid => pid !== id));
    } else {
      if (selectedPlayerIds.length < gameMode) {
        setSelectedPlayerIds([...selectedPlayerIds, id]);
      }
    }
  };

  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlayer) {
      const { error } = await supabase
        .from('players')
        .update({
          name: formData.name,
          handling: formData.handling,
          shooting: formData.shooting,
          defense: formData.defense,
          rebounding: formData.rebounding,
          stamina: formData.stamina,
        })
        .eq('id', editingPlayer.id);
      if (!error) await fetchPlayers();
    } else {
      const { error } = await supabase
        .from('players')
        .insert({
          name: formData.name,
          handling: formData.handling,
          shooting: formData.shooting,
          defense: formData.defense,
          rebounding: formData.rebounding,
          stamina: formData.stamina,
        });
      if (!error) await fetchPlayers();
    }
    setShowPlayerForm(false);
    setEditingPlayer(null);
  };

  const handleDeletePlayer = async (id: string) => {
    const { error } = await supabase.from('players').delete().eq('id', id);
    if (!error) {
      await fetchPlayers();
      setSelectedPlayerIds(selectedPlayerIds.filter(pid => pid !== id));
    }
  };

  const openEditForm = (player: Player) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      handling: player.handling,
      shooting: player.shooting,
      defense: player.defense,
      rebounding: player.rebounding,
      stamina: player.stamina
    });
    setShowPlayerForm(true);
  };

  const openAddForm = () => {
    setEditingPlayer(null);
    setFormData({
      name: '', handling: 5, shooting: 5, defense: 5, rebounding: 5, stamina: 5
    });
    setShowPlayerForm(true);
  };

  const analyzeTeam = async () => {
    if (selectedPlayerIds.length !== gameMode) return;

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalyzeError(null);
    setProgress(0);

    const FIXED_TIME = analysisMode === 'deep' ? 6000 : 2000;
    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(99, (elapsed / FIXED_TIME) * 100);
      setProgress(currentProgress);
    }, 50);

    try {
      const selectedPlayers = players.filter(p => selectedPlayerIds.includes(p.id));

      const playersText = selectedPlayers.map(p =>
        `- ${p.name}: 控球组织 ${p.handling}/10, 投篮效率 ${p.shooting}/10, 防守影响 ${p.defense}/10, 篮板内线 ${p.rebounding}/10, 体能冲击 ${p.stamina}/10 (总分: ${p.handling + p.shooting + p.defense + p.rebounding + p.stamina}/50)`
      ).join('\n');

      const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze_team`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const [response] = await Promise.all([
        fetch(edgeFunctionUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            gameMode,
            playersText,
            extraInfo,
            analysisMode,
          }),
        }),
        new Promise(resolve => setTimeout(resolve, FIXED_TIME))
      ]);

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "API request failed");
      }

      const result = await response.json() as AnalysisResult;

      setTimeout(() => {
        setAnalysisResult(result);
        setActiveTab('structure');
        setIsAnalyzing(false);
      }, 300);
    } catch (error: any) {
      console.error("Analysis error:", error);
      clearInterval(progressInterval);
      setProgress(0);
      setAnalyzeError(error.message || "解析战术数据失败，请重试。");
      setIsAnalyzing(false);
    }
  };

  if (appState === 'landing') {
    return (
      <LandingPage onEnter={(mode) => {
        setGameMode(mode);
        setAppState('app');
        setSelectedPlayerIds([]); // Reset selection when mode changes
      }} />
    );
  }

  return (
    <div className="min-h-screen relative font-sans">
      <ParticleBackground />
      
      {/* Header */}
      <header className="glass-panel sticky top-0 z-40 border-b border-cyan-500/20 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
            <Cpu className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wider neon-text">NEXUS<span className="text-cyan-400">HOOPS</span></h1>
            <p className="text-[10px] text-cyan-500/70 font-mono tracking-widest uppercase">Tactical Analysis System</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {isAdmin ? (
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-green-400 flex items-center gap-1">
                <Shield className="w-4 h-4" /> 管理员模式已激活
              </span>
              <button 
                onClick={handleLogout}
                className="px-4 py-1.5 text-xs font-mono text-red-400 border border-red-500/30 rounded hover:bg-red-500/10 transition-colors"
              >
                退出管理
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowAdminLogin(true)}
              className="px-4 py-1.5 text-xs font-mono text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-500/10 transition-colors flex items-center gap-2"
            >
              <Lock className="w-3 h-3" /> 管理员登录
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Roster */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-cyan-400" /> 球员数据库
              </h2>
              <p className="text-sm text-gray-400 mt-1">选择{gameMode}名球员进行战术推演 ({selectedPlayerIds.length}/{gameMode})</p>
            </div>
            {isAdmin && (
              <button 
                onClick={openAddForm}
                className="px-4 py-2 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-lg hover:bg-cyan-500/30 transition-colors flex items-center gap-2 text-sm font-medium"
              >
                <Plus className="w-4 h-4" /> 录入新球员
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {loadingPlayers && (
              <div className="col-span-full flex items-center justify-center py-16 text-gray-500">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <Cpu className="w-6 h-6 text-cyan-400" />
                </motion.div>
                <span className="ml-3 text-sm font-mono">Loading players...</span>
              </div>
            )}
            <AnimatePresence>
              {players.map(player => {
                const isSelected = selectedPlayerIds.includes(player.id);
                const totalScore = player.handling + player.shooting + player.defense + player.rebounding + player.stamina;
                
                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={player.id}
                    onClick={() => togglePlayerSelection(player.id)}
                    className={`glass-panel rounded-xl p-4 cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                      isSelected ? 'neon-border bg-cyan-900/20' : 'hover:border-cyan-500/30 hover:bg-white/5'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/20 blur-2xl rounded-full" />
                    )}
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div>
                        <h3 className="text-lg font-bold text-white">{player.name}</h3>
                        <div className="text-[10px] text-cyan-400 font-mono mt-0.5">OVR: {totalScore}/50</div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {isAdmin && (
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                            <button onClick={() => openEditForm(player)} className="p-1.5 text-gray-400 hover:text-cyan-400 bg-black/40 rounded">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeletePlayer(player.id)} className="p-1.5 text-gray-400 hover:text-red-400 bg-black/40 rounded">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400' : 'border-gray-600 text-transparent'
                        }`}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 relative z-10">
                      <StatBar label="控球组织" value={player.handling} colorClass="text-cyan-400" bgClass="bg-cyan-400" />
                      <StatBar label="投篮效率" value={player.shooting} colorClass="text-yellow-400" bgClass="bg-yellow-400" />
                      <StatBar label="防守影响" value={player.defense} colorClass="text-red-400" bgClass="bg-red-400" />
                      <StatBar label="篮板内线" value={player.rebounding} colorClass="text-green-400" bgClass="bg-green-400" />
                      <StatBar label="体能冲击" value={player.stamina} colorClass="text-purple-400" bgClass="bg-purple-400" />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Column: Analysis Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel rounded-2xl p-6 border-cyan-500/30 relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 opacity-50" />
            
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" /> 战术推演引擎
            </h2>

            <div className="flex-1 flex flex-col">
              {selectedPlayerIds.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 py-12">
                  <Zap className="w-12 h-12 mb-4 opacity-20" />
                  <p className="text-sm">请从左侧数据库选择{gameMode}名首发球员</p>
                </div>
              ) : (
                <div className="space-y-3 mb-8">
                  <h3 className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-4">已选首发阵容</h3>
                  {selectedPlayerIds.map(id => {
                    const p = players.find(p => p.id === id);
                    if (!p) return null;
                    return (
                      <div key={id} className="flex items-center justify-between p-3 bg-black/40 border border-cyan-500/20 rounded-lg">
                        <span className="text-sm font-medium text-white">{p.name}</span>
                        <span className="text-xs font-mono text-cyan-400">OVR {p.handling + p.shooting + p.defense + p.rebounding + p.stamina}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-xs font-mono text-gray-400 mb-2 uppercase tracking-wider">补充信息（可选）</label>
                <textarea
                  value={extraInfo}
                  onChange={(e) => setExtraInfo(e.target.value)}
                  rows={3}
                  className="w-full bg-black/50 border border-cyan-500/20 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cyan-400 transition-all resize-none placeholder-gray-600"
                  placeholder="输入关于球员或球队的额外信息，如球员特点、对手情况、比赛策略偏好等..."
                />
              </div>

              <div className="mt-auto pt-6 border-t border-white/5">
                {analyzeError && (
                  <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    {analyzeError}
                  </div>
                )}

                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setAnalysisMode('deep')}
                    disabled={isAnalyzing}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-all ${
                      analysisMode === 'deep' 
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 shadow-[0_0_10px_rgba(0,255,255,0.2)]' 
                        : 'bg-black/40 text-gray-500 border border-gray-800 hover:border-cyan-500/30 hover:text-gray-300'
                    }`}
                  >
                    深度演算模式
                  </button>
                  <button
                    onClick={() => setAnalysisMode('fast')}
                    disabled={isAnalyzing}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-all ${
                      analysisMode === 'fast' 
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
                        : 'bg-black/40 text-gray-500 border border-gray-800 hover:border-purple-500/30 hover:text-gray-300'
                    }`}
                  >
                    极速战报模式
                  </button>
                </div>

                <button
                  onClick={analyzeTeam}
                  disabled={selectedPlayerIds.length !== gameMode || isAnalyzing}
                  className={`relative w-full py-4 rounded-xl font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden ${
                    selectedPlayerIds.length === gameMode && !isAnalyzing
                      ? analysisMode === 'deep' 
                        ? 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                        : 'bg-purple-500 text-black hover:bg-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isAnalyzing && (
                    <div 
                      className={`absolute left-0 top-0 bottom-0 transition-all duration-300 ${
                        analysisMode === 'deep' ? 'bg-cyan-600/50' : 'bg-purple-600/50'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {isAnalyzing ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                          <Cpu className="w-5 h-5" />
                        </motion.div>
                        {analysisMode === 'deep' ? '深度演算中...' : '极速生成中...'} {progress}%
                      </>
                    ) : (
                      <>启动{analysisMode === 'deep' ? '深度' : '极速'}分析 <ChevronRight className="w-5 h-5" /></>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Analysis Result Modal (Full Screen 6-Page Layout) */}
      <AnimatePresence>
        {analysisResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#050505] flex flex-col"
          >
            <ParticleBackground />
            
            {/* Header */}
            <div className="relative z-10 border-b border-cyan-500/20 px-6 py-4 flex justify-between items-center bg-black/50 backdrop-blur-md">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Activity className="w-6 h-6 text-cyan-400" /> 
                <span className="neon-text">NEXUS 深度战术分析报告</span>
              </h2>
              <button 
                onClick={() => setAnalysisResult(null)}
                className="px-4 py-2 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-500/10 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" /> 退出分析系统
              </button>
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col overflow-hidden p-6 max-w-7xl mx-auto w-full">
              
              {/* Top Navigation (Bento / Segmented Control) */}
              <div className="flex justify-center flex-wrap gap-4 mb-8">
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative px-6 py-3 rounded-xl flex items-center gap-3 overflow-hidden transition-all duration-300 ${
                      activeTab === tab.key 
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400 shadow-[0_0_20px_rgba(0,255,255,0.4)]' 
                        : 'bg-black/40 text-gray-400 border border-cyan-500/20 hover:border-cyan-500/50 hover:text-cyan-200'
                    }`}
                  >
                    {activeTab === tab.key && (
                      <motion.div layoutId="activeTabGlow" className="absolute inset-0 bg-cyan-400/10 blur-md" />
                    )}
                    <span className="relative z-10">{tab.icon}</span>
                    <span className="relative z-10 font-bold tracking-widest">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Main Panel (Split View or Full Text) */}
              <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
                
                {/* Left: SVG Tactical Animation (Only in Deep Mode) */}
                {analysisMode === 'deep' && (
                  <div className="w-full lg:w-1/2 glass-panel rounded-2xl border-cyan-500/30 overflow-hidden relative flex items-center justify-center bg-[#020617] shadow-[inset_0_0_50px_rgba(0,255,255,0.05)]">
                    <div className="absolute top-4 left-4 text-xs font-mono text-cyan-500/50 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-4 h-4" /> Tactical Simulation
                    </div>
                    <div className="w-full max-w-md aspect-square p-8">
                      <TacticalVisuals type={activeTab} />
                    </div>
                  </div>
                )}

                {/* Right: Formatted Text */}
                <div className={`w-full ${analysisMode === 'deep' ? 'lg:w-1/2' : 'max-w-4xl mx-auto'} glass-panel rounded-2xl border-cyan-500/30 p-8 overflow-y-auto custom-scrollbar bg-black/40`}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="markdown-body"
                    >
                      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-cyan-500/20">
                        <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/30 text-cyan-400">
                          {TABS.find(t => t.key === activeTab)?.icon}
                        </div>
                        <h3 className="text-2xl font-bold text-white tracking-widest neon-text">
                          {TABS.find(t => t.key === activeTab)?.label}
                        </h3>
                      </div>
                      <ReactMarkdown>{analysisResult[activeTab]}</ReactMarkdown>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="glass-panel w-full max-w-md rounded-2xl p-6 border-cyan-500/30"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-cyan-400" /> 系统授权
                </h2>
                <button onClick={() => setShowAdminLogin(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">访问密钥</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-black/50 border border-cyan-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                    placeholder="输入管理员密码..."
                    autoFocus
                  />
                </div>
                {adminError && <p className="text-red-400 text-sm">{adminError}</p>}
                <button
                  type="submit"
                  className="w-full py-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 rounded-lg hover:bg-cyan-500/30 transition-colors font-medium"
                >
                  验证身份
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player Form Modal */}
      <AnimatePresence>
        {showPlayerForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="glass-panel w-full max-w-lg rounded-2xl p-6 border-cyan-500/30 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  {editingPlayer ? <Edit2 className="w-5 h-5 text-cyan-400" /> : <Plus className="w-5 h-5 text-cyan-400" />}
                  {editingPlayer ? '更新球员数据' : '录入新球员'}
                </h2>
                <button onClick={() => setShowPlayerForm(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSavePlayer} className="space-y-5">
                <div>
                  <label className="block text-xs font-mono text-gray-400 mb-2 uppercase">球员姓名</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-black/50 border border-cyan-500/30 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-400 transition-all"
                    placeholder="输入姓名"
                  />
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'handling', label: '控球组织', color: 'text-cyan-400' },
                    { key: 'shooting', label: '投篮效率', color: 'text-yellow-400' },
                    { key: 'defense', label: '防守影响', color: 'text-red-400' },
                    { key: 'rebounding', label: '篮板内线', color: 'text-green-400' },
                    { key: 'stamina', label: '体能冲击', color: 'text-purple-400' },
                  ].map(({ key, label, color }) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <label className="text-gray-300">{label}</label>
                        <span className={`font-mono ${color}`}>{formData[key as keyof typeof formData]}/10</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={formData[key as keyof typeof formData]}
                        onChange={(e) => setFormData({ ...formData, [key]: parseInt(e.target.value) })}
                        className="w-full accent-cyan-500"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPlayerForm(false)}
                    className="px-5 py-2.5 text-gray-400 hover:text-white transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-cyan-500 text-black font-bold rounded-lg hover:bg-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all"
                  >
                    保存数据
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

