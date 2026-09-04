"use client";

import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  Bot,
  ChartNoAxesCombined,
  ChevronRight,
  CircleDollarSign,
  Command,
  CreditCard,
  LayoutDashboard,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const API_URL = "http://127.0.0.1:8000";

type Incident = {
  provider: string;
  payment_method: string;
  total_transactions: number;
  failed_transactions: number;
  failure_rate: number;
  overall_failure_rate: number;
  anomaly_ratio: number;
  anomaly_score: number;
  revenue_at_risk: number;
  severity: string;
};

type IncidentsResponse = {
  summary: {
    total_transactions: number;
    failed_transactions: number;
    overall_failure_rate: number;
    total_revenue_at_risk: number;
  };
  incidents: Incident[];
};

type RecoveryPlanResponse = {
  recovery_available: boolean;
  incident?: Incident;
  recovery_plan?: {
    strategy: string;
    strategy_description: string;
    root_cause: string;
    root_cause_confidence: number;
    candidate_count: number;
    potential_recovery: number;
    expected_recovery: number;
    plan_confidence: number;
  };
};

type ExecutionResult = {
  transaction_id: string;
  amount: number;
  execution_status: string;
};

type AuditLog = {
  audit_id: string;
  timestamp: string;
  action: string;
  execution_id: string;
  status: string;
  total_candidates: number;
  recovered_count: number;
  pending_count: number;
  recovered_amount: number;
  execution_results: ExecutionResult[];
};

type AuditLogsResponse = {
  logs: AuditLog[];
};

const navItems = [
  {
    icon: LayoutDashboard,
    label: "Command Center",
    href: "/",
  },
  {
    icon: AlertTriangle,
    label: "Incidents",
    href: "/investigation",
  },
  {
    icon: Zap,
    label: "Recovery Engine",
    href: "/recovery",
  },
  {
    icon: ChartNoAxesCombined,
    label: "Audit Intelligence",
    href: "/audit-logs",
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactCurrency(value: number) {
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)}L`;
  }

  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }

  return formatCurrency(value);
}

function formatTime(timestamp: string) {
  try {
    return new Date(timestamp).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  } catch {
    return "--";
  }
}

function getSeverityClass(severity: string) {
  if (severity === "CRITICAL") {
    return "border-rose-400/20 bg-rose-500/10 text-rose-400";
  }

  if (severity === "HIGH") {
    return "border-orange-400/20 bg-orange-500/10 text-orange-400";
  }

  return "border-amber-400/20 bg-amber-500/10 text-amber-400";
}

export default function Home() {
  const [incidentsData, setIncidentsData] =
    useState<IncidentsResponse | null>(null);

  const [recoveryData, setRecoveryData] =
    useState<RecoveryPlanResponse | null>(null);

  const [auditData, setAuditData] =
    useState<AuditLogsResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const fetchDashboardData = async (
    isRefresh = false
  ) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [
        incidentsResponse,
        recoveryResponse,
        auditResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/incidents`),
        fetch(`${API_URL}/recovery-plan`),
        fetch(`${API_URL}/audit-logs`),
      ]);

      if (
        !incidentsResponse.ok ||
        !recoveryResponse.ok ||
        !auditResponse.ok
      ) {
        throw new Error(
          "Unable to connect to RECOVR backend"
        );
      }

      const incidentsJson =
        await incidentsResponse.json();

      const recoveryJson =
        await recoveryResponse.json();

      const auditJson =
        await auditResponse.json();

      setIncidentsData(
        incidentsJson
      );

      setRecoveryData(
        recoveryJson
      );

      setAuditData(
        auditJson
      );
    } catch (err) {
      console.error(
        "Dashboard error:",
        err
      );

      setError(
        "Unable to load live intelligence. Please make sure the RECOVR backend is running."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  /*
    Calculate unique recovered revenue.

    Audit logs can contain repeated executions of
    the same transaction during testing.

    We only count each successfully recovered
    transaction once.
  */

  const recoveredRevenue = useMemo(() => {
    if (!auditData?.logs) {
      return 0;
    }

    const recoveredTransactions =
      new Map<string, number>();

    auditData.logs.forEach(
      (log) => {
        log.execution_results?.forEach(
          (transaction) => {
            if (
              transaction.execution_status ===
              "RECOVERED"
            ) {
              recoveredTransactions.set(
                transaction.transaction_id,
                transaction.amount
              );
            }
          }
        );
      }
    );

    return Array.from(
      recoveredTransactions.values()
    ).reduce(
      (total, amount) =>
        total + amount,
      0
    );
  }, [auditData]);

  const summary =
    incidentsData?.summary;

  const incidents =
    incidentsData?.incidents || [];

  const recoveryPlan =
    recoveryData?.recovery_plan;

  const revenueAtRisk =
    summary?.total_revenue_at_risk || 0;

  const recoverableRevenue =
    recoveryPlan?.potential_recovery || 0;

  const expectedRecovery =
    recoveryPlan?.expected_recovery || 0;

  const recoveryRate =
    recoverableRevenue > 0
      ? Math.min(
          (recoveredRevenue /
            recoverableRevenue) *
            100,
          100
        )
      : 0;

  const criticalIncident =
    [...incidents].sort(
      (a, b) =>
        b.anomaly_score -
        a.anomaly_score
    )[0];

  const chartData = incidents.map(
    (incident, index) => ({
      name: `${incident.provider.replace(
        "Provider-",
        "P"
      )} ${incident.payment_method}`,
      risk: incident.revenue_at_risk,
      anomaly: incident.anomaly_score,
      recovered:
        index === 0
          ? recoveredRevenue
          : 0,
    })
  );

  const metrics = [
    {
      title: "Revenue at Risk",
      value: formatCompactCurrency(
        revenueAtRisk
      ),
      change: `${summary?.overall_failure_rate || 0}%`,
      icon: AlertTriangle,
      iconClass: "text-rose-400",
      glow: "from-rose-500/20 to-transparent",
      trend: `${
        summary?.failed_transactions || 0
      } failed transactions`,
    },
    {
      title: "Recoverable Revenue",
      value: formatCompactCurrency(
        recoverableRevenue
      ),
      change: `${
        recoveryPlan?.plan_confidence || 0
      }%`,
      icon: CircleDollarSign,
      iconClass: "text-violet-400",
      glow: "from-violet-500/20 to-transparent",
      trend: "AI recovery opportunity",
    },
    {
      title: "Recovered Revenue",
      value: formatCompactCurrency(
        recoveredRevenue
      ),
      change: `${auditData?.logs?.length || 0} runs`,
      icon: Wallet,
      iconClass: "text-emerald-400",
      glow: "from-emerald-500/20 to-transparent",
      trend: "Unique successful recoveries",
    },
    {
      title: "Recovery Rate",
      value: `${recoveryRate.toFixed(1)}%`,
      change: formatCompactCurrency(
        expectedRecovery
      ),
      icon: TrendingUp,
      iconClass: "text-cyan-400",
      glow: "from-cyan-500/20 to-transparent",
      trend: "Recovered vs recoverable value",
    },
  ];

  const recentActivity =
    auditData?.logs
      ?.slice()
      .reverse()
      .slice(0, 3) || [];

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#060816] text-white">

      {/* Animated Background */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <motion.div
          animate={{
            x: [0, 80, -40, 0],
            y: [0, 50, -30, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px]"
        />

        <motion.div
          animate={{
            x: [0, -70, 30, 0],
            y: [0, 40, 70, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute right-[-100px] top-[10%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]"
        />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:48px_48px]" />

      </div>

      <div className="relative flex min-h-screen">

        {/* Sidebar */}

        <aside className="hidden w-[260px] shrink-0 border-r border-white/[0.07] bg-[#080b18]/70 px-5 py-7 backdrop-blur-xl lg:block">

          <div className="flex items-center gap-3 px-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/20">

              <Zap size={21} />

            </div>

            <div>

              <h1 className="font-semibold tracking-wide">

                RECOVR

              </h1>

              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">

                Recovery Intelligence

              </p>

            </div>

          </div>

          <nav className="mt-12 space-y-2">

            {navItems.map(
              (item, index) => {

                const Icon =
                  item.icon;

                const active =
                  index === 0;

                return (

                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                      active
                        ? "bg-violet-500/10 text-white"
                        : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
                    }`}
                  >

                    <Icon
                      size={18}
                      className={
                        active
                          ? "text-violet-400"
                          : ""
                      }
                    />

                    {item.label}

                    {active && (

                      <ChevronRight
                        size={15}
                        className="ml-auto text-violet-400"
                      />

                    )}

                  </Link>

                );
              }
            )}

          </nav>

          <div className="mt-auto pt-20">

            <div className="rounded-2xl border border-cyan-400/10 bg-cyan-500/[0.04] p-4">

              <div className="flex items-center gap-2">

                <ShieldCheck
                  size={16}
                  className="text-cyan-400"
                />

                <span className="text-xs font-medium">

                  System Protected

                </span>

              </div>

              <p className="mt-3 text-xs leading-5 text-slate-500">

                All recovery decisions are tracked
                and persisted in the audit system.

              </p>

            </div>

          </div>

        </aside>

        {/* Main Content */}

        <div className="min-w-0 flex-1 px-5 py-6 md:px-8 lg:px-10">

          {/* Top Bar */}

          <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-2.5 lg:hidden">

                <Command size={18} />

              </div>

              <div>

                <p className="text-xs uppercase tracking-[0.2em] text-violet-400">

                  Command Center

                </p>

                <h2 className="mt-1 text-xl font-semibold">

                  Recovery Intelligence Dashboard

                </h2>

              </div>

            </div>

            <div className="flex items-center gap-3">

              <button
                onClick={() =>
                  fetchDashboardData(true)
                }
                disabled={refreshing}
                className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-xs text-slate-300 transition hover:bg-white/[0.08] disabled:opacity-50"
              >

                <RefreshCw
                  size={15}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh

              </button>

              <div className="hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-slate-500 md:flex">

                <Search size={15} />

                <span className="text-xs">

                  Intelligence Search

                </span>

              </div>

              <button className="relative rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 text-slate-400">

                <Bell size={17} />

                {incidents.length > 0 && (

                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-400" />

                )}

              </button>

            </div>

          </header>

          {/* Error */}

          {error && (

            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300">

              <AlertTriangle size={18} />

              {error}

            </div>

          )}

          {/* Hero */}

          <section className="mt-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">

            <div>

              <div className="flex items-center gap-2">

                <Bot
                  size={17}
                  className="text-cyan-400"
                />

                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">

                  Live AI Recovery Intelligence

                </span>

              </div>

              <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">

                Your payment recovery system is{" "}

                <span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">

                  actively monitoring.

                </span>

              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">

                RECOVR continuously detects payment
                anomalies, estimates revenue exposure,
                and orchestrates intelligent recovery
                actions.

              </p>

            </div>

            <Link
              href="/investigation"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-3 text-sm font-semibold shadow-lg shadow-violet-500/20 transition hover:scale-[1.02]"
            >

              Investigate Incidents

              <ArrowUpRight
                size={17}
                className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />

            </Link>

          </section>

          {/* Loading State */}

          {loading ? (

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

              {[1, 2, 3, 4].map(
                (item) => (

                  <div
                    key={item}
                    className="h-[190px] animate-pulse rounded-3xl border border-white/[0.06] bg-white/[0.03]"
                  />

                )
              )}

            </div>

          ) : (

            <>

              {/* Metrics */}

              <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

                {metrics.map(
                  (metric, index) => {

                    const Icon =
                      metric.icon;

                    return (

                      <motion.div
                        key={metric.title}
                        initial={{
                          opacity: 0,
                          y: 25,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay: index * 0.08,
                        }}
                        whileHover={{
                          y: -5,
                        }}
                        className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0b0f1d]/70 p-6 backdrop-blur-xl"
                      >

                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${metric.glow} opacity-60`}
                        />

                        <div className="relative">

                          <div className="flex items-center justify-between">

                            <div
                              className={`rounded-2xl border border-white/[0.06] bg-white/[0.04] p-3 ${metric.iconClass}`}
                            >

                              <Icon size={20} />

                            </div>

                            <span
                              className={`text-xs font-medium ${metric.iconClass}`}
                            >

                              {metric.change}

                            </span>

                          </div>

                          <p className="mt-6 text-sm text-slate-500">

                            {metric.title}

                          </p>

                          <h3 className="mt-2 text-3xl font-semibold tracking-tight">

                            {metric.value}

                          </h3>

                          <p className="mt-4 text-xs text-slate-600">

                            {metric.trend}

                          </p>

                        </div>

                      </motion.div>

                    );
                  }
                )}

              </section>

              {/* Main Grid */}

              <section className="mt-5 grid gap-5 xl:grid-cols-12">

                {/* Chart */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 30,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.35,
                  }}
                  className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0b0f1d]/70 p-6 backdrop-blur-xl xl:col-span-8"
                >

                  <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-violet-500/10 blur-[70px]" />

                  <div className="relative mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">

                    <div>

                      <div className="flex items-center gap-2">

                        <ChartNoAxesCombined
                          size={18}
                          className="text-violet-400"
                        />

                        <h3 className="font-semibold">

                          Revenue Risk Intelligence

                        </h3>

                      </div>

                      <p className="mt-2 text-sm text-slate-500">

                        Revenue exposure across detected
                        payment incidents

                      </p>

                    </div>

                    <div className="flex gap-4 text-xs">

                      <span className="flex items-center gap-2 text-slate-400">

                        <span className="h-2 w-2 rounded-full bg-violet-400" />

                        Revenue Risk

                      </span>

                      <span className="flex items-center gap-2 text-slate-400">

                        <span className="h-2 w-2 rounded-full bg-cyan-400" />

                        Anomaly Score

                      </span>

                    </div>

                  </div>

                  <div className="h-[310px]">

                    <ResponsiveContainer
                      width="100%"
                      height="100%"
                    >

                      <AreaChart
                        data={chartData}
                      >

                        <defs>

                          <linearGradient
                            id="riskGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >

                            <stop
                              offset="5%"
                              stopColor="#8b5cf6"
                              stopOpacity={0.35}
                            />

                            <stop
                              offset="95%"
                              stopColor="#8b5cf6"
                              stopOpacity={0}
                            />

                          </linearGradient>

                          <linearGradient
                            id="anomalyGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >

                            <stop
                              offset="5%"
                              stopColor="#22d3ee"
                              stopOpacity={0.25}
                            />

                            <stop
                              offset="95%"
                              stopColor="#22d3ee"
                              stopOpacity={0}
                            />

                          </linearGradient>

                        </defs>

                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "#64748b",
                            fontSize: 11,
                          }}
                        />

                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fill: "#64748b",
                            fontSize: 11,
                          }}
                          tickFormatter={(value) =>
                            `₹${Math.round(
                              value / 1000
                            )}K`
                          }
                        />

                       <Tooltip
  contentStyle={{
    background: "#0b0f1d",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
  }}
  formatter={(value, name) => {
    if (name === "Revenue Risk") {
      return [
        formatCurrency(Number(value ?? 0)),
        name,
      ];
    }

    return [
      `${value ?? 0}%`,
      name,
    ];
  }}
/>


                        <Area
                          type="monotone"
                          dataKey="risk"
                          name="Revenue Risk"
                          stroke="#8b5cf6"
                          strokeWidth={3}
                          fill="url(#riskGradient)"
                        />

                        <Area
                          type="monotone"
                          dataKey="anomaly"
                          name="Anomaly Score"
                          stroke="#22d3ee"
                          strokeWidth={2}
                          fill="url(#anomalyGradient)"
                        />

                      </AreaChart>

                    </ResponsiveContainer>

                  </div>

                </motion.div>

                {/* Critical Incident */}

                <motion.div
                  initial={{
                    opacity: 0,
                    x: 20,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: 0.4,
                  }}
                  className="relative overflow-hidden rounded-3xl border border-rose-400/15 bg-gradient-to-br from-rose-500/[0.08] to-[#0b0f1d]/80 p-6 backdrop-blur-xl xl:col-span-4"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <AlertTriangle
                        size={18}
                        className="text-rose-400"
                      />

                      <h3 className="font-semibold">

                        Highest Risk Incident

                      </h3>

                    </div>

                    {criticalIncident && (

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getSeverityClass(
                          criticalIncident.severity
                        )}`}
                      >

                        {
                          criticalIncident.severity
                        }

                      </span>

                    )}

                  </div>

                  {criticalIncident ? (

                    <>

                      <div className="mt-7">

                        <p className="text-xs uppercase tracking-wider text-slate-500">

                          Payment Channel

                        </p>

                        <h4 className="mt-2 text-xl font-semibold">

                          {
                            criticalIncident.provider
                          }

                          {" · "}

                          {
                            criticalIncident.payment_method
                          }

                        </h4>

                      </div>

                      <div className="mt-7 grid grid-cols-2 gap-3">

                        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">

                          <p className="text-xs text-slate-500">

                            Failure Rate

                          </p>

                          <p className="mt-2 text-lg font-semibold text-rose-400">

                            {
                              criticalIncident.failure_rate
                            }%

                          </p>

                        </div>

                        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">

                          <p className="text-xs text-slate-500">

                            Anomaly Score

                          </p>

                          <p className="mt-2 text-lg font-semibold text-cyan-400">

                            {
                              criticalIncident.anomaly_score
                            }

                          </p>

                        </div>

                      </div>

                      <div className="mt-4 rounded-2xl border border-rose-400/10 bg-rose-500/[0.05] p-4">

                        <p className="text-xs text-slate-500">

                          Revenue Exposure

                        </p>

                        <p className="mt-2 text-2xl font-semibold text-rose-400">

                          {formatCurrency(
                            criticalIncident.revenue_at_risk
                          )}

                        </p>

                      </div>

                      <Link
                        href="/investigation"
                        className="mt-5 flex items-center justify-between rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-slate-300 transition hover:bg-white/[0.08]"
                      >

                        Investigate Incident

                        <ChevronRight size={17} />

                      </Link>

                    </>

                  ) : (

                    <div className="mt-10 text-center text-sm text-slate-500">

                      No active incidents detected.

                    </div>

                  )}

                </motion.div>

              </section>

              {/* Bottom Grid */}

              <section className="mt-5 grid gap-5 xl:grid-cols-12">

                {/* Incident Overview */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 25,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.45,
                  }}
                  className="rounded-3xl border border-white/[0.08] bg-[#0b0f1d]/70 p-6 backdrop-blur-xl xl:col-span-7"
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <div className="flex items-center gap-2">

                        <Activity
                          size={18}
                          className="text-cyan-400"
                        />

                        <h3 className="font-semibold">

                          Active Incident Intelligence

                        </h3>

                      </div>

                      <p className="mt-2 text-sm text-slate-500">

                        Live anomaly detection across
                        payment channels

                      </p>

                    </div>

                    <Link
                      href="/investigation"
                      className="text-xs text-violet-400 hover:text-violet-300"
                    >

                      View investigation →

                    </Link>

                  </div>

                  <div className="mt-6 space-y-3">

                    {incidents.map(
                      (incident) => (

                        <div
                          key={`${incident.provider}-${incident.payment_method}`}
                          className="flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 transition hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between"
                        >

                          <div className="flex items-center gap-4">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10">

                              <CreditCard
                                size={19}
                                className="text-violet-400"
                              />

                            </div>

                            <div>

                              <p className="font-medium">

                                {
                                  incident.provider
                                }

                                {" · "}

                                {
                                  incident.payment_method
                                }

                              </p>

                              <p className="mt-1 text-xs text-slate-500">

                                {
                                  incident.failed_transactions
                                }

                                {" failed of "}

                                {
                                  incident.total_transactions
                                }

                                {" transactions"}

                              </p>

                            </div>

                          </div>

                          <div className="flex items-center gap-5">

                            <div className="text-right">

                              <p className="text-xs text-slate-500">

                                Revenue Risk

                              </p>

                              <p className="mt-1 font-semibold">

                                {formatCompactCurrency(
                                  incident.revenue_at_risk
                                )}

                              </p>

                            </div>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getSeverityClass(
                                incident.severity
                              )}`}
                            >

                              {
                                incident.severity
                              }

                            </span>

                          </div>

                        </div>

                      )
                    )}

                  </div>

                </motion.div>

                {/* Activity */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 25,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.5,
                  }}
                  className="rounded-3xl border border-white/[0.08] bg-[#0b0f1d]/70 p-6 backdrop-blur-xl xl:col-span-5"
                >

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <Sparkles
                        size={18}
                        className="text-emerald-400"
                      />

                      <h3 className="font-semibold">

                        Recent Recovery Activity

                      </h3>

                    </div>

                    <Link
                      href="/audit-logs"
                      className="text-xs text-emerald-400 hover:text-emerald-300"
                    >

                      Audit Logs →

                    </Link>

                  </div>

                  <div className="mt-7 space-y-6">

                    {recentActivity.length > 0 ? (

                      recentActivity.map(
                        (log) => (

                          <div
                            key={log.audit_id}
                            className="flex gap-4"
                          >

                            <div className="flex flex-col items-center">

                              <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/30" />

                              <div className="mt-2 h-full w-px bg-white/[0.08]" />

                            </div>

                            <div className="pb-2">

                              <div className="flex items-center gap-3">

                                <span className="text-xs text-slate-600">

                                  {formatTime(
                                    log.timestamp
                                  )}

                                </span>

                                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-400">

                                  {
                                    log.status
                                  }

                                </span>

                              </div>

                              <p className="mt-2 text-sm font-medium">

                                Recovery execution completed

                              </p>

                              <p className="mt-1 text-xs leading-5 text-slate-500">

                                {
                                  log.recovered_count
                                } of {
                                  log.total_candidates
                                } candidates recovered ·{" "}

                                {formatCurrency(
                                  log.recovered_amount
                                )}

                                {" recorded"}

                              </p>

                            </div>

                          </div>

                        )
                      )

                    ) : (

                      <div className="rounded-2xl border border-dashed border-white/[0.08] p-8 text-center">

                        <p className="text-sm text-slate-500">

                          No recovery executions yet.

                        </p>

                        <Link
                          href="/recovery"
                          className="mt-3 inline-flex text-xs text-violet-400"
                        >

                          Start recovery →

                        </Link>

                      </div>

                    )}

                  </div>

                </motion.div>

              </section>

              {/* Intelligence Summary */}

              <motion.section
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.55,
                }}
                className="mt-5 rounded-3xl border border-cyan-400/10 bg-gradient-to-r from-violet-500/[0.06] via-cyan-500/[0.04] to-transparent p-6"
              >

                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

                  <div className="flex gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10">

                      <Bot className="text-cyan-400" />

                    </div>

                    <div>

                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-400">

                        RECOVR Intelligence Summary

                      </p>

                      <h3 className="mt-2 text-lg font-semibold">

                        {
                          incidents.length
                        } active payment incidents require attention.

                      </h3>

                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">

                        RECOVR has identified{" "}

                        {formatCurrency(
                          revenueAtRisk
                        )}

                        {" in revenue exposure. The current AI recovery plan estimates "}

                        {formatCurrency(
                          expectedRecovery
                        )}

                        {" in expected recoverable value."}

                      </p>

                    </div>

                  </div>

                  <Link
                    href="/recovery"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-300 transition hover:bg-cyan-500/15"
                  >

                    Open Recovery Engine

                    <ChevronRight size={17} />

                  </Link>

                </div>

              </motion.section>

            </>

          )}

          {/* Footer */}

          <footer className="mt-8 flex flex-col gap-3 border-t border-white/[0.06] py-6 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-2">

              <ShieldCheck size={14} />

              RECOVR Intelligence Platform

            </div>

            <div className="flex items-center gap-2">

              <span className="h-2 w-2 rounded-full bg-emerald-400" />

              Live backend connected

            </div>

          </footer>

        </div>

      </div>

    </main>
  );
}