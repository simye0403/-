import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  PenTool, 
  Image as ImageIcon, 
  Video, 
  LayoutDashboard, 
  CreditCard, 
  History, 
  ChevronRight, 
  Menu, 
  X,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  Search,
  Settings,
  LogOut,
  Bell,
  Upload,
  FileText,
  User,
  Lock,
  MessageSquare,
  Download
} from 'lucide-react';
import { generateText, generateImage, generateVideo } from './services/gemini';
import { Project, ToolType, UserStats } from './types';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

// --- Components ---

const AuthModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-brand-dark border border-white/10 rounded-[2.5rem] p-10 shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-orange" />
            
            <div className="text-center mb-10">
              <h3 className="text-3xl font-black mb-2">{isLogin ? '로그인' : '회원가입'}</h3>
              <p className="text-white/40 text-sm">이즈 마케터들의 칼퇴를 위한 첫 걸음</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">아이디</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input type="text" placeholder="아이디를 입력하세요" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-brand-orange/50 outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">비밀번호</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                  <input type="password" placeholder="비밀번호를 입력하세요" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:border-brand-orange/50 outline-none transition-all" />
                </div>
              </div>
              
              <button className="w-full py-4 bg-brand-orange text-white rounded-xl font-bold mt-4 hover:bg-brand-orange/90 transition-all active:scale-95">
                {isLogin ? '로그인하기' : '가입하기'}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-brand-dark px-2 text-white/20">또는</span></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 py-3 bg-[#03C75A] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all">
                  네이버
                </button>
                <button className="flex items-center justify-center gap-2 py-3 bg-[#FEE500] text-black rounded-xl text-sm font-bold hover:opacity-90 transition-all">
                  카카오
                </button>
              </div>
            </div>

            <p className="text-center mt-8 text-sm text-white/40">
              {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'} {' '}
              <button onClick={() => setIsLogin(!isLogin)} className="text-brand-orange font-bold hover:underline">
                {isLogin ? '회원가입' : '로그인'}
              </button>
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Navbar = ({ onNavigate, activeTab, onOpenAuth }: { onNavigate: (tab: string) => void, activeTab: string, onOpenAuth: () => void }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-black/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <div className="w-10 h-10 bg-brand-orange rounded-xl flex items-center justify-center shadow-lg shadow-brand-orange/20">
              <Zap className="text-white fill-white" size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">칼퇴</span>
          </div>

          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate('home')}
              className={`text-sm font-bold transition-colors ${
                activeTab === 'home' ? 'text-brand-orange' : 'text-white/60 hover:text-white'
              }`}
            >
              홈
            </button>
            <button
              onClick={onOpenAuth}
              className="text-sm font-bold text-white/60 hover:text-white transition-colors"
            >
              로그인
            </button>
            <button 
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-2.5 bg-brand-orange text-white rounded-full font-bold text-sm hover:bg-brand-orange/90 transition-all active:scale-95"
            >
              워크스페이스
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Hero = ({ onStart }: { onStart: () => void }) => {
  return (
    <section className="relative pt-48 pb-32 overflow-hidden min-h-[95vh] flex items-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?auto=format&fit=crop&q=80&w=2000" 
          alt="3D Abstract Background" 
          className="w-full h-full object-cover opacity-40 grayscale"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-black via-brand-black/90 to-brand-black" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#FF6600 0.5px, transparent 0.5px)', backgroundSize: '32px 32px' }} />
      </div>

      {/* Floating 3D Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-1">
        {/* Sphere 1 */}
        <motion.div
          animate={{ 
            y: [0, -40, 0],
            rotate: [0, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[20%] left-[10%] w-64 h-64 bg-gradient-to-br from-brand-orange/40 to-transparent rounded-full blur-3xl opacity-30"
        />
        {/* Sphere 2 */}
        <motion.div
          animate={{ 
            y: [0, 50, 0],
            rotate: [0, -15, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[15%] right-[15%] w-80 h-80 bg-gradient-to-tl from-brand-orange/30 to-transparent rounded-full blur-3xl opacity-20"
        />
        
        {/* 3D Glassmorphic Shapes */}
        <motion.div
          animate={{ 
            rotate: 360,
            y: [0, -20, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[15%] right-[20%] w-32 h-32 border border-white/10 rounded-3xl backdrop-blur-sm bg-white/5 rotate-12"
        />
        <motion.div
          animate={{ 
            rotate: -360,
            x: [0, 30, 0]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[25%] left-[20%] w-24 h-24 border border-brand-orange/20 rounded-full backdrop-blur-md bg-brand-orange/5 -rotate-12"
        />
      </div>

      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none z-1">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-orange/20 blur-[150px] rounded-full" 
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-5 py-2 bg-brand-orange/10 text-brand-orange rounded-full text-xs font-black uppercase tracking-[0.2em] border border-brand-orange/20 shadow-lg shadow-brand-orange/5">
              <Zap size={14} fill="currentColor" /> EZPMP Internal AI Tool
            </span>
          </motion.div>
          
          <h1 className="text-7xl md:text-[10rem] font-black text-white leading-[0.9] mb-10 tracking-tighter">
            이즈 마케터들의<br />
            <motion.span 
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange via-white to-brand-orange bg-[length:200%_auto]"
            >
              칼퇴를 위하여
            </motion.span>
          </h1>
          
          <p className="text-xl md:text-3xl text-white/70 max-w-4xl mx-auto mb-16 leading-relaxed font-medium tracking-tight">
            블로그 기획부터 고퀄리티 이미지, 영상 제작까지.<br />
            <span className="text-white">이즈피엠피 임직원</span>을 위한 최첨단 AI 업무 솔루션.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(255, 102, 0, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              className="w-full sm:w-auto px-14 py-7 bg-brand-orange text-white rounded-[2rem] font-black text-2xl shadow-2xl shadow-brand-orange/30 flex items-center justify-center gap-4 group transition-all"
            >
              워크스페이스 입장 
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight size={28} />
              </motion.div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Pricing = () => {
  const plans = [
    { name: "Free", price: "0", features: ["월 10회 생성", "기본 텍스트 도구", "커뮤니티 이용"], current: false },
    { name: "Pro", price: "29,000", features: ["무제한 텍스트 생성", "월 50회 이미지 생성", "AI 비디오 베타", "우선 지원"], current: true },
    { name: "Enterprise", price: "문의", features: ["무제한 모든 기능", "API 연동 지원", "전담 매니저 배치", "맞춤형 AI 모델"], current: false },
  ];

  return (
    <section className="py-24 bg-brand-dark/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">서비스 플랜</h2>
          <p className="text-white/50">당신의 업무 스타일에 맞는 플랜을 선택하세요.<br /><span className="text-brand-orange font-bold">단 이즈피엠피 임직원은 무료입니다.</span></p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <div 
              key={i} 
              className={`p-10 rounded-[2.5rem] border ${
                plan.current ? 'bg-brand-orange border-brand-orange text-white shadow-2xl shadow-brand-orange/20' : 'bg-brand-dark border-white/5 text-white'
              }`}
            >
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-black">₩{plan.price}</span>
                {plan.price !== "문의" && <span className="text-sm opacity-60">/월</span>}
              </div>
              <ul className="space-y-4 mb-10">
                {plan.features.map((feat, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm font-medium">
                    <CheckCircle2 size={18} className={plan.current ? 'text-white' : 'text-brand-orange'} />
                    <span className={plan.current ? 'text-white' : 'text-white/70'}>{feat}</span>
                  </li>
                ))}
              </ul>
              <button className={`w-full py-4 rounded-2xl font-bold transition-all ${
                plan.current ? 'bg-white text-brand-orange hover:bg-white/90' : 'bg-white/5 text-white hover:bg-white/10'
              }`}>
                {plan.name === "Enterprise" ? "문의하기" : "시작하기"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Dashboard = () => {
  const [activeTool, setActiveTool] = useState<ToolType>('text');
  const [prompt, setPrompt] = useState('');
  
  // Writing Fields
  const [subject, setSubject] = useState('');
  const [audience, setAudience] = useState('');
  const [message, setMessage] = useState('');
  const [referenceLinks, setReferenceLinks] = useState('');
  const [imageCount, setImageCount] = useState(1);
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoScenario, setVideoScenario] = useState<string | null>(null);
  
  const [result, setResult] = useState<string | string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
        setHasApiKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats] = useState<UserStats>({
    creditsUsed: 35,
    totalCredits: 100,
    projectsCount: 12
  });

  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
      // Reset input value to allow re-uploading the same file
      e.target.value = '';
    }
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      // Convert uploaded files to base64 for Gemini
      const fileData = await Promise.all(uploadedFiles.map(async (file) => {
        return new Promise<{ data: string, mimeType: string }>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve({ data: base64, mimeType: file.type });
          };
          reader.readAsDataURL(file);
        });
      }));

      let output: string | string[] = '';
      if (activeTool === 'text') {
        const fullPrompt = `
주제: ${subject}
타겟 독자: ${audience}
핵심 메시지: ${message}
참고 링크: ${referenceLinks}
추가 요청사항: ${prompt}
`;
        output = await generateText(fullPrompt, 'full_writing', fileData);
      } else if (activeTool === 'image') {
        // Try to extract count from prompt, but respect the manual input if it's been set
        let count = imageCount;
        const match = prompt.match(/(\d+)\s*(?:개|장|장수|매|번)/);
        if (match) {
          const parsed = parseInt(match[1]);
          if (parsed > 0 && parsed <= 10) count = parsed;
        }
        output = (await generateImage(prompt, count)) || '';
      } else if (activeTool === 'video') {
        // Extract duration from prompt (e.g., "3초", "5초")
        let duration = 5;
        const match = prompt.match(/(\d+)\s*(?:초|sec|second)/);
        if (match) {
          const parsed = parseInt(match[1]);
          if (parsed > 0) duration = parsed;
        }
        const videoResult = await generateVideo(prompt, videoAspectRatio, duration, fileData);
        output = videoResult?.videoUrl || '';
        setVideoScenario(videoResult?.scenario || null);
      }
      
      setResult(output);
      
      const newProject: Project = {
        id: Math.random().toString(36).substr(2, 9),
        title: (activeTool === 'text' ? subject : prompt).slice(0, 20) + '...',
        type: activeTool,
        content: Array.isArray(output) ? output[0] : output,
        createdAt: new Date(),
        thumbnail: activeTool === 'image' ? (Array.isArray(output) ? output[0] : output) : undefined
      };
      setProjects([newProject, ...projects]);
    } catch (error) {
      console.error(error);
      alert("생성 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-12 px-4 max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} multiple />
      {/* Sidebar */}
      <aside className="w-full lg:w-72 flex flex-col gap-6">
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-full bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center text-brand-orange font-bold">
              SY
            </div>
            <div>
              <h4 className="font-bold">심예린 님</h4>
              <p className="text-xs text-white/40">Pro 플랜 사용 중</p>
            </div>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'workspace', icon: <LayoutDashboard size={20} />, label: '워크스페이스' },
              { id: 'history', icon: <History size={20} />, label: '생성 히스토리' },
              { id: 'library', icon: <Bell size={20} />, label: '알림' },
              { id: 'settings', icon: <Settings size={20} />, label: '설정' },
            ].map((item) => (
              <button key={item.id} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all">
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Credit Gauge */}
        <div className="glass-card p-6 rounded-3xl">
          <div className="flex justify-between items-center mb-4">
            <h5 className="text-sm font-bold flex items-center gap-2">
              <CreditCard size={16} className="text-brand-orange" /> 크레딧 현황
            </h5>
            <span className="text-xs text-brand-orange font-bold">{stats.creditsUsed}%</span>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-3">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${stats.creditsUsed}%` }}
              className="h-full bg-brand-orange"
            />
          </div>
          <p className="text-[10px] text-white/40">다음 갱신일: 2026.03.26</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 space-y-8">
        {/* Tool Selector */}
        <div className="flex gap-2 p-1.5 bg-brand-dark border border-white/5 rounded-2xl w-fit">
          {[
            { id: 'text', icon: <PenTool size={18} />, label: '글쓰기' },
            { id: 'image', icon: <ImageIcon size={18} />, label: '이미지' },
            { id: 'video', icon: <Video size={18} />, label: '비디오' },
          ].map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as ToolType)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTool === tool.id ? 'bg-brand-orange text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              {tool.icon} {tool.label}
            </button>
          ))}
        </div>

        {/* Editor Area */}
        <div className="glass-card p-8 rounded-[2.5rem] space-y-8">
          <div className="space-y-6">
            {activeTool === 'text' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">주제</label>
                  <input 
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="콘텐츠의 주제를 입력하세요" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-brand-orange/50 outline-none" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">독자 (타겟)</label>
                  <input 
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="누구를 위한 글인가요?" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-brand-orange/50 outline-none" 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">핵심 메시지</label>
                  <input 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="가장 전달하고 싶은 한 문장은?" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-brand-orange/50 outline-none" 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">참고 링크</label>
                  <input 
                    value={referenceLinks}
                    onChange={(e) => setReferenceLinks(e.target.value)}
                    placeholder="참고할 웹사이트 URL을 입력하세요 (쉼표로 구분)" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:border-brand-orange/50 outline-none" 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">상세 요청사항</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="톤앤매너, 분량 등 추가로 요청할 사항을 적어주세요"
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-orange/50 transition-all resize-none"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">참고 파일</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                      isDragging ? 'border-brand-orange bg-brand-orange/10' : 'border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <Upload className={isDragging ? 'text-brand-orange' : 'text-white/20'} size={32} />
                    <span className={`text-sm font-bold ${isDragging ? 'text-brand-orange' : 'text-white/40'}`}>
                      {isDragging ? '여기에 놓으세요' : '파일을 드래그하거나 클릭하여 업로드'}
                    </span>
                  </div>
                  
                  {uploadedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs">
                          <FileText size={14} className="text-brand-orange" />
                          <span className="text-white/60 truncate max-w-[150px]">{file.name}</span>
                          <button onClick={(e) => { e.stopPropagation(); removeFile(idx); }} className="text-white/20 hover:text-white">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/60">
                    {activeTool === 'image' ? '무엇을 생성할까요?' : '비디오 생성 요청'}
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={
                      activeTool === 'image' ? "예: 사이버펑크 스타일의 서울 도심 야경, 4k, 시네마틱" :
                      "예: 고양이가 우주에서 춤추는 10초 영상 제작"
                    }
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-6 text-white placeholder:text-white/20 focus:outline-none focus:border-brand-orange/50 transition-all resize-none"
                  />
                </div>

                {activeTool === 'image' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">생성 개수</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="number"
                        min="1"
                        max="10"
                        value={imageCount}
                        onChange={(e) => setImageCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                        className="w-24 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:border-brand-orange/50 outline-none font-bold"
                      />
                      <span className="text-sm font-bold text-white/40">장 (최대 10장)</span>
                    </div>
                  </div>
                )}

                {activeTool === 'video' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest">영상 사이즈 (비율)</label>
                    <div className="flex gap-2">
                      {[
                        { label: '가로 (16:9)', value: '16:9' },
                        { label: '세로 (9:16)', value: '9:16' }
                      ].map((ratio) => (
                        <button
                          key={ratio.value}
                          onClick={() => setVideoAspectRatio(ratio.value as '16:9' | '9:16')}
                          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all border ${
                            videoAspectRatio === ratio.value 
                              ? 'bg-brand-orange border-brand-orange text-white' 
                              : 'bg-white/5 border-white/10 text-white/40 hover:text-white/60'
                          }`}
                        >
                          {ratio.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">참고 파일</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                      isDragging ? 'border-brand-orange bg-brand-orange/10' : 'border-white/10 hover:bg-white/5'
                    }`}
                  >
                    <Upload className={isDragging ? 'text-brand-orange' : 'text-white/20'} size={32} />
                    <span className={`text-sm font-bold ${isDragging ? 'text-brand-orange' : 'text-white/40'}`}>
                      {isDragging ? '여기에 놓으세요' : '파일을 드래그하거나 클릭하여 업로드'}
                    </span>
                  </div>
                  
                  {uploadedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs">
                          <FileText size={14} className="text-brand-orange" />
                          <span className="text-white/60 truncate max-w-[150px]">{file.name}</span>
                          <button onClick={(e) => { e.stopPropagation(); removeFile(idx); }} className="text-white/20 hover:text-white">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <button
              onClick={handleGenerate}
              disabled={isLoading || (activeTool === 'text' ? !subject : !prompt)}
              className="w-full py-5 bg-brand-orange text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:bg-brand-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Zap size={20} fill="white" /> {activeTool === 'text' ? '기획 및 제작 시작' : '생성하기'}</>
              )}
            </button>

            {!hasApiKey && (activeTool === 'image' || activeTool === 'video') && (
              <div className="p-4 bg-brand-orange/10 border border-brand-orange/20 rounded-xl flex flex-col gap-3">
                <p className="text-xs text-brand-orange font-bold">
                  이미지 및 비디오 생성을 위해 API 키 선택이 필요합니다. (유료 계정 권장)
                </p>
                <button 
                  onClick={handleSelectKey}
                  className="px-4 py-2 bg-brand-orange text-white rounded-lg text-xs font-bold hover:bg-brand-orange/90 transition-all"
                >
                  API 키 선택하기
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Result Area */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 rounded-[2.5rem] border-brand-orange/30"
          >
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold flex items-center gap-2">
                <CheckCircle2 size={18} className="text-brand-orange" /> 생성 결과
              </h4>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(result);
                  alert("클립보드에 복사되었습니다.");
                }}
                className="text-xs font-bold text-brand-orange hover:underline"
              >
                복사하기
              </button>
            </div>
            <div className="bg-white/5 rounded-2xl p-6 min-h-[100px]">
              {activeTool === 'text' ? (
                <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{result as string}</p>
              ) : activeTool === 'image' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.isArray(result) ? (
                    result.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img src={img} alt={`Generated AI ${idx + 1}`} className="w-full rounded-xl shadow-2xl hover:scale-[1.02] transition-transform cursor-zoom-in" />
                        <button 
                          onClick={() => handleDownload(img, `ai-image-${idx + 1}.png`)}
                          className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-md text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-orange"
                          title="이미지 다운로드"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="relative group">
                      <img src={result as string} alt="Generated AI" className="w-full rounded-xl shadow-2xl" />
                      <button 
                        onClick={() => handleDownload(result as string, 'ai-image.png')}
                        className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-md text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-orange"
                        title="이미지 다운로드"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {videoScenario && (
                    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                      <h4 className="text-xs font-bold text-brand-orange uppercase tracking-widest mb-2">AI 생성 시나리오</h4>
                      <p className="text-sm text-white/60 italic leading-relaxed">{videoScenario}</p>
                    </div>
                  )}
                  <div className="relative group">
                    <video src={result as string} controls autoPlay className="w-full rounded-xl shadow-2xl" />
                    <button 
                      onClick={() => handleDownload(result as string, 'ai-video.mp4')}
                      className="absolute top-3 right-3 p-2 bg-black/50 backdrop-blur-md text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-brand-orange z-10"
                      title="비디오 다운로드"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Recent Projects */}
        <div className="space-y-4">
          <h4 className="font-bold text-lg flex items-center gap-2">
            <History size={20} className="text-brand-orange" /> 최근 프로젝트
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-white/20 border border-dashed border-white/10 rounded-3xl">
                아직 생성된 프로젝트가 없습니다.
              </div>
            ) : (
              projects.map((proj) => (
                <div key={proj.id} className="glass-card p-5 rounded-2xl flex items-center gap-4 hover:bg-white/5 transition-all cursor-pointer group">
                  <div className="w-16 h-16 rounded-xl bg-white/5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {proj.thumbnail ? (
                      <img src={proj.thumbnail} className="w-full h-full object-cover" />
                    ) : (
                      proj.type === 'text' ? <PenTool size={24} className="text-white/20" /> : <Video size={24} className="text-white/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-sm truncate">{proj.title}</h5>
                    <p className="text-[10px] text-white/40 flex items-center gap-1">
                      <Clock size={10} /> {proj.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-white/20 group-hover:text-brand-orange transition-colors" />
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-brand-black border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center">
            <Zap className="text-white fill-white" size={18} />
          </div>
          <span className="text-xl font-black tracking-tighter">칼퇴</span>
        </div>
        <div className="flex gap-8 text-sm text-white/40 font-medium">
          <a href="#" className="hover:text-white transition-colors">이용약관</a>
          <a href="#" className="hover:text-white transition-colors">개인정보처리방침</a>
          <a href="#" className="hover:text-white transition-colors">고객센터</a>
        </div>
        <p className="text-xs text-white/20">© 2026 Kal-Twae AI. made by 심예린. All rights reserved.</p>
      </div>
    </footer>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <Hero onStart={() => setActiveTab('dashboard')} />
            <Pricing />
          </>
        );
      case 'tools':
        return <Dashboard />;
      case 'pricing':
        return <Pricing />;
      case 'dashboard':
        return <Dashboard />;
      default:
        return <Hero onStart={() => setActiveTab('dashboard')} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onNavigate={setActiveTab} activeTab={activeTab} onOpenAuth={() => setIsAuthOpen(true)} />
      <main className="flex-1">
        {renderContent()}
      </main>
      <Footer />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
