"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Brain,
  Check,
  ChevronRight,
  CircleAlert,
  Database,
  Radar,
  ShieldAlert,
  Sparkles,
  TrendingDown,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const analysisSteps = [
  {
    title: "Scanning transaction stream",
    description: "Analyzing 1,842 recent payment events",
    icon: Database,
  },
  {
    title: "Detecting anomaly patterns",
    description: "Comparing current failures against baseline",
    icon: Radar,
  },
  {
    title: "Identifying failure concentration",
    description: "Grouping transactions by payment method",
    icon: TrendingDown,
  },
  {
    title: "Generating recovery strategy",
    description: "Ranking recovery opportunities by probability",
    icon: Brain,
  },
];

const transactions = [
  {
    method: "UPI",
    affected: 89,
    failure: "18.6%",
    risk: "₹34,200",
    severity: "Critical",
  },
  {
    method: "Cards",
    affected: 24,
    failure: "5.1%",
    risk: "₹9,800",
    severity: "Medium",
  },
  {
    method: "Net Banking",
    affected: 14,
    failure: "2.8%",
    risk: "₹4,500",
    severity: "Low",
  },
];

export default function InvestigationPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (activeStep < analysisSteps.length - 1) {
      const timer = setTimeout(() => {
        setActiveStep((prev) => prev + 1);
      }, 1200);

      return () => clearTimeout(timer);
    }

    const completeTimer = setTimeout(() => {
      setComplete(true);
    }, 1400);

    return () => clearTimeout(completeTimer);
  }, [activeStep]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060816] text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 80, -30, 0],
            y: [0, 40, -20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-32 top-0 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px]"
        />

        <motion.div
          animate={{
            x: [0, -50, 30, 0],
            y: [0, 70, 20, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-[-100px] top-[20%] h-[450px] w-[450px] rounded-full bg-cyan-500/10 blur-[120px]"
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-8 md:px-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <Link
            href="/"
            className="group flex items-center gap-3 text-sm text-slate-400 transition hover:text-white"
          >
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 transition group-hover:bg-white/[0.08]">
              <ArrowLeft size={18} />
            </div>

            Back to Command Center
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2">
            <Sparkles size={14} className="text-violet-400" />
            <span className="text-xs font-medium text-violet-300">
              AI INVESTIGATION
            </span>
          </div>
        </motion.header>

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-12"
        >
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-rose-400" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">
                  Incident #REC-2026-001
                </span>
              </div>

              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                Investigating the anomaly.
              </h1>

              <p className="mt-4 max-w-2xl leading-relaxed text-slate-400">
                RECOVR is analyzing transaction behavior, identifying the root
                cause, and calculating the safest recovery opportunity.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-5 py-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Transactions analyzed
              </p>

              <p className="mt-2 text-2xl font-semibold">
                {complete ? "1,842" : `${Math.min(1842, (activeStep + 1) * 460)}`}
                <span className="text-sm text-slate-500"> / 1,842</span>
              </p>
            </div>
          </div>
        </motion.section>

        {/* Analysis Engine */}
        <section className="mt-10 grid gap-6 lg:grid-cols-12">
          {/* Steps */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl border border-white/[0.08] bg-[#0b0f1d]/70 p-6 backdrop-blur-xl lg:col-span-7"
          >
            <div className="mb-8 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400">
                    <Brain size={21} />
                  </div>

                  <div>
                    <h2 className="font-semibold">RECOVR Reasoning Engine</h2>
                    <p className="text-xs text-slate-500">
                      Agentic incident analysis
                    </p>
                  </div>
                </div>
              </div>

              <span className="flex items-center gap-2 text-xs text-emerald-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                LIVE
              </span>
            </div>

            <div className="space-y-3">
              {analysisSteps.map((step, index) => {
                const Icon = step.icon;
                const isComplete = index < activeStep || complete;
                const isActive = index === activeStep && !complete;

                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.08 }}
                    className={`relative flex items-center gap-4 overflow-hidden rounded-2xl border p-4 transition ${
                      isActive
                        ? "border-violet-400/30 bg-violet-500/[0.08]"
                        : isComplete
                        ? "border-emerald-400/15 bg-emerald-500/[0.04]"
                        : "border-white/[0.06] bg-white/[0.02]"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="scanner"
                        className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-violet-400 to-cyan-400"
                      />
                    )}

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                        isComplete
                          ? "bg-emerald-500/15 text-emerald-400"
                          : isActive
                          ? "bg-violet-500/20 text-violet-300"
                          : "bg-white/[0.04] text-slate-500"
                      }`}
                    >
                      {isComplete ? (
                        <Check size={19} />
                      ) : (
                        <Icon size={19} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium ${
                          isActive || isComplete
                            ? "text-white"
                            : "text-slate-500"
                        }`}
                      >
                        {step.title}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {step.description}
                      </p>
                    </div>

                    {isActive && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="h-5 w-5 rounded-full border-2 border-violet-400 border-t-transparent"
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Agent status */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-b from-violet-500/[0.12] to-[#0b0f1d]/80 p-6 lg:col-span-5"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.65, 0.3],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute left-1/2 top-8 h-32 w-32 -translate-x-1/2 rounded-full bg-violet-500/30 blur-[50px]"
            />

            <div className="relative text-center">
              <motion.div
                animate={{
                  rotate: complete ? 0 : [0, 8, -8, 0],
                  scale: complete ? 1 : [1, 1.05, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: complete ? 0 : Infinity,
                }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-violet-500 to-cyan-400 shadow-2xl shadow-violet-500/30"
              >
                {complete ? <Check size={34} /> : <Sparkles size={32} />}
              </motion.div>

              <h3 className="mt-7 text-xl font-semibold">
                {complete
                  ? "Investigation Complete"
                  : "RECOVR Agent is Thinking"}
              </h3>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-400">
                {complete
                  ? "Root cause identified. Recovery opportunities are ready for review."
                  : "Connecting transaction signals and searching for the highest-confidence explanation."}
              </p>

              <div className="mt-8">
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-slate-500">ANALYSIS PROGRESS</span>
                  <span className="text-cyan-400">
                    {complete
                      ? "100%"
                      : `${Math.round(((activeStep + 1) / 4) * 100)}%`}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    animate={{
                      width: complete
                        ? "100%"
                        : `${((activeStep + 1) / 4) * 100}%`,
                    }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-400 to-cyan-400"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Results */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: complete ? 1 : 0.45, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mt-6"
        >
          <div className="mb-5 flex items-center gap-3">
            <CircleAlert className="text-rose-400" />
            <div>
              <h2 className="font-semibold">Incident Diagnosis</h2>
              <p className="text-xs text-slate-500">
                Root-cause evidence and payment concentration
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {transactions.map((transaction, index) => (
              <motion.div
                key={transaction.method}
                whileHover={complete ? { y: -4 } : {}}
                className="rounded-3xl border border-white/[0.08] bg-[#0b0f1d]/70 p-5 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{transaction.method}</p>

                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                      transaction.severity === "Critical"
                        ? "bg-rose-500/10 text-rose-400"
                        : transaction.severity === "Medium"
                        ? "bg-amber-500/10 text-amber-400"
                        : "bg-emerald-500/10 text-emerald-400"
                    }`}
                  >
                    {transaction.severity}
                  </span>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500">Affected</p>
                    <p className="mt-1 text-lg font-semibold">
                      {transaction.affected}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Failure Rate</p>
                    <p className="mt-1 text-lg font-semibold text-rose-400">
                      {transaction.failure}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-white/[0.03] p-3">
                  <p className="text-xs text-slate-500">Revenue Exposure</p>
                  <p className="mt-1 font-semibold">{transaction.risk}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Root Cause */}
        {complete && (
          <motion.section
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-3xl border border-cyan-400/20 bg-gradient-to-r from-cyan-500/[0.08] via-violet-500/[0.06] to-transparent p-6"
          >
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div className="flex gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10">
                  <Zap className="text-cyan-400" />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                    AI Root Cause
                  </p>

                  <h2 className="mt-2 text-xl font-semibold">
                    UPI provider degradation is the primary failure cluster.
                  </h2>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                    70% of affected transactions originated from UPI payments.
                    The pattern exceeds historical variance and indicates a
                    temporary provider-side degradation rather than individual
                    customer payment issues.
                  </p>
                </div>
              </div>

              <Link
                href="/recovery"
                className="flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3.5 text-sm font-semibold shadow-lg shadow-violet-500/20"
              >
                Build Recovery Plan
                <ChevronRight size={17} />
              </Link>
            </div>
          </motion.section>
        )}

        {!complete && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
            <ShieldAlert size={16} />
            Recovery actions remain locked until investigation completes.
          </div>
        )}
      </div>
    </main>
  );
}