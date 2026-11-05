import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Zap,
  Radio,
  BarChart3,
  Users,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Share2,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function Landing() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Radio,
      title: 'Sub-50ms Real-Time Updates',
      desc: 'Powered by Go, Redis Pub/Sub, and WebSockets. As soon as an audience member votes, every screen updates instantaneously.',
      gradient: 'from-pulse-500 to-indigo-600',
    },
    {
      icon: ShieldCheck,
      title: 'Bulletproof Fraud & Duplicate Protection',
      desc: 'MongoDB transactional uniqueness, server-issued voter tracking tokens, and strict server-side validation guarantee vote integrity.',
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      icon: BarChart3,
      title: 'Interactive Visual Analytics',
      desc: 'Explore real-time percentage breakdowns, animated progress indicators, and dynamic bar charts powered by Recharts.',
      gradient: 'from-cyan-500 to-blue-600',
    },
    {
      icon: Share2,
      title: 'Instant QR & One-Click Sharing',
      desc: 'Audience members join from mobile or desktop simply by scanning a QR code or opening a URL. Zero account required.',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      icon: Zap,
      title: 'SaaS-Grade Go Backend',
      desc: 'Engineered with the Gin framework for blazing fast concurrent throughput, memory safety, and minimal CPU footprint.',
      gradient: 'from-rose-500 to-pink-600',
    },
    {
      icon: Users,
      title: 'Live Viewer & Participant Tracking',
      desc: 'Always know who is active. Real-time participant counters broadcast live room occupancy across all connected peers.',
      gradient: 'from-purple-500 to-pulse-600',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Draft Your Poll',
      desc: 'Create single or multiple-choice questions with customized options, descriptions, and optional expiration limits.',
    },
    {
      step: '02',
      title: 'Share Anywhere Instantly',
      desc: 'Project the generated QR code or send the shareable link in presentations, live streams, classrooms, or all-hands meetings.',
    },
    {
      step: '03',
      title: 'Watch Results Pulse Live',
      desc: 'Redis aggregates the incoming votes while WebSockets distribute the live tally to every viewer without refreshing.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-navy-950 transition-colors duration-200">
      {/* Background radial gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[650px] pulse-gradient-glow pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-36 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-8">
        {/* Release Pill Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-pulse-500/10 border border-pulse-500/20 text-pulse-600 dark:text-pulse-400 text-xs font-semibold shadow-sm animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
          <span>PULSE 1.0 – Next-Gen Live Audience Engagement</span>
          <span className="text-slate-400 dark:text-slate-600">•</span>
          <span className="text-slate-600 dark:text-slate-300">Live Demo</span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
            Make Every Vote Count.{' '}
            <span className="bg-gradient-to-r from-pulse-600 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Live.
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Create interactive polls, share them instantly, and watch opinions come alive with real-time results.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to={isAuthenticated ? '/polls/create' : '/register'}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold bg-gradient-to-r from-pulse-600 to-indigo-600 hover:from-pulse-500 hover:to-indigo-500 text-white shadow-xl shadow-pulse-500/25 flex items-center justify-center space-x-2.5 transition-all transform hover:-translate-y-0.5"
          >
            <span>{isAuthenticated ? 'Create New Poll' : 'Get Started Free'}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to={isAuthenticated ? '/dashboard' : '/login'}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold glass-panel text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 border border-slate-200 dark:border-navy-700 transition-all"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Live Demo & Login'}
          </Link>
        </div>

        {/* Animated Dashboard Live Preview Card */}
        <div className="mt-16 relative max-w-5xl mx-auto">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-pulse-600 via-indigo-600 to-cyan-500 opacity-20 blur-xl group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative rounded-2xl border border-slate-200/80 dark:border-navy-800 bg-white/90 dark:bg-navy-900/90 backdrop-blur-xl shadow-2xl p-6 sm:p-8 text-left space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-800 pb-4">
              <div className="flex items-center space-x-3">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="text-xs font-mono text-slate-400 pl-2">live-stream.pulse.dev</span>
              </div>
              <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>248 Live Viewers</span>
              </div>
            </div>

            {/* Poll question simulation */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-pulse-600 dark:text-pulse-400">
                Live Poll Showcase
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                What is your team&apos;s primary backend language for high-concurrency microservices?
              </h2>
            </div>

            {/* Simulated Live Options */}
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-pulse-600 dark:text-pulse-400">Go (Golang)</span>
                  <span className="text-slate-900 dark:text-white font-bold">58.4% (1,420 votes)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-navy-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-pulse-600 to-indigo-500 rounded-full w-[58.4%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">Rust</span>
                  <span className="text-slate-900 dark:text-white font-bold">24.2% (588 votes)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-navy-800 overflow-hidden">
                  <div className="h-full bg-slate-400 dark:bg-navy-600 rounded-full w-[24.2%]" />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">Node.js / TypeScript</span>
                  <span className="text-slate-900 dark:text-white font-bold">17.4% (423 votes)</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-navy-800 overflow-hidden">
                  <div className="h-full bg-slate-400 dark:bg-navy-600 rounded-full w-[17.4%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-xs font-bold uppercase tracking-wider text-pulse-600 dark:text-pulse-400">
            Engineered For Scale
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Built from scratch for sub-second precision.
          </p>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Zero fake polling intervals. Zero simulated mock streams. Real Go backend, real Redis Pub/Sub, real WebSockets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-2xl p-6 bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-slate-100/60 dark:bg-navy-900/40 border-y border-slate-200/80 dark:border-navy-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-pulse-600 dark:text-pulse-400">
              Simple Three-Step Flow
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              From concept to live votes in 30 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((st, idx) => (
              <div
                key={idx}
                className="relative p-8 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200/80 dark:border-navy-800 space-y-4 shadow-sm"
              >
                <span className="font-mono text-3xl font-black text-pulse-600 dark:text-pulse-400">
                  {st.step}
                </span>
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">
                  {st.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center">
        <div className="relative rounded-3xl overflow-hidden p-10 sm:p-14 bg-gradient-to-br from-pulse-600 via-indigo-700 to-navy-900 text-white shadow-2xl">
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to feel the pulse of your audience?
            </h2>
            <p className="text-pulse-100 text-sm sm:text-base">
              Join live polls, engage participants in real time, and inspect instant visual data.
            </p>
            <div className="pt-2">
              <Link
                to="/register"
                className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl font-bold bg-white text-pulse-700 hover:bg-slate-100 shadow-lg shadow-black/10 transition-transform transform hover:-translate-y-0.5"
              >
                <span>Launch Your First Poll</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Landing;

