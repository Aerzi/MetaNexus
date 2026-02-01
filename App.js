import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';

// --- Data & Config ---
const QUESTIONS = [
  {
    q: "周一早上 9:00，你的第一反应是？",
    a: [
      { t: "为公司发光发热", s: 5 },
      { t: "计算周五倒计时", s: 3 },
      { t: "思考请假理由", s: 1 }
    ]
  },
  {
    q: "老板在群里发了一个“？”",
    a: [
      { t: "汗流浃背复盘", s: 5 },
      { t: "低头装死", s: 3 },
      { t: "搜索回怼模版", s: 1 }
    ]
  },
  {
    q: "你的奋斗观？",
    a: [
      { t: "卷死别人", s: 5 },
      { t: "死掉的美感", s: 1 },
      { t: "为了退休", s: 3 }
    ]
  },
  {
    q: "领导掉水里了？",
    a: [
      { t: "拍张照片", s: 1 },
      { t: "救人并谈需求", s: 5 },
      { t: "发朋友圈", s: 3 }
    ]
  },
  {
    q: "哪个更焦虑？",
    a: [
      { t: "余额", s: 3 },
      { t: "发量", s: 1 },
      { t: "我已成佛", s: 5 }
    ]
  }
];

const RESULTS = {
  ROMA: {
    name: "罗马",
    desc: "全办公室最终解决方案。你是上帝派来的，还是上辈子欠他们的？",
    min: 21
  },
  JUAN: {
    name: "卷你马",
    desc: "卷得连马看了都想退赛。建议直接去发电厂上班。",
    min: 16
  },
  HERMES: {
    name: "爱马仕",
    desc: "外表光鲜亮丽，内里全是延毕。",
    min: 11
  },
  WILD: {
    name: "野马分鬃",
    desc: "心在草原，人在工位。你的离职信改了80遍了吧？",
    min: 6
  },
  PURE: {
    name: "纯马马",
    desc: "除了吃饭睡觉，你没有任何多余动作。",
    min: 0
  }
};

// --- Utils ---
const getResultType = (score) => {
  if (score > 20) return RESULTS.ROMA;
  if (score >= 16) return RESULTS.JUAN;
  if (score >= 11) return RESULTS.HERMES;
  if (score >= 6) return RESULTS.WILD;
  return RESULTS.PURE;
};

// HSL Color Generator
const generateVisuals = (score, typeName) => {
  // Base Hue based on type to ensure distinct vibes, but with randomness
  let baseH;
  switch (typeName) {
    case "罗马": baseH = 280; break; // Purple/Royal
    case "卷你马": baseH = 140; break; // Green/Energy
    case "爱马仕": baseH = 30; break;  // Orange/Luxury
    case "野马分鬃": baseH = 200; break; // Blue/Freedom
    case "纯马马": baseH = 340; break; // Pink/Chill
    default: baseH = 0;
  }

  // Add random fluctuation (-20 to +20)
  const h = (baseH + Math.floor(Math.random() * 40 - 20) + 360) % 360;
  // Saturation: 60-90%
  const s = Math.floor(Math.random() * 30) + 60;
  // Lightness: 50-70% (ensure readability against dark bg if used as text, or vibrant as bg)
  const l = Math.floor(Math.random() * 20) + 50;

  const hex = hslToHex(h, s, l);
  const rarity = Math.floor(Math.random() * 100); // Simple random rarity

  return { hex, rarity, h, s, l };
};

const hslToHex = (h, s, l) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};

// --- Components ---

const Typewriter = ({ text, delay = 50 }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, delay);
    return () => clearInterval(timer);
  }, [text, delay]);

  return <span>{displayedText}</span>;
};

export default function App() {
  const [step, setStep] = useState('intro'); // intro, quiz, calculating, result
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [resultData, setResultData] = useState(null);
  const resultRef = useRef(null);

  const handleStart = () => setStep('quiz');

  const handleAnswer = (points) => {
    const newScore = score + points;
    setScore(newScore);
    
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setStep('calculating');
      // Simulate calculation delay for dramatic effect
      setTimeout(() => {
        const type = getResultType(newScore);
        const visuals = generateVisuals(newScore, type.name);
        setResultData({ ...type, ...visuals });
        setStep('result');
      }, 1500);
    }
  };

  const handleShare = async () => {
    if (resultRef.current) {
      try {
        const canvas = await html2canvas(resultRef.current, {
          backgroundColor: '#0a0a0a', // Force dark background for visibility
          useCORS: true, // Handle cross-origin images if any
          scale: 2, // High res
          logging: false,
        });
        const link = document.createElement('a');
        link.download = `2026_HORSE_${resultData.hex}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error("Snapshot failed", err);
        alert("保存失败，请截图分享");
      }
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-neutral-950 text-white font-sans overflow-hidden relative selection:bg-white/20">
      {/* Background Grid & Flow */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-neutral-950/50"></div>
        {/* Ambient Flow */}
        <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-purple-900/20 blur-[120px] rounded-full animate-flow-slow"></div>
        <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-blue-900/20 blur-[120px] rounded-full animate-flow-slow delay-1000"></div>
      </div>

      <div className="relative z-10 w-full h-full max-w-md mx-auto flex flex-col p-6 min-h-[100dvh]">
        
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col justify-center items-center text-center space-y-8"
            >
              <div className="space-y-2">
                <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                  2026
                </h1>
                <h2 className="text-2xl font-bold text-white/90 tracking-widest">
                  你是什么马
                </h2>
              </div>
              <p className="text-white/50 text-sm max-w-[260px] leading-relaxed">
                基于 HSL 算法与职场行为学的<br/>深度人格解析
              </p>
              <button 
                onClick={handleStart}
                className="group relative px-8 py-3 bg-white text-black font-bold rounded-full overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300"
              >
                <span className="relative z-10">START TEST</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </button>
            </motion.div>
          )}

          {step === 'quiz' && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex-1 flex flex-col justify-center"
            >
              <div className="mb-8">
                <span className="text-xs font-mono text-white/40 mb-2 block">
                  0{currentQ + 1} / 0{QUESTIONS.length}
                </span>
                <h3 className="text-2xl font-bold leading-tight">
                  {QUESTIONS[currentQ].q}
                </h3>
              </div>
              
              <div className="space-y-3">
                {QUESTIONS[currentQ].a.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(opt.s)}
                    className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all active:scale-[0.98] backdrop-blur-sm"
                  >
                    {opt.t}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 'calculating' && (
            <motion.div 
              key="calculating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col justify-center items-center"
            >
              <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin mb-4"></div>
              <p className="text-white/60 font-mono text-sm animate-pulse">ANALYZING HSL...</p>
            </motion.div>
          )}

          {step === 'result' && resultData && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex flex-col justify-center items-center py-4"
            >
              {/* Result Card */}
              <div 
                ref={resultRef}
                className="w-full relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/5 backdrop-blur-2xl p-8 flex flex-col items-center text-center shadow-2xl"
                style={{
                  boxShadow: `0 0 100px -20px ${resultData.hex}40`
                }}
              >
                {/* Dynamic Background Glow in Card */}
                <div 
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{ background: `radial-gradient(circle at 50% 0%, ${resultData.hex}, transparent 70%)` }}
                ></div>

                <div className="relative z-10 w-full">
                  <div className="flex justify-between items-center w-full mb-8 opacity-60">
                    <span className="font-mono text-[10px] tracking-widest">NO.2026</span>
                    <span className="font-mono text-[10px] tracking-widest">RARITY {resultData.rarity}%</span>
                  </div>

                  <h2 
                    className="text-4xl font-black mb-2 tracking-tight"
                    style={{ textShadow: `0 0 20px ${resultData.hex}` }}
                  >
                    {resultData.name}
                  </h2>
                  
                  <div className="my-8 relative group cursor-pointer">
                    <div className="text-6xl font-mono font-bold tracking-tighter opacity-90 transition-transform group-hover:scale-110 duration-500">
                      {resultData.hex}
                    </div>
                    <div className="text-[10px] font-mono text-white/40 mt-2">HEX COLOR CODE</div>
                  </div>

                  <div className="bg-black/20 rounded-xl p-4 mb-6 border border-white/5 min-h-[80px] flex items-center justify-center">
                    <p className="text-sm leading-relaxed text-white/90 font-medium">
                      <span className="text-white/40 mr-2">“</span>
                      <Typewriter text={resultData.desc} delay={40} />
                      <span className="text-white/40 ml-2">”</span>
                    </p>
                  </div>

                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-2">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${resultData.rarity}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full"
                      style={{ backgroundColor: resultData.hex }}
                    ></motion.div>
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-white/30">
                    <span>COMMON</span>
                    <span>SSR</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex gap-4 w-full max-w-[280px]">
                <button 
                  onClick={() => window.location.reload()}
                  className="flex-1 py-3 rounded-full border border-white/20 text-sm font-medium hover:bg-white/5 transition-colors"
                >
                  重测
                </button>
                <button 
                  onClick={handleShare}
                  className="flex-1 py-3 rounded-full bg-white text-black text-sm font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] transition-all flex items-center justify-center gap-2"
                >
                  <span>保存卡片</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

