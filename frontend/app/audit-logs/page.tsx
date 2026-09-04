"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ClipboardList,
  ShieldCheck,
  Clock,
  CheckCircle2,
  RefreshCw,
  Database,
  IndianRupee,
} from "lucide-react";

type AuditLog = {
  audit_id: string;
  timestamp: string;
  action: string;
  execution_id: string;
  status: string;
  recovered_amount: number;
};

const API_BASE_URL = "http://127.0.0.1:8000";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/audit-logs`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch audit logs");
      }

      const data = await response.json();

      setLogs(data.logs || []);
    } catch (err) {
      setError(
        "Unable to load audit logs. Please make sure the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const totalRecovered = logs.reduce(
    (total, log) => total + (log.recovered_amount || 0),
    0
  );

  return (
    <main className="min-h-screen bg-[#070b1a] text-white">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">

        {/* TOP NAVIGATION */}

        <div className="mb-12 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-sm text-slate-400 transition hover:text-white"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-900">
              <ArrowLeft size={18} />
            </div>

            Back to Dashboard
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300">
            <ShieldCheck size={15} />
            AUDIT TRAIL ACTIVE
          </div>
        </div>

        {/* HEADER */}

        <section className="mb-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">

          <div>
            <div className="mb-4 flex items-center gap-2 text-xs font-bold tracking-[0.25em] text-cyan-300">
              <ClipboardList size={15} />
              RECOVERY AUDIT & TRACEABILITY
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              Recovery audit logs.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-400">
              Every recovery execution is recorded to provide
              transparency, traceability, and operational accountability.
            </p>
          </div>

          <button
            onClick={fetchAuditLogs}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            <RefreshCw size={16} />
            Refresh Logs
          </button>

        </section>

        {/* SUMMARY CARDS */}

        <section className="mb-10 grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-800 bg-[#0d1324] p-6">

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
              <ClipboardList size={22} />
            </div>

            <p className="text-sm text-slate-400">
              Total Audit Events
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {logs.length}
            </h2>

            <p className="mt-2 text-xs text-slate-500">
              Recovery executions recorded
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0d1324] p-6">

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
              <IndianRupee size={22} />
            </div>

            <p className="text-sm text-slate-400">
              Recorded Recovery Value
            </p>

            <h2 className="mt-2 text-3xl font-bold text-emerald-300">
              ₹{totalRecovered.toLocaleString("en-IN")}
            </h2>

            <p className="mt-2 text-xs text-slate-500">
              From logged recovery executions
            </p>

          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0d1324] p-6">

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-400/10 text-purple-300">
              <Database size={22} />
            </div>

            <p className="text-sm text-slate-400">
              Audit Storage
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Active
            </h2>

            <p className="mt-2 text-xs text-slate-500">
              Execution records available for review
            </p>

          </div>

        </section>

        {/* AUDIT LOG TABLE */}

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0d1324]">

          <div className="flex flex-col justify-between gap-4 border-b border-slate-800 px-6 py-6 md:flex-row md:items-center">

            <div>
              <h2 className="text-lg font-semibold">
                Execution History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Immutable-style record of recovery operations
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock size={16} />
              Latest activity
            </div>

          </div>

          {/* LOADING */}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">

              <RefreshCw
                size={28}
                className="mb-4 animate-spin text-cyan-300"
              />

              Loading audit logs...

            </div>
          )}

          {/* ERROR */}

          {!loading && error && (
            <div className="px-6 py-16 text-center">

              <p className="text-red-400">
                {error}
              </p>

              <button
                onClick={fetchAuditLogs}
                className="mt-5 rounded-lg bg-slate-800 px-4 py-2 text-sm hover:bg-slate-700"
              >
                Try Again
              </button>

            </div>
          )}

          {/* EMPTY STATE */}

          {!loading && !error && logs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">

              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 text-slate-400">
                <ClipboardList size={28} />
              </div>

              <h3 className="text-lg font-semibold">
                No audit logs yet
              </h3>

              <p className="mt-2 max-w-md text-center text-sm leading-6 text-slate-500">
                Audit records will appear here after a recovery plan
                has been executed.
              </p>

              <Link
                href="/recovery"
                className="mt-6 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-white"
              >
                Go to Recovery
              </Link>

            </div>
          )}

          {/* LOGS */}

          {!loading && !error && logs.length > 0 && (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[850px] text-left">

                <thead className="border-b border-slate-800 bg-[#0a1020] text-xs uppercase tracking-wider text-slate-500">

                  <tr>
                    <th className="px-6 py-4">
                      Audit ID
                    </th>

                    <th className="px-6 py-4">
                      Action
                    </th>

                    <th className="px-6 py-4">
                      Execution ID
                    </th>

                    <th className="px-6 py-4">
                      Recovered Amount
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>

                    <th className="px-6 py-4">
                      Timestamp
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {[...logs]
                    .reverse()
                    .map((log) => (

                      <tr
                        key={log.audit_id}
                        className="border-b border-slate-800/80 transition hover:bg-slate-800/30"
                      >

                        <td className="px-6 py-5">

                          <span className="font-mono text-sm font-semibold text-cyan-300">
                            {log.audit_id}
                          </span>

                        </td>

                        <td className="px-6 py-5">

                          <span className="text-sm text-slate-300">
                            {log.action.replaceAll("_", " ")}
                          </span>

                        </td>

                        <td className="px-6 py-5">

                          <span className="font-mono text-xs text-slate-400">
                            {log.execution_id}
                          </span>

                        </td>

                        <td className="px-6 py-5">

                          <span className="font-semibold text-emerald-300">
                            ₹{Number(
                              log.recovered_amount
                            ).toLocaleString("en-IN")}
                          </span>

                        </td>

                        <td className="px-6 py-5">

                          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">

                            <CheckCircle2 size={14} />

                            {log.status}

                          </span>

                        </td>

                        <td className="px-6 py-5">

                          <span className="text-sm text-slate-400">

                            {new Date(
                              log.timestamp
                            ).toLocaleString("en-IN")}

                          </span>

                        </td>

                      </tr>

                    ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

        {/* FOOTER */}

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-600">

          <ShieldCheck size={14} />

          Every recovery decision and execution event is recorded for auditability

        </div>

      </div>
    </main>
  );
}