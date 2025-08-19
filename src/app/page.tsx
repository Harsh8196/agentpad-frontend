'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Bot, GitBranch, Send, Shield, Zap, Wallet, Play, Network, Database, Calculator, Clock } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // If the user is logged in, skip the landing and go to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-white">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-transparent" />
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(156,163,175,0.08) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
        />
      </div>

      {/* Hero (shown when not authenticated) */}
      <section className="relative z-10 container mx-auto px-6 py-10 md:py-14 lg:py-14 min-h-[60vh] flex items-center">
        <div className="grid gap-10 items-center w-full">
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs mb-4">
              <span className="mr-2 inline-block h-2 w-2 rounded-full bg-blue-400" /> Automation for SEI, powered by AI
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Build and run automated DeFi flows with
              <div className="inline-block ml-2">
                <img src="/agentpad-logo.svg" alt="AgentPad" className="h-12 md:h-16" />
              </div>
            </h1>
            <p className="mt-4 text-gray-300 text-lg md:text-xl">
              Visual flows. LLM decisions. On-chain actions. Design strategies that execute themselves — safely and transparently.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {user ? (
                <Link href="/dashboard" className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors font-semibold shadow-lg">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/auth/login" className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors font-semibold shadow-lg">
                    Login
                  </Link>
                  <Link href="/auth/register" className="px-5 py-3 rounded-xl bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors font-semibold">
                    Sign up
                  </Link>
                </>
              )}
            </div>
            <div className="mt-6 flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-green-400" /> Guardrails & Approvals</div>
              <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-yellow-400" /> Real-time Execution</div>
              <div className="flex items-center gap-2"><Wallet className="h-4 w-4 text-blue-400" /> sei-agent-kit</div>
            </div>
          </div>

          {/* Spacer on right in hero; full-width sim below */}
          <div className="hidden md:block" />
        </div>
      </section>

      {/* Full-width simulation band */}
      <section className="relative z-10 w-full py-8 md:py-10">
        <div className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute left-1/4 top-0 h-48 w-48 md:h-72 md:w-72 bg-blue-500/10 blur-3xl rounded-full" />
          <div className="absolute right-1/5 bottom-0 h-48 w-48 md:h-72 md:w-72 bg-purple-500/10 blur-3xl rounded-full" />
        </div>
        <div className="container mx-auto px-6">
          <FlowShowcase />
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 container mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          <FeatureCard icon={<Bot className="h-5 w-5" />} title="LLM Action Engine" desc="Use large models to choose actions, not just chat — return strict JSON plans your flows can execute." />
          <FeatureCard icon={<GitBranch className="h-5 w-5" />} title="Visual Flow Builder" desc="Compose nodes for logic, blockchain ops, notifications, and approvals with instant feedback." />
          <FeatureCard icon={<Send className="h-5 w-5" />} title="Human-in-the-loop" desc="Pause for approvals via Telegram, then resume automatically with full audit logs." />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-gray-800/50 border border-gray-700 p-5 backdrop-blur-sm hover:border-blue-500/50 transition-colors">
      <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-blue-500/10 text-blue-300 mb-3">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </div>
  );
}

type SimNode = { id: string; label: string; desc?: string; x: number; y: number; icon: React.ReactNode; color: string };
type SimEdge = { from: number; to: number };
type SimFlow = { key: string; title: string; blurb: string; nodes: SimNode[]; edges: SimEdge[] };

function FlowShowcase() {
  const nodeBase = 'rounded-xl bg-gray-900/70 border border-gray-700 shadow-sm px-4 py-3 text-sm text-gray-200 backdrop-blur-sm';
  const pill = 'absolute -top-2 left-3 text-[10px] px-2 py-0.5 rounded-full border';

  // Define several simplified flows based on our node types
  const flows: SimFlow[] = useMemo(() => [
    {
      key: 'wallet-ops',
      title: 'Automate Wallet Operations',
      blurb: 'Top up wallet when balance drops below threshold.',
      nodes: [
        { id: 'event', label: 'Event', desc: 'Wallet Activity', x: 20, y: 12, icon: <Play className="h-4 w-4" />, color: 'text-emerald-300 border-emerald-500/40' },
        { id: 'wallet', label: 'Wallet', desc: 'Read balance', x: 35, y: 32, icon: <Wallet className="h-4 w-4" />, color: 'text-blue-300 border-blue-500/40' },
        { id: 'if', label: 'IF', desc: 'Balance < 10 SEI', x: 50, y: 52, icon: <GitBranch className="h-4 w-4" />, color: 'text-amber-300 border-amber-500/40' },
        { id: 'transfer', label: 'Transfer', desc: 'Top-up', x: 70, y: 72, icon: <Send className="h-4 w-4" />, color: 'text-purple-300 border-purple-500/40' },
      ],
      edges: [ { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 } ],
    },
    {
      key: 'auto-trade',
      title: 'Automate Trading',
      blurb: 'Buy/Sell when target price is reached.',
      nodes: [
        { id: 'timer', label: 'Timer', desc: 'Every minute', x: 20, y: 20, icon: <Clock className="h-4 w-4" />, color: 'text-emerald-300 border-emerald-500/40' },
        { id: 'market', label: 'Market Data', desc: 'Check price', x: 40, y: 30, icon: <Database className="h-4 w-4" />, color: 'text-blue-300 border-blue-500/40' },
        { id: 'if', label: 'IF', desc: 'Price < target', x: 60, y: 50, icon: <GitBranch className="h-4 w-4" />, color: 'text-amber-300 border-amber-500/40' },
        { id: 'trade', label: 'Swap', desc: 'Buy SEI', x: 80, y: 65, icon: <Calculator className="h-4 w-4" />, color: 'text-pink-300 border-pink-500/40' },
      ],
      edges: [ { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 } ],
    },
    {
      key: 'claim-rewards',
      title: 'Auto Claim Rewards',
      blurb: 'Claim LP rewards daily without manual steps.',
      nodes: [
        { id: 'timer', label: 'Timer', desc: 'Every 24h', x: 30, y: 18, icon: <Clock className="h-4 w-4" />, color: 'text-emerald-300 border-emerald-500/40' },
        { id: 'contract', label: 'Contract', desc: 'Claim reward', x: 58, y: 48, icon: <Network className="h-4 w-4" />, color: 'text-purple-300 border-purple-500/40' },
      ],
      edges: [ { from: 0, to: 1 } ],
    },
  ], []);

  const [flowIdx, setFlowIdx] = useState(0);
  const [edgeActive, setEdgeActive] = useState(0);

  // Auto-rotate flows and animate edges
  useEffect(() => {
    const edgeTimer = setInterval(() => {
      setEdgeActive((a) => a + 1);
    }, 900);
    const flowTimer = setInterval(() => {
      setFlowIdx((i) => (i + 1) % flows.length);
      setEdgeActive(0);
    }, 6000);
    return () => { clearInterval(edgeTimer); clearInterval(flowTimer); };
  }, [flows.length]);

  const flow = flows[flowIdx];

  // Helper to render smooth connector between two points in a 0-100 SVG viewBox
  const getSmoothPath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    if (dy >= dx) {
      const midY = (y1 + y2) / 2;
      return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
    }
    const midX = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch min-h-[460px]">
      {/* Left Panel - Flow Description */}
      <div className="lg:col-span-3 bg-gray-900/60 border border-gray-700 rounded-xl p-6 h-full flex flex-col justify-start">
        <h3 className="text-xl font-semibold text-white mb-4">{flow.title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{flow.blurb}</p>
      </div>

      {/* Center Panel - Flow Visualization */}
      <div className="lg:col-span-6 bg-gray-900/60 border border-gray-700 rounded-xl p-6 relative">
        <div className="relative h-full min-h-[420px] w-full">
          {/* Connection Lines */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {flow.edges.map((e, i) => {
              const a = flow.nodes[e.from];
              const b = flow.nodes[e.to];
              const isActive = i < edgeActive;
              const d = getSmoothPath(a.x, a.y, b.x, b.y);
              return (
                <g key={`e-${flow.key}-${i}`}>
                  <path d={d} fill="none" stroke={isActive ? '#3B82F6' : '#475569'} strokeWidth={isActive ? 1.8 : 1.2} />
                  <circle cx={a.x} cy={a.y} r={1.2} fill={isActive ? '#93C5FD' : '#94a3b8'} />
                  <circle cx={b.x} cy={b.y} r={1.2} fill={isActive ? '#93C5FD' : '#94a3b8'} />
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {flow.nodes.map((n, idx) => (
            <div
              key={n.id}
              className="absolute"
              style={{ 
                left: `calc(${n.x}% - 80px)`, 
                top: `calc(${n.y}% - 30px)`, 
                width: '160px' 
              }}
            >
              {/* Node Circle */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full bg-gray-800 border-2 ${n.color.replace('bg-', 'border-')} flex items-center justify-center mb-2 relative`}>
                  <div className="text-lg">{n.icon}</div>
                  {edgeActive === idx && (
                    <div className="absolute -inset-1 rounded-full border-2 border-blue-400 animate-ping"></div>
                  )}
                </div>
                
                {/* Node Label */}
                <div className={`${n.color} px-3 py-1 rounded-full text-xs text-white text-center whitespace-nowrap mb-1`}>
                  {n.label}
                </div>
                
                {/* Node Description */}
                <div className="text-xs text-gray-500 text-center max-w-[140px]">
                  {n.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Flow Selector */}
      <div className="lg:col-span-3 bg-gray-900/60 border border-gray-700 rounded-xl p-4 h-full">
        <div className="flex flex-col gap-3">
          {flows.map((f, i) => (
            <button
              key={f.key}
              onClick={() => { setFlowIdx(i); setEdgeActive(0); }}
              className={`p-3 text-sm rounded-lg border text-left transition-all whitespace-nowrap w-full ${
                i === flowIdx 
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg' 
                  : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs">📊</span>
                <span className="font-medium">{f.title}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function LogLines({ active }: { active: number }) {
  const lines = [
    '▶ Start: initializing variables... ✓',
    '🤖 LLM: analyzing portfolio and choosing action...',
    '⏱ Condition: confidence >= medium? ✓',
    '✉ Telegram: sent approval request',
    '⛓ Blockchain: executing transaction... ✓',
  ];
  return (
    <div className="space-y-1">
      {lines.map((l, i) => (
        <div key={i} className={`transition-opacity ${i <= active ? 'opacity-100' : 'opacity-40'}`}>{l}</div>
      ))}
    </div>
  );
}
