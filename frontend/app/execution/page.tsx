"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Clock,
  Lock,
  Play,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const executionSteps = [
  {
    title: "Recovery candidates selected",
    description: "Approved recovery candidates prepared for execution",
  },
  {
    title: "Policy validation completed",
    description: "Safety checks and duplicate protection validated",
  },
  {
    title: "Smart recovery execution",
    description: "Applying the selected recovery strategy",
  },
  {
    title: "Recovery results confirmed",
    description: "Transaction outcomes recorded successfully",
  },
];

type ExecutionResult = {
  transaction_id: string;
  amount: number;
  strategy: string;
  recovery_probability: number;
  priority_score?: number;
  safety_validated?: boolean;
  execution_status: string;
  execution_reason?: string;
};

type ExecutionData = {
  execution_id: string;
  executed_at: string;
  status: string;
  strategy?: string;

  total_candidates: number;
  recovered_count: number;
  pending_count: number;
  manual_review_count?: number;

  success_rate?: number;

  recovered_amount: number;
  pending_amount?: number;

  potential_recovery?: number;
  expected_recovery?: number;

  results: ExecutionResult[];
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusStyle(status: string) {
  if (status === "RECOVERED") {
    return "bg-emerald-500/10 text-emerald-400 border-emerald-400/20";
  }

  if (status === "PENDING") {
    return "bg-amber-500/10 text-amber-400 border-amber-400/20";
  }

  return "bg-violet-500/10 text-violet-400 border-violet-400/20";
}

export default function ExecutionPage() {
  const [started, setStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState("");

  const [executionData, setExecutionData] =
    useState<ExecutionData | null>(null);

  const handleExecution = async () => {
    try {
      setIsExecuting(true);
      setError("");

      const response = await fetch(
        "http://127.0.0.1:8000/execute-recovery",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Recovery execution failed"
        );
      }

      const data = await response.json();

      console.log(
        "Recovery execution result:",
        data
      );

      if (!data.execution_available) {
        throw new Error(
          data.message ||
            "Recovery execution is not available"
        );
      }

      // Store the REAL backend execution result
      setExecutionData(data.execution);

      // Start execution animation
      setStarted(true);
      setCurrentStep(0);

      const interval = setInterval(() => {
        setCurrentStep((previous) => {
          if (
            previous >=
            executionSteps.length - 1
          ) {
            clearInterval(interval);
            return previous;
          }

          return previous + 1;
        });
      }, 1100);
    } catch (err) {
      console.error(
        "Execution error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to execute recovery. Please make sure the backend is running."
      );
    } finally {
      setIsExecuting(false);
    }
  };

  const completed =
    started &&
    currentStep ===
      executionSteps.length - 1;

  const progress = started
    ? ((currentStep + 1) /
        executionSteps.length) *
      100
    : 0;

  const recoveredAmount =
    executionData?.recovered_amount ?? 0;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060816] text-white">

      {/* Animated Background */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <motion.div
          animate={{
            x: [0, 80, -30, 0],
            y: [0, 50, -20, 0],
          }}
          transition={{
            duration: 17,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-40 -top-20 h-[550px] w-[550px] rounded-full bg-emerald-500/10 blur-[130px]"
        />

        <motion.div
          animate={{
            x: [0, -80, 30, 0],
            y: [0, 60, 20, 0],
          }}
          transition={{
            duration: 21,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-[-150px] top-[15%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[130px]"
        />

      </div>


      <div className="relative mx-auto max-w-7xl px-5 py-8 md:px-8">

        {/* Header */}

        <motion.header
          initial={{
            opacity: 0,
            y: -15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="flex items-center justify-between"
        >

          <Link
            href="/recovery"
            className="group flex items-center gap-3 text-sm text-slate-400 transition hover:text-white"
          >

            <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 transition group-hover:bg-white/[0.08]">

              <ArrowLeft size={18} />

            </div>

            Back to Recovery

          </Link>


          <div
            className={`flex items-center gap-2 rounded-full border px-4 py-2 ${
              completed
                ? "border-emerald-400/20 bg-emerald-500/10"
                : "border-violet-400/20 bg-violet-500/10"
            }`}
          >

            <Sparkles
              size={14}
              className={
                completed
                  ? "text-emerald-400"
                  : "text-violet-400"
              }
            />

            <span className="text-xs font-medium">

              {completed
                ? "RECOVERY COMPLETE"
                : "READY FOR EXECUTION"}

            </span>

          </div>

        </motion.header>


        {/* Hero */}

        <motion.section
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.1,
          }}
          className="mt-12"
        >

          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">

            <div>

              <div className="mb-4 flex items-center gap-2">

                <Zap
                  size={15}
                  className="text-cyan-400"
                />

                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">

                  Autonomous Recovery Execution

                </span>

              </div>


              <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">

                {completed
                  ? "Recovery execution completed."
                  : started
                  ? "RECOVR is executing."
                  : "Ready to recover revenue."}

              </h1>


              <p className="mt-4 max-w-2xl leading-relaxed text-slate-400">

                {completed
                  ? "RECOVR completed the approved recovery workflow using intelligent candidate scoring and recorded every execution event for auditability."
                  : "The approved recovery plan is ready. RECOVR will validate each candidate and execute the safest recovery strategy."}

              </p>

            </div>


            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.05] px-5 py-4">

              <p className="text-xs uppercase tracking-wider text-slate-500">

                Recovered Revenue

              </p>

              <p className="mt-2 text-2xl font-semibold text-emerald-400">

                {completed
                  ? formatCurrency(
                      recoveredAmount
                    )
                  : "₹0"}

              </p>

            </div>

          </div>

        </motion.section>


        {/* Execution Control */}

        {!started && (

          <motion.section
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mt-10 flex justify-center"
          >

            <div className="w-full max-w-2xl rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-500/[0.10] to-[#0b0f1d]/80 p-8 text-center">

              <motion.div
                animate={{
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-violet-500 to-cyan-400 shadow-xl shadow-violet-500/30"
              >

                <Play size={30} />

              </motion.div>


              <h2 className="mt-7 text-xl font-semibold">

                Start Recovery Execution

              </h2>


              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-400">

                The approved recovery candidates are ready to execute.
                RECOVR will validate each transaction before taking action.

              </p>


              <button
                onClick={handleExecution}
                disabled={isExecuting}
                className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-7 py-4 text-sm font-semibold shadow-lg shadow-violet-500/20 transition hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-60"
              >

                <Play size={17} />

                {isExecuting
                  ? "Executing..."
                  : "Execute Recovery Plan"}

              </button>


              {error && (

                <div className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">

                  <AlertTriangle size={16} />

                  {error}

                </div>

              )}

            </div>

          </motion.section>

        )}


        {/* Execution Timeline */}

        {started && (

          <motion.section
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mt-10 grid gap-6 lg:grid-cols-12"
          >

            {/* Timeline */}

            <div className="rounded-3xl border border-white/[0.08] bg-[#0b0f1d]/70 p-6 backdrop-blur-xl lg:col-span-7">

              <div className="flex items-start justify-between">

                <div>

                  <h2 className="font-semibold">

                    Execution Timeline

                  </h2>

                  <p className="mt-1 text-xs text-slate-500">

                    Real-time recovery orchestration

                  </p>

                </div>


                <span className="text-sm font-semibold text-cyan-300">

                  {Math.round(progress)}%

                </span>

              </div>


              {/* Progress Bar */}

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/[0.05]">

                <motion.div
                  initial={{
                    width: "0%",
                  }}
                  animate={{
                    width: `${progress}%`,
                  }}
                  transition={{
                    duration: 0.6,
                  }}
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400"
                />

              </div>


              {/* Steps */}

              <div className="mt-7 space-y-4">

                {executionSteps.map(
                  (step, index) => {

                    const isComplete =
                      index <= currentStep;

                    return (

                      <motion.div
                        key={step.title}
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay: index * 0.08,
                        }}
                        className={`flex items-center gap-4 rounded-2xl border p-4 transition ${
                          isComplete
                            ? "border-emerald-400/20 bg-emerald-500/[0.06]"
                            : "border-white/[0.06] bg-white/[0.02]"
                        }`}
                      >

                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            isComplete
                              ? "bg-emerald-500/15"
                              : "bg-white/[0.05]"
                          }`}
                        >

                          {isComplete ? (

                            <Check
                              size={18}
                              className="text-emerald-400"
                            />

                          ) : (

                            <Clock
                              size={18}
                              className="text-slate-500"
                            />

                          )}

                        </div>


                        <div>

                          <p className="text-sm font-medium">

                            {step.title}

                          </p>

                          <p className="mt-1 text-xs text-slate-500">

                            {step.description}

                          </p>

                        </div>

                      </motion.div>

                    );
                  }
                )}

              </div>

            </div>


            {/* Live Execution Metrics */}

            <div className="space-y-4 lg:col-span-5">

              <MetricCard
                icon={TrendingUp}
                title="Success Rate"
                value={
                  executionData
                    ? `${executionData.success_rate ?? 0}%`
                    : "--"
                }
                description="Recovery actions completed successfully"
                color="text-cyan-400"
              />

              <MetricCard
                icon={CheckCircle2}
                title="Recovered Transactions"
                value={
                  executionData
                    ? String(
                        executionData.recovered_count
                      )
                    : "--"
                }
                description={
                  executionData
                    ? `Out of ${executionData.total_candidates} selected candidates`
                    : "Waiting for execution"
                }
                color="text-emerald-400"
              />

              <MetricCard
                icon={Clock}
                title="Pending Recovery"
                value={
                  executionData
                    ? String(
                        executionData.pending_count
                      )
                    : "--"
                }
                description={
                  executionData
                    ? formatCurrency(
                        executionData.pending_amount ?? 0
                      ) + " pending value"
                    : "Waiting for execution"
                }
                color="text-amber-400"
              />

            </div>

          </motion.section>

        )}


        {/* Execution Result */}

        {completed && executionData && (

          <motion.section
            initial={{
              opacity: 0,
              y: 25,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className="mt-6"
          >

            {/* Execution ID */}

            <div className="mb-6 flex flex-col justify-between gap-4 rounded-3xl border border-cyan-400/15 bg-cyan-500/[0.04] p-5 md:flex-row md:items-center">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10">

                  <ShieldCheck className="text-cyan-400" />

                </div>


                <div>

                  <p className="text-xs uppercase tracking-wider text-slate-500">

                    Execution ID

                  </p>

                  <p className="mt-1 font-semibold text-cyan-300">

                    {executionData.execution_id}

                  </p>

                </div>

              </div>


              <div className="text-left md:text-right">

                <p className="text-xs text-slate-500">

                  Strategy

                </p>

                <p className="mt-1 text-sm font-medium">

                  {executionData.strategy ?? "Recovery Strategy"}

                </p>

              </div>

            </div>


            {/* Transaction Results */}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

              {executionData.results.map(
                (transaction, index) => (

                  <motion.div
                    key={
                      transaction.transaction_id
                    }
                    initial={{
                      opacity: 0,
                      y: 20,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay: index * 0.1,
                    }}
                    whileHover={{
                      y: -4,
                    }}
                    className="rounded-3xl border border-white/[0.08] bg-[#0b0f1d]/70 p-5 backdrop-blur-xl"
                  >

                    <div className="flex items-center justify-between gap-3">

                      <p className="font-medium">

                        {
                          transaction.transaction_id
                        }

                      </p>


                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getStatusStyle(
                          transaction.execution_status
                        )}`}
                      >

                        {
                          transaction.execution_status
                        }

                      </span>

                    </div>


                    <p className="mt-5 text-xs text-slate-500">

                      {transaction.strategy}

                    </p>


                    <p className="mt-2 text-xl font-semibold">

                      {formatCurrency(
                        transaction.amount
                      )}

                    </p>


                    <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">

                      <span className="text-xs text-slate-500">

                        Recovery Confidence

                      </span>

                      <span className="text-sm font-semibold text-cyan-300">

                        {
                          transaction.recovery_probability
                        }%

                      </span>

                    </div>


                    {transaction.execution_reason && (

                      <p className="mt-4 text-xs leading-5 text-slate-500">

                        {
                          transaction.execution_reason
                        }

                      </p>

                    )}

                  </motion.div>

                )
              )}

            </div>


            {/* Final Summary */}

            <div className="mt-6 flex flex-col justify-between gap-6 rounded-3xl border border-emerald-400/20 bg-gradient-to-r from-emerald-500/[0.08] via-cyan-500/[0.04] to-transparent p-6 lg:flex-row lg:items-center">

              <div className="flex gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10">

                  <CircleDollarSign className="text-emerald-400" />

                </div>


                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">

                    Recovery Execution Result

                  </p>


                  <h2 className="mt-2 text-xl font-semibold">

                    {formatCurrency(
                      executionData.recovered_amount
                    )} recovered successfully.

                  </h2>


                  <p className="mt-2 text-sm text-slate-400">

                    {
                      executionData.recovered_count
                    } of {
                      executionData.total_candidates
                    } recovery actions were successful.
                    {" "}
                    {
                      executionData.pending_count
                    } remain pending for controlled follow-up.

                  </p>

                </div>

              </div>


              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">

                <Link
                  href="/audit-logs"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3.5 text-sm font-semibold shadow-lg shadow-violet-500/20 transition hover:scale-[1.02]"
                >

                  <ClipboardList size={17} />

                  View Audit Logs

                </Link>


                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/[0.1] bg-white/[0.05] px-6 py-3.5 text-sm font-semibold transition hover:bg-white/[0.08]"
                >

                  Back to Dashboard

                  <ChevronRight size={17} />

                </Link>

              </div>

            </div>

          </motion.section>

        )}


        {/* Audit Footer */}

        <div className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-slate-600">

          <Lock size={13} />

          Every recovery decision and execution event is recorded for auditability

        </div>

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
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      whileHover={{
        y: -3,
      }}
      className="rounded-3xl border border-white/[0.08] bg-[#0b0f1d]/70 p-5 backdrop-blur-xl"
    >

      <div
        className={`inline-flex rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3 ${color}`}
      >

        <Icon size={20} />

      </div>


      <p className="mt-5 text-sm text-slate-500">

        {title}

      </p>


      <h3
        className={`mt-2 text-3xl font-semibold ${color}`}
      >

        {value}

      </h3>


      <p className="mt-2 text-xs text-slate-600">

        {description}

      </p>

    </motion.div>

  );
}