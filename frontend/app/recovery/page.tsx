"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Lock,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getRecoveryPlan } from "../../lib/api";

type RecoveryCandidate = {
  transaction_id: string;
  amount: number;
  strategy: string;
  recovery_probability: number;
  priority_score: number;
};

type RecoveryPlanData = {
  recovery_available: boolean;
  incident?: {
    provider?: string;
    payment_method?: string;
  };
  root_cause_analysis?: {
    root_cause?: string;
    confidence?: number;
  };
  recovery_plan?: {
    strategy?: string;
    strategy_description?: string;
    root_cause?: string;
    candidate_count?: number;
    selected_candidates?: RecoveryCandidate[];
    potential_recovery?: number;
    expected_recovery?: number;
  };
};

export default function RecoveryPage() {
  const [approved, setApproved] = useState(false);

  const [recoveryData, setRecoveryData] =
    useState<RecoveryPlanData | null>(null);

  const [loadingPlan, setLoadingPlan] = useState(true);

  const [planError, setPlanError] = useState("");

  const fetchRecoveryPlan = async () => {
    try {
      setLoadingPlan(true);
      setPlanError("");

      const data = await getRecoveryPlan();

      console.log("RECOVR Recovery Plan:", data);

      setRecoveryData(data);
    } catch (error) {
      console.error("Failed to load recovery plan:", error);

      setPlanError(
        "Unable to connect to the RECOVR recovery intelligence engine."
      );
    } finally {
      setLoadingPlan(false);
    }
  };

  useEffect(() => {
    fetchRecoveryPlan();
  }, []);

  const plan = recoveryData?.recovery_plan;

  const recoveryCandidates =
    plan?.selected_candidates || [];

  const totalRecoverable =
    plan?.potential_recovery || 0;

  const expectedRecovery =
    plan?.expected_recovery || 0;

  const candidateCount =
    plan?.candidate_count ||
    recoveryCandidates.length;

  const averageConfidence =
    recoveryCandidates.length > 0
      ? Math.round(
          recoveryCandidates.reduce(
            (total, candidate) =>
              total + candidate.recovery_probability,
            0
          ) / recoveryCandidates.length
        )
      : 0;

  const rootCause =
    plan?.root_cause ||
    recoveryData?.root_cause_analysis?.root_cause ||
    "ANALYZING";

  const strategy =
    plan?.strategy || "RECOVERY STRATEGY";

  const strategyDescription =
    plan?.strategy_description ||
    "RECOVR is analyzing the safest recovery workflow.";

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060816] text-white">
      {/* Animated Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 70, -40, 0],
            y: [0, 40, -20, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-40 top-0 h-[550px] w-[550px] rounded-full bg-violet-600/10 blur-[130px]"
        />

        <motion.div
          animate={{
            x: [0, -70, 30, 0],
            y: [0, 50, 80, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-[-150px] top-[20%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[130px]"
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
            href="/investigation"
            className="group flex items-center gap-3 text-sm text-slate-400 transition hover:text-white"
          >
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 transition group-hover:bg-white/[0.08]">
              <ArrowLeft size={18} />
            </div>

            Back to Investigation
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2">
            <Sparkles size={14} className="text-emerald-400" />

            <span className="text-xs font-medium text-emerald-300">
              {loadingPlan
                ? "GENERATING STRATEGY"
                : "RECOVERY STRATEGY READY"}
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
                <Target size={15} className="text-cyan-400" />

                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
                  AI Recovery Orchestration
                </span>
              </div>

              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
                {loadingPlan
                  ? "Generating recovery plan..."
                  : "Recovery plan generated."}
              </h1>

              <p className="mt-4 max-w-2xl leading-relaxed text-slate-400">
                RECOVR analyzed the incident and selected the safest,
                highest-confidence recovery opportunities based on the
                detected failure pattern.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.05] px-5 py-4">
              <p className="text-xs uppercase tracking-wider text-slate-500">
                Expected Recovery
              </p>

              <p className="mt-2 text-2xl font-semibold text-emerald-400">
                {loadingPlan
                  ? "Analyzing..."
                  : formatCurrency(expectedRecovery)}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Loading State */}
        {loadingPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-10 flex items-center justify-center rounded-3xl border border-violet-400/15 bg-violet-500/[0.04] p-10"
          >
            <div className="flex flex-col items-center gap-4">
              <RefreshCw
                size={30}
                className="animate-spin text-violet-400"
              />

              <div className="text-center">
                <p className="font-medium">
                  RECOVR Intelligence Engine is working
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Scoring recovery opportunities and selecting the
                  highest-priority transactions...
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {!loadingPlan && planError && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 rounded-3xl border border-red-400/20 bg-red-500/[0.06] p-6"
          >
            <div className="flex items-center gap-4">
              <AlertCircle className="text-red-400" />

              <div>
                <p className="font-medium text-red-300">
                  Recovery Intelligence Unavailable
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  {planError}
                </p>
              </div>
            </div>

            <button
              onClick={fetchRecoveryPlan}
              className="mt-5 flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-2 text-sm transition hover:bg-white/[0.1]"
            >
              <RefreshCw size={15} />

              Retry Connection
            </button>
          </motion.div>
        )}

        {/* Main Content */}
        {!loadingPlan && !planError && (
          <>
            {/* Strategy Metrics */}
            <section className="mt-10 grid gap-4 md:grid-cols-3">

              <MetricCard
                icon={CircleDollarSign}
                title="Recoverable Revenue"
                value={formatCurrency(totalRecoverable)}
                description={`${candidateCount} recovery opportunities identified`}
                color="text-emerald-400"
              />

              <MetricCard
                icon={TrendingUp}
                title="Recovery Confidence"
                value={`${averageConfidence}%`}
                description="Average confidence across selected candidates"
                color="text-cyan-400"
              />

              <MetricCard
                icon={Clock3}
                title="Recovery Strategy"
                value={strategy.replaceAll("_", " ")}
                description="AI-selected recovery workflow"
                color="text-violet-400"
              />

            </section>

            {/* Main Recovery Grid */}
            <section className="mt-6 grid gap-6 lg:grid-cols-12">

              {/* Recovery Candidates */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
                className="rounded-3xl border border-white/[0.08] bg-[#0b0f1d]/70 p-6 backdrop-blur-xl lg:col-span-8"
              >
                <div className="mb-7 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">
                      Recommended Recovery Actions
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Ranked by recovery probability and transaction priority
                    </p>
                  </div>

                  <span className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400">
                    {recoveryCandidates.length} selected
                  </span>
                </div>

                <div className="space-y-4">

                  {recoveryCandidates.length === 0 ? (
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-8 text-center">
                      <p className="font-medium text-slate-300">
                        No recovery candidates available
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        RECOVR did not identify any transactions requiring
                        recovery action.
                      </p>
                    </div>
                  ) : (
                    recoveryCandidates.map((candidate, index) => (

                      <motion.div
                        key={candidate.transaction_id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.3 + index * 0.1,
                        }}
                        whileHover={{ y: -3 }}
                        className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:border-violet-400/25"
                      >

                        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                          <div className="flex items-center gap-4">

                            {/* Probability */}
                            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/10">
                              <span className="text-sm font-bold text-cyan-300">
                                {candidate.recovery_probability}%
                              </span>
                            </div>

                            <div>

                              <div className="flex flex-wrap items-center gap-3">

                                <p className="font-medium">
                                  {candidate.strategy.replaceAll("_", " ")}
                                </p>

                                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-400">
                                  {candidate.recovery_probability >= 80
                                    ? "High confidence"
                                    : "Recovery candidate"}
                                </span>

                              </div>

                              <p className="mt-1 text-xs text-slate-500">
                                {candidate.transaction_id}
                                {" • "}
                                Priority Score: {candidate.priority_score}
                              </p>

                            </div>

                          </div>

                          <div className="flex items-center justify-between gap-6 md:justify-end">

                            <div className="text-right">

                              <p className="text-xs text-slate-500">
                                Revenue
                              </p>

                              <p className="mt-1 font-semibold">
                                {formatCurrency(candidate.amount)}
                              </p>

                            </div>

                            <ChevronRight
                              size={18}
                              className="text-slate-600 transition group-hover:text-cyan-400"
                            />

                          </div>

                        </div>

                      </motion.div>

                    ))
                  )}

                </div>

              </motion.div>

              {/* AI Strategy Panel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 }}
                className="relative overflow-hidden rounded-3xl border border-violet-400/15 bg-gradient-to-b from-violet-500/[0.10] to-[#0b0f1d]/80 p-6 lg:col-span-4"
              >

                <motion.div
                  animate={{
                    scale: [1, 1.08, 1],
                    opacity: [0.3, 0.65, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                  }}
                  className="absolute right-[-30px] top-[-30px] h-40 w-40 rounded-full bg-violet-500/20 blur-[60px]"
                />

                <div className="relative">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400">
                      <Brain size={20} />
                    </div>

                    <div>

                      <h2 className="font-semibold">
                        Agent Strategy
                      </h2>

                      <p className="text-xs text-violet-300">
                        Live Reasoning Summary
                      </p>

                    </div>

                  </div>

                  <div className="mt-7 rounded-2xl border border-violet-400/10 bg-violet-500/[0.04] p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">
                      Detected Root Cause
                    </p>

                    <p className="mt-2 font-semibold text-white">
                      {rootCause.replaceAll("_", " ")}
                    </p>
                  </div>

                  <div className="mt-5 space-y-5">

                    <StrategyItem
                      number="01"
                      text={`Detected failure pattern: ${rootCause.replaceAll(
                        "_",
                        " "
                      )}.`}
                    />

                    <StrategyItem
                      number="02"
                      text={`Recommended strategy: ${strategy.replaceAll(
                        "_",
                        " "
                      )}.`}
                    />

                    <StrategyItem
                      number="03"
                      text={strategyDescription}
                    />

                    <StrategyItem
                      number="04"
                      text="Require explicit human approval before recovery execution."
                    />

                  </div>

                </div>

              </motion.div>

            </section>

            {/* Safety Layer */}
            <motion.section
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 rounded-3xl border border-emerald-400/15 bg-gradient-to-r from-emerald-500/[0.08] via-[#0b0f1d]/80 to-transparent p-6"
            >

              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">

                <div className="flex gap-4">

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10">
                    <ShieldCheck className="text-emerald-400" />
                  </div>

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
                      Safety Validation
                    </p>

                    <h2 className="mt-2 text-xl font-semibold">
                      Recovery actions passed policy validation.
                    </h2>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                      No automatic retries will occur without approval.
                      Every action is scoped, auditable, and protected
                      against duplicate recovery attempts.
                    </p>

                  </div>

                </div>

                {!approved ? (

                  <button
                    onClick={() => setApproved(true)}
                    disabled={recoveryCandidates.length === 0}
                    className="flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3.5 text-sm font-semibold shadow-lg shadow-violet-500/20 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    Approve Recovery Plan

                    <ArrowRight size={17} />

                  </button>

                ) : (

                  <Link
                    href="/execution"
                    className="flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3.5 text-sm font-semibold shadow-lg shadow-emerald-500/20 transition hover:scale-[1.02]"
                  >

                    Execute Recovery

                    <Zap size={17} />

                  </Link>

                )}

              </div>

            </motion.section>

            {/* Approval State */}
            {approved && (

              <motion.section
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mt-6 flex items-center gap-4 rounded-3xl border border-emerald-400/20 bg-emerald-500/[0.06] p-5"
              >

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15">
                  <CheckCircle2 className="text-emerald-400" />
                </div>

                <div>

                  <p className="font-medium">
                    Recovery plan approved successfully.
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    RECOVR can now execute the approved recovery actions.
                  </p>

                </div>

              </motion.section>

            )}

            {/* Audit Footer */}
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-600">

              <Lock size={13} />

              All recovery actions are logged for audit and traceability

            </div>
          </>
        )}

      </div>
    </main>
  );
}


function MetricCard({
  icon: Icon,
  title,
  value,
  description,
  color,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  description: string;
  color: string;
}) {
  return (

    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -4,
      }}
      className="rounded-3xl border border-white/[0.08] bg-[#0b0f1d]/70 p-5 backdrop-blur-xl"
    >

      <div className="flex items-start justify-between">

        <div
          className={`rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3 ${color}`}
        >
          <Icon size={20} />
        </div>

      </div>

      <p className="mt-6 text-sm text-slate-500">
        {title}
      </p>

      <h3 className={`mt-2 text-3xl font-semibold ${color}`}>
        {value}
      </h3>

      <p className="mt-3 text-xs text-slate-600">
        {description}
      </p>

    </motion.div>

  );
}


function StrategyItem({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (

    <div className="flex gap-4">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-xs font-semibold text-violet-300">
        {number}
      </div>

      <p className="pt-1 text-sm leading-6 text-slate-400">
        {text}
      </p>

    </div>

  );
}