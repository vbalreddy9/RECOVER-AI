const API_BASE_URL = "http://127.0.0.1:8000";

export async function getTransactions() {
  const response = await fetch(`${API_BASE_URL}/transactions`);

  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }

  return response.json();
}

export async function getIncidents() {
  const response = await fetch(`${API_BASE_URL}/incidents`);

  if (!response.ok) {
    throw new Error("Failed to fetch incidents");
  }

  return response.json();
}

export async function getInvestigation() {
  const response = await fetch(`${API_BASE_URL}/investigation`);

  if (!response.ok) {
    throw new Error("Failed to fetch investigation");
  }

  return response.json();
}

export async function getRecoveryPlan() {
  const response = await fetch(`${API_BASE_URL}/recovery-plan`);

  if (!response.ok) {
    throw new Error("Failed to fetch recovery plan");
  }

  return response.json();
}

export async function executeRecovery() {
  const response = await fetch(`${API_BASE_URL}/execute-recovery`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to execute recovery");
  }

  return response.json();
}

export async function getAuditLogs() {
  const response = await fetch(`${API_BASE_URL}/audit-logs`);

  if (!response.ok) {
    throw new Error("Failed to fetch audit logs");
  }

  return response.json();
}