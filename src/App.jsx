import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import html2canvas from 'html2canvas';
import { Download, RefreshCw, ScanBarcode } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import LongPressTrigger from './LongPressTrigger';
import { triggerHaptic } from './HapticUtils';
import TotemGenerator from './TotemGenerator';

// --- Data & Config ---
const QUESTIONS = [
  {
    id: 1,
    q: "周一清晨 7:30，闹钟响起的瞬间，你的第一生理反应是？",
    options: [
      { text: "垂死病中惊坐起，大喊一声“迟到了”！", weights: { execution: 5, mental_state: -3 } },
      { text: "很平静，在脑内预演了一遍辞职流程，然后起床刷牙", weights: { resignation: 4, scheming: 2 } },
      { text: "直接按掉，甚至觉得闹钟这种东西很多余（根本没睡）", weights: { mental_state: -5, resignation: 3 } },
      { text: "立刻发个朋友圈：“新的一周，加油！”（仅分组可见）", weights: { visibility: 5, execution: -2 } }
    ]
  },
  {
    id: 2,
    q: "早高峰地铁/校车上，你被挤成了肉饼，此时你在想：",
    options: [
      { text: "盯着旁边人的手机屏幕，看他在跟谁聊天", weights: { mental_state: -2, scheming: 3 } },
      { text: "单手回邮件/背单词，每一秒都是KPI", weights: { execution: 5, visibility: -1 } },
      { text: "我是谁？我在哪？这辆车是开往火葬场的吗？", weights: { resignation: 5, mental_state: 2 } },
      { text: "精心找角度拍一张“努力的自己”，配文“早安打工人”", weights: { visibility: 5, execution: 0 } }
    ]
  },
  {
    id: 3,
    q: "老板/导师突然在群里发了个红包，全员疯抢，你会：",
    options: [
      { text: "秒抢，并回复“谢谢老板，老板大气” x3", weights: { visibility: 4, scheming: 1 } },
      { text: "抢到了 0.01 元，但在心里记恨了他一整天", weights: { mental_state: -4, scheming: 2 } },
      { text: "根本没看群，两个小时后才发现错过了", weights: { resignation: 3, visibility: -5 } },
      { text: "不抢，怕拿了手短，之后不好意思拒绝加班", weights: { scheming: 5, execution: 2 } }
    ]
  },
  {
    id: 4,
    q: "面对一个明显不合理的需求（如：五彩斑斓的黑），你的对策是：",
    options: [
      { text: "硬着头皮做，一边做一边掉头发", weights: { execution: 5, mental_state: -5 } },
      { text: "甩锅给技术/下游：“这个实现不了，是底层架构问题”", weights: { scheming: 5, execution: -2 } },
      { text: "满口答应，然后拖到截止日期前一小时说电脑坏了", weights: { resignation: 4, visibility: -3 } },
      { text: "拉个会，把老板和甲方都拉进来，让他们自己打一架", weights: { scheming: 4, visibility: 3 } }
    ]
  },
  {
    id: 5,
    q: "午休时间，同事们在聊最近大火的 AI 裁员新闻，你：",
    options: [
      { text: "加入讨论，并暗示自己掌握了核心技术不怕裁", weights: { visibility: 4, mental_state: -2 } },
      { text: "表面附和，背地里已经把简历投给了那家 AI 公司", weights: { scheming: 5, execution: 3 } },
      { text: "带着耳机装睡，其实在听全损音质的白噪音", weights: { resignation: 5, visibility: -4 } },
      { text: "默默打开 ChatGPT，问它：“你会取代我吗？”", weights: { mental_state: -5, execution: 2 } }
    ]
  },
  {
    id: 6,
    q: "那个平时啥也不干的同事，PPT 做得比你花哨 10 倍还被表扬了：",
    options: [
      { text: "深夜独自破防，把键盘敲得噼里啪啦响", weights: { mental_state: -4, execution: 4 } },
      { text: "微笑点赞，然后在心里默默祝他电脑蓝屏", weights: { scheming: 3, visibility: 2 } },
      { text: "立刻学习他的模板，并试图搞得更花哨", weights: { execution: 3, visibility: 4 } },
      { text: "无所谓，反正公司倒闭了大家都得走人", weights: { resignation: 5, scheming: -2 } }
    ]
  },
  {
    id: 7,
    q: "如果 2026 年允许合法出售自己的“一部分”换钱，你卖什么？",
    options: [
      { text: "卖掉“焦虑”，只要能睡个好觉给钱就行", weights: { mental_state: -5, resignation: 2 } },
      { text: "卖掉“良心”，反正上班也用不到", weights: { scheming: 5, execution: 3 } },
      { text: "卖掉“头发”，因为已经不多了，不如清仓", weights: { execution: 4, visibility: -1 } },
      { text: "卖掉“老板”，这玩意儿有人收吗？", weights: { resignation: 4, scheming: 2 } }
    ]
  },
  {
    id: 8,
    q: "周五下午 17:59，领导突然发来消息：“在吗？有个急事”：",
    options: [
      { text: "秒回：“在的，您说！”，这就是肌肉记忆", weights: { execution: 5, resignation: -3 } },
      { text: "假装没看见，并在朋友圈发了一张在电影院的图（其实在马桶上）", weights: { scheming: 4, visibility: 3 } },
      { text: "直接回复：“现在的年轻人，都不看时间的吗？”（仅脑内演练）", weights: { mental_state: -3, resignation: 2 } },
      { text: "手机直接关机，物理断网，生死有命", weights: { resignation: 5, execution: -5 } }
    ]
  },
  {
    id: 9,
    q: "周末在家，窗外突然传来一声类似工作软件的消息提示音：",
    options: [
      { text: "瞬间心跳飙升，下意识去摸手机（PTSD）", weights: { mental_state: -5, execution: 3 } },
      { text: "淡定，我已经把手机扔进冰箱了", weights: { resignation: 4, visibility: -2 } },
      { text: "幻听而已，继续打游戏，但手在发抖", weights: { mental_state: -3, visibility: 2 } },
      { text: "立刻打开电脑，展现“随时待命”的专业素养", weights: { execution: 5, resignation: -3 } }
    ]
  },
  {
    id: 10,
    q: "今天其实啥也没干，但要写日报了，你的修辞手法是：",
    options: [
      { text: "“推进项目底层逻辑优化”（其实是整理了电脑桌面）", weights: { visibility: 5, scheming: 3 } },
      { text: "“深度调研竞品动态”（刷了一下午短视频）", weights: { scheming: 5, execution: -2 } },
      { text: "诚实地写“无产出”，主打一个真诚（摆烂）", weights: { resignation: 5, visibility: -3 } },
      { text: "复制粘贴昨天的，改个日期，赌没人看", weights: { execution: -2, scheming: 4 } }
    ]
  },
  {
    id: 11,
    q: "拿到年度体检报告的那一刻，你不敢打开是因为：",
    options: [
      { text: "怕查出绝症，房贷还没还完，不能死", weights: { execution: 5, mental_state: -3 } },
      { text: "怕查出没病，没有理由请长假休养了", weights: { resignation: 5, visibility: 2 } },
      { text: "怕查出甲状腺结节比业绩增长得还快", weights: { mental_state: -5, scheming: 2 } },
      { text: "直接扔垃圾桶，薛定谔的健康最健康", weights: { resignation: 3, mental_state: 3 } }
    ]
  },
  {
    id: 12,
    q: "团建 KTV，领导点了首《明天会更好》示意大家合唱，你：",
    options: [
      { text: "抢过麦克风，声泪俱下地领唱，比原唱还投入", weights: { visibility: 5, scheming: 4 } },
      { text: "躲在角落吃果盘，假装信号不好听不见", weights: { resignation: 4, visibility: -3 } },
      { text: "偷偷切歌，切了一首《大悲咒》", weights: { mental_state: 4, resignation: 5 } },
      { text: "机械性张嘴对口型，眼神空洞，仿佛被抽走了灵魂", weights: { execution: 3, mental_state: -2 } }
    ]
  }
];

const ARCHETYPES = {
  // Labor Group
  ROMAN: {
    id: 'ROMAN',
    name: 'ROMA',
    cnName: '罗马',
    desc: '全办公室最终解决方案。你是上帝派来的，还是上辈子欠他们的？',
    group: 'LABOR'
  },
  JUAN: {
    id: 'JUAN',
    name: 'JUAN',
    cnName: '卷你马',
    desc: '卷得连马看了都想退赛。建议直接去发电厂上班。',
    group: 'LABOR'
  },
  HERMES: {
    id: 'HERMES',
    name: 'HERMES',
    cnName: '爱马仕',
    desc: '外表光鲜亮丽，内里全是延毕。',
    group: 'LABOR'
  },
  // Performance Group
  TROJAN: {
    id: 'TROJAN',
    name: 'TROJAN',
    cnName: '特洛伊木马',
    desc: '看似空心，实则藏毒。你的每一次微笑都标好了价格。',
    group: 'PERFORMANCE'
  },
  CAROUSEL: {
    id: 'CAROUSEL',
    name: 'CAROUSEL',
    cnName: '旋转木马',
    desc: '原地转圈，还觉得自己挺美。除了头晕，你什么也没留下。',
    group: 'PERFORMANCE'
  },
  SWEAT: {
    id: 'SWEAT',
    name: 'SWEAT',
    cnName: '汗血宝马',
    desc: '跑得快，死得早。你的汗水是老板眼里的廉价润滑油。',
    group: 'PERFORMANCE'
  },
  // Transcendence Group
  WILD: {
    id: 'WILD',
    name: 'WILD',
    cnName: '野马分鬃',
    desc: '心在草原，人在工位。你的离职信改了80遍了吧？',
    group: 'TRANSCENDENCE'
  },
  STOIC: {
    id: 'STOIC',
    name: 'STOIC',
    cnName: '塞翁失马',
    desc: '丢了工作？没关系。丢了魂？也没关系。反正都是身外之物。',
    group: 'TRANSCENDENCE'
  },
  PIXEL: {
    id: 'PIXEL',
    name: 'PIXEL',
    cnName: '码赛克',
    desc: '由于存在感过低，系统无法解析你的生物特征。',
    group: 'TRANSCENDENCE'
  }
};

// --- Logic ---
const calculateResult = (scores) => {
  // Normalize scores to 0-100 range for radar chart
  // Assuming max possible score per dimension is roughly 5 * 8 = 40
  const normalized = {};
  Object.keys(scores).forEach(key => {
    // Add base value of 20 to avoid negative chart values, scale up
    normalized[key] = Math.min(100, Math.max(0, (scores[key] + 10) * 2.5));
  });

  const { scheming, execution, mental_state, visibility, resignation } = scores;

  // Decision Tree Logic
  if (resignation > 15 && mental_state < -10) return ARCHETYPES.STOIC;
  if (resignation > 20) return ARCHETYPES.WILD;
  if (visibility < -10 && execution < 5) return ARCHETYPES.PIXEL;
  
  if (scheming > 15 && visibility < 5) return ARCHETYPES.TROJAN;
  if (visibility > 20 && execution < 5) return ARCHETYPES.CAROUSEL;
  if (execution > 20 && visibility < 5) return ARCHETYPES.SWEAT;

  if (execution > 20 && scheming < 5) return ARCHETYPES.ROMAN;
  if (execution > 15 && mental_state < -15) return ARCHETYPES.JUAN;
  
  // Default fallback based on highest score
  const maxScore = Math.max(scheming, execution, mental_state, visibility, resignation);
  if (maxScore === visibility) return ARCHETYPES.HERMES;
  if (maxScore === scheming) return ARCHETYPES.TROJAN;
  
  return ARCHETYPES.ROMAN; // Ultimate fallback
};

export default function App() {
  const [step, setStep] = useState('intro');
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState({
    scheming: 0,
    execution: 0,
    mental_state: 0,
    visibility: 0,
    resignation: 0
  });
  const [resultData, setResultData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const resultRef = useRef(null);
  
  // Interaction States
  const [idleTimer, setIdleTimer] = useState(null);
  const [showIdleMockery, setShowIdleMockery] = useState(false);
  const [screenEffect, setScreenEffect] = useState(''); // 'vignette', 'glitch', ''

  // Reset idle timer on question change
  useEffect(() => {
    setShowIdleMockery(false);
    if (step === 'quiz') {
      const timer = setTimeout(() => {
        setShowIdleMockery(true);
      }, 6000);
      setIdleTimer(timer);
      return () => clearTimeout(timer);
    }
  }, [currentQ, step]);

  const handleStart = () => {
    triggerHaptic('tap');
    setStep('quiz');
  };

  const handleAnswer = (weights) => {
    triggerHaptic('clack');
    
    // Judgmental Effects
    if (weights.scheming > 3) {
      setScreenEffect('vignette');
      setTimeout(() => setScreenEffect(''), 300);
    } else if (weights.mental_state < -3) {
      setScreenEffect('glitch');
      setTimeout(() => setScreenEffect(''), 200);
    }

    const newScores = { ...scores };
    Object.keys(weights).forEach(key => {
      newScores[key] = (newScores[key] || 0) + weights[key];
    });
    setScores(newScores);

    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setStep('pre-submit'); // New step for long press
    }
  };

  const handleLongPressComplete = () => {
    setStep('calculating');
    setTimeout(() => {
      const archetype = calculateResult(scores);
      setResultData(archetype);
      
      // Prepare chart data
      const labels = {
        scheming: '伪装',
        execution: '耐磨',
        mental_state: '发疯',
        visibility: '摸鱼',
        resignation: '离职'
      };
      
      const scapegoat = Math.max(0, (scores.execution - scores.scheming) * 2);

      const data = [
        { subject: labels.mental_state, A: (Math.abs(scores.mental_state * 5) + 20) || 0, fullMark: 100 },
        { subject: labels.execution, A: (Math.max(0, scores.execution * 4) + 20) || 0, fullMark: 100 },
        { subject: labels.visibility, A: (Math.max(0, scores.visibility * 4) + 20) || 0, fullMark: 100 },
        { subject: '背锅', A: (scapegoat + 20) || 0, fullMark: 100 },
        { subject: labels.scheming, A: (Math.max(0, scores.scheming * 4) + 20) || 0, fullMark: 100 },
        { subject: labels.resignation, A: (Math.max(0, scores.resignation * 4) + 20) || 0, fullMark: 100 },
      ];
      setChartData(data);
      triggerHaptic('thud'); // Result landing
      setStep('result');
    }, 2000);
  };

  const handleShare = async () => {
    if (resultRef.current) {
      try {
        const canvas = await html2canvas(resultRef.current, {
          backgroundColor: '#F0EFE9',
          scale: 2,
          useCORS: true,
          logging: false,
        });
        const link = document.createElement('a');
        link.download = `2026_PSYCHE_${resultData.id}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error("Snapshot failed", err);
        alert("保存失败，请截图分享");
      }
    }
  };

  return (
    <div className={`min-h-[100dvh] w-full bg-[#F0EFE9] text-[#2D241E] font-sans overflow-hidden relative selection:bg-[#FF4400] selection:text-white transition-all duration-300 ${screenEffect === 'vignette' ? 'brightness-50' : ''} ${screenEffect === 'glitch' ? 'hue-rotate-90' : ''}`}>
      {/* Global Noise Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-40 z-0 bg-paper-noise mix-blend-multiply"></div>

      {/* Frame UI */}
      <div className="fixed inset-0 pointer-events-none z-50 p-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <ScanBarcode className="w-8 h-8 opacity-50" />
          <div className="text-right">
            <p className="font-mono text-[10px] tracking-widest">CONFIDENTIAL // 绝密</p>
            <p className="font-mono text-[10px] tracking-widest">AUTH_KEY: 2026-X</p>
          </div>
        </div>
        <div className="w-full h-1 bg-[#2D241E] opacity-10"></div>
      </div>

      <div className="relative z-10 w-full h-full max-w-md mx-auto flex flex-col p-6 min-h-[100dvh]">
        <AnimatePresence mode="wait">
          
          {/* INTRO */}
          {step === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col justify-center items-center text-center space-y-12"
            >
              {/* Restored Paper Grunge / Report Style Container */}
              <div className="border-4 border-[#2D241E] p-8 transform rotate-2 bg-[#F0EFE9] shadow-[8px_8px_0px_#2D241E] relative">
                <div className="absolute -top-3 -left-3 w-6 h-6 bg-[#FF4400] rounded-full border-2 border-[#2D241E]"></div>
                <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-[#FF4400] rounded-full border-2 border-[#2D241E]"></div>
                
                <h1 className="text-6xl font-black tracking-tighter leading-none font-serif-display text-[#2D241E] mb-2 mix-blend-multiply">
                  2026
                </h1>
                <div className="w-full h-1 bg-[#2D241E] mb-2"></div>
                <h2 className="text-xl font-bold uppercase tracking-widest font-mono">
                  Mental State<br/>Assessment
                </h2>
                <div className="absolute -right-6 -top-6 bg-[#FF4400] text-white text-xs font-bold px-2 py-1 transform rotate-12 border-2 border-[#2D241E] shadow-[2px_2px_0px_rgba(0,0,0,0.2)]">
                  CONFIDENTIAL
                </div>
              </div>

              <div className="space-y-4 max-w-[260px]">
                 <p className="font-mono text-xs text-left border-l-4 border-[#FF4400] pl-3 leading-relaxed opacity-80">
                  WARNING: 测试过程可能引发存在主义危机<br/>May cause existential crisis.
                </p>
              </div>

              <button 
                onClick={handleStart}
                className="w-full py-4 bg-[#2D241E] text-[#F0EFE9] font-black text-xl uppercase tracking-widest hover:bg-[#FF4400] hover:text-[#2D241E] transition-all shadow-[6px_6px_0px_rgba(0,0,0,0.2)] hover:translate-y-1 hover:shadow-[2px_2px_0px_rgba(0,0,0,0.2)] border-2 border-transparent"
              >
                开始诊断 / START
              </button>
            </motion.div>
          )}

          {/* QUIZ */}
          {step === 'quiz' && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex-1 flex flex-col justify-center relative"
            >
              {/* Idle Mockery Toast */}
              <AnimatePresence>
                {showIdleMockery && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute top-0 left-0 right-0 flex justify-center z-50 pointer-events-none"
                  >
                    <div className="bg-[#2D241E] text-[#F0EFE9] px-4 py-2 font-mono text-xs font-bold shadow-lg transform -rotate-1">
                      Hesitation detects guilt. (犹豫即是心虚)
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mb-8 relative">
                <span className="absolute -top-6 left-0 font-mono text-xs text-[#FF4400]">
                  // Q.0{currentQ + 1}
                </span>
                <h3 className="text-2xl font-bold leading-tight font-serif-display">
                  {QUESTIONS[currentQ].q}
                </h3>
              </div>
              
              <div className={`space-y-3 transition-all duration-500 ${showIdleMockery ? 'blur-[1px]' : ''}`}>
                {QUESTIONS[currentQ].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(opt.weights)}
                    className="w-full text-left p-5 border-2 border-[#2D241E] bg-[#F0EFE9] hover:bg-[#2D241E] hover:text-[#F0EFE9] transition-all duration-200 active:scale-[0.98] shadow-[4px_4px_0px_rgba(45,36,30,0.1)] hover:shadow-none"
                  >
                    <span className="font-mono text-xs opacity-50 mr-2">0{idx + 1}</span>
                    <span className="font-bold text-sm">{opt.text}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* PRE-SUBMIT (Long Press) */}
          {step === 'pre-submit' && (
            <motion.div
              key="pre-submit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col justify-center items-center text-center"
            >
              <h3 className="text-2xl font-black font-serif-display mb-2">FINAL STEP // 最终步骤</h3>
              <p className="font-mono text-xs opacity-60 max-w-[200px] mb-8">
                启动灵魂提取协议，请勿松手<br/>Initiating soul extraction protocol.
              </p>
              <LongPressTrigger onComplete={handleLongPressComplete} />
            </motion.div>
          )}

          {/* LOADING */}
          {step === 'calculating' && (
            <motion.div 
              key="calculating"
              className="flex-1 flex flex-col justify-center items-center"
            >
              <div className="w-full max-w-[200px] space-y-2">
                <div className="h-1 w-full bg-[#2D241E]/10 overflow-hidden">
                  <motion.div 
                    className="h-full bg-[#FF4400]"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "linear" }}
                  />
                </div>
                <div className="flex justify-between font-mono text-[10px]">
                  <span>生成诊断单 / GENERATING...</span>
                  <span>100%</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* RESULT */}
          {step === 'result' && resultData && (
            <motion.div 
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col justify-center items-center py-4"
            >
              <div 
                ref={resultRef}
                className="w-full relative bg-[#F0EFE9] text-[#2D241E] p-0 shadow-2xl overflow-hidden"
                style={{
                  clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
                  maskImage: "linear-gradient(to bottom, black 98%, transparent 100%)"
                }}
              >
                {/* Top Jagged Edge Simulation */}
                <div className="absolute top-0 left-0 w-full h-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMCAxMCIgcHJlc2VydmVBc3BlY3RSYXRpbz0ibm9uZSI+PHBhdGggZD0iTTAgMTAgTTEwIDAgTDIwIDEwIFoiIGZpbGw9IiNGMEVGRTkiLz48L3N2Zz4=')] bg-repeat-x bg-[length:20px_10px] transform -translate-y-full"></div>

                {/* Receipt Content */}
                <motion.div 
                  initial={{ y: -100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ type: "spring", damping: 20, stiffness: 100 }}
                  className="border-x-2 border-b-2 border-dashed border-[#2D241E]/20 p-6 flex flex-col items-center relative"
                >
                  {/* Totem Background */}
                  <TotemGenerator type={resultData.id} color="#2D241E" />

                  {/* Header */}
                  <div className="w-full flex justify-between items-end border-b-2 border-[#2D241E] pb-4 mb-6 relative z-10">
                    <div className="flex flex-col">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-[#FF4400]">PATIENT ID / 编号</span>
                      <span className="font-mono text-lg font-bold">NO.2026-{Math.floor(Math.random()*9000)+1000}</span>
                    </div>
                    <div className="h-8 w-32 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQwIj48cmVjdCB3aWR0aD0iMiIgaGVpZ2h0PSI0MCIgZmlsbD0iIzJEMjQxRSIvPjwvc3ZnPg==')] opacity-80"></div>
                  </div>

                  {/* Main Title */}
                  <div className="w-full text-left mb-6 relative z-10">
                    <h2 className="text-6xl font-black font-serif-display leading-none text-[#2D241E] mix-blend-multiply opacity-90">
                      {resultData.name}
                    </h2>
                    <h3 className="text-4xl font-black text-[#FF4400] absolute -bottom-2 left-1 mix-blend-multiply opacity-80 transform -rotate-1">
                      {resultData.cnName}
                    </h3>
                  </div>

                  {/* Radar Chart */}
                  <div className="w-full h-64 relative mb-6 z-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                        <PolarGrid stroke="#2D241E" strokeOpacity={0.2} />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#2D241E', fontSize: 10, fontFamily: 'monospace' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                          name="Psyche"
                          dataKey="A"
                          stroke="#FF4400"
                          strokeWidth={2}
                          fill="#FF4400"
                          fillOpacity={0.4}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                    
                    {/* Stamp Animation */}
                    <motion.div 
                      initial={{ scale: 3, opacity: 0, rotate: 20 }}
                      animate={{ scale: 1, opacity: 0.8, rotate: -10 }}
                      transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 10 }}
                      className="absolute bottom-0 right-0 w-24 h-24 border-4 border-red-700 rounded-full flex items-center justify-center mix-blend-multiply text-red-700 font-black uppercase tracking-widest text-xs p-2 text-center transform rotate-[-15deg] opacity-80 mask-image:url(noise)"
                      style={{ boxShadow: "inset 0 0 0 2px red" }}
                    >
                      HIGHLY<br/>UNSTABLE<br/>精神高危
                    </motion.div>
                  </div>

                  {/* Diagnosis */}
                  <div className="w-full bg-[#2D241E]/5 p-4 border-l-2 border-[#2D241E] relative z-10">
                    <p className="font-mono text-[9px] uppercase text-[#2D241E]/50 mb-1">CLINICAL OBSERVATION / 临床观察:</p>
                    <p className="font-handwriting text-xl leading-snug text-[#2D241E] transform -rotate-1">
                      "{resultData.desc}"
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="w-full mt-8 pt-4 border-t border-dashed border-[#2D241E]/40 flex justify-between items-center font-mono text-[9px] uppercase text-[#2D241E]/60 relative z-10">
                    <span>DATE / 日期: FEB 02 2026</span>
                    <span>SIGNATURE / 医师签名</span>
                  </div>

                </motion.div>
              </div>

              {/* Actions */}
              <div className="mt-8 flex gap-4 w-full max-w-[280px]">
                <button 
                  onClick={() => window.location.reload()}
                  className="flex-1 py-3 border-2 border-[#2D241E] bg-transparent text-xs font-bold uppercase hover:bg-[#2D241E] hover:text-[#F0EFE9] transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} />
                  重测 / RETRY
                </button>
                <button 
                  onClick={handleShare}
                  className="flex-1 py-3 bg-[#FF4400] text-white border-2 border-[#2D241E] text-xs font-bold uppercase hover:shadow-lg transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0px_#2D241E]"
                >
                  <Download size={14} />
                  保存 / SAVE
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
