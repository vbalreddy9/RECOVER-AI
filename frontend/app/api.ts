const API_URL = "http://127.0.0.1:8000";

async function apiFetch(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// Backend health check
export async function getHealth() {
  return apiFetch("/health");
}

// Get payment transactions
export async function getTransactions() {
  return apiFetch("/transactions");
}

// Get detected incidents
export async function getIncidents() {
  return apiFetch("/incidents");
}

// Get AI investigation
export async function getInvestigation() {
  return apiFetch("/investigation");
}

// Get AI recovery plan
export async function getRecoveryPlan() {
  return apiFetch("/recovery-plan");
}

// Execute recovery action
export async function executeRecovery() {
  return apiFetch("/execute-recovery", {
    method: "POST",
  });
}

// Get audit history
export async function getAuditLogs() {
  return apiFetch("/audit-logs");
}