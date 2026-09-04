import json
import os
from datetime import datetime

import pandas as pd


# ============================================================
# AUDIT LOG STORAGE CONFIGURATION
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

AUDIT_LOG_FILE = os.path.join(
    BASE_DIR,
    "audit_logs.json"
)

# ============================================================
# INTELLIGENT INCIDENT DETECTION
# ============================================================

def analyze_transactions(df: pd.DataFrame):
    """
    Detect abnormal payment failure patterns using
    adaptive anomaly scoring.

    The engine considers:
    - Failure rate
    - Deviation from overall system failure rate
    - Failure volume
    - Revenue exposure
    """

    total_transactions = len(df)

    # -------------------------------------------------
    # HANDLE EMPTY DATASET
    # -------------------------------------------------

    if total_transactions == 0:

        return {
            "summary": {
                "total_transactions": 0,
                "failed_transactions": 0,
                "overall_failure_rate": 0,
                "total_revenue_at_risk": 0
            },

            "incidents": []
        }

    # -------------------------------------------------
    # OVERALL SYSTEM BASELINE
    # -------------------------------------------------

    total_failed = len(
        df[df["status"] == "FAILED"]
    )

    overall_failure_rate = (
        total_failed / total_transactions
    ) * 100

    # -------------------------------------------------
    # GROUP TRANSACTIONS
    # -------------------------------------------------

    grouped = (
        df.groupby(
            [
                "provider",
                "payment_method"
            ]
        )
        .agg(
            total_transactions=(
                "transaction_id",
                "count"
            ),

            failed_transactions=(
                "status",
                lambda x: (x == "FAILED").sum()
            ),

            revenue_at_risk=(
                "amount",
                lambda x: x[
                    df.loc[x.index, "status"] == "FAILED"
                ].sum()
            )
        )
        .reset_index()
    )

    # -------------------------------------------------
    # CALCULATE FAILURE RATE
    # -------------------------------------------------

    grouped["failure_rate"] = (
        grouped["failed_transactions"]
        /
        grouped["total_transactions"]
        * 100
    )

    incidents = []

    # -------------------------------------------------
    # ANALYZE EACH PAYMENT SEGMENT
    # -------------------------------------------------

    for _, row in grouped.iterrows():

        total = int(
            row["total_transactions"]
        )

        failed = int(
            row["failed_transactions"]
        )

        failure_rate = float(
            row["failure_rate"]
        )

        revenue_at_risk = float(
            row["revenue_at_risk"]
        )

        # Skip segments with no failures

        if failed == 0:
            continue

        # -------------------------------------------------
        # ANOMALY FACTOR
        #
        # Compare this segment against the
        # overall system baseline.
        # -------------------------------------------------

        baseline = max(
            overall_failure_rate,
            1
        )

        anomaly_ratio = (
            failure_rate
            /
            baseline
        )

        # -------------------------------------------------
        # FAILURE VOLUME FACTOR
        #
        # More failures = higher confidence
        # that this is a meaningful incident.
        # -------------------------------------------------

        volume_factor = min(
            failed / 20,
            1
        )

        # -------------------------------------------------
        # REVENUE EXPOSURE FACTOR
        #
        # Normalize financial exposure.
        # -------------------------------------------------

        revenue_factor = min(
            revenue_at_risk / 50000,
            1
        )

        # -------------------------------------------------
        # ANOMALY SCORE
        #
        # Weighted combination of:
        # - abnormal failure behaviour
        # - failure volume
        # - financial impact
        # -------------------------------------------------

        anomaly_score = (
            min(
                anomaly_ratio / 3,
                1
            )
            * 50
            +
            volume_factor * 25
            +
            revenue_factor * 25
        )

        anomaly_score = round(
            anomaly_score,
            2
        )

        # -------------------------------------------------
        # INCIDENT DECISION
        #
        # Require:
        # - meaningful anomaly
        # - enough transaction evidence
        # -------------------------------------------------

        is_incident = (
            anomaly_score >= 45
            and failed >= 3
        )

        if not is_incident:
            continue

        # -------------------------------------------------
        # SEVERITY CLASSIFICATION
        # -------------------------------------------------

        if anomaly_score >= 80:

            severity = "CRITICAL"

        elif anomaly_score >= 65:

            severity = "HIGH"

        elif anomaly_score >= 45:

            severity = "MEDIUM"

        else:

            severity = "LOW"

        # -------------------------------------------------
        # CREATE INCIDENT
        # -------------------------------------------------

        incident = {

            "provider":
                row["provider"],

            "payment_method":
                row["payment_method"],

            "total_transactions":
                total,

            "failed_transactions":
                failed,

            "failure_rate":
                round(
                    failure_rate,
                    2
                ),

            "overall_failure_rate":
                round(
                    overall_failure_rate,
                    2
                ),

            "anomaly_ratio":
                round(
                    anomaly_ratio,
                    2
                ),

            "anomaly_score":
                anomaly_score,

            "revenue_at_risk":
                round(
                    revenue_at_risk,
                    2
                ),

            "severity":
                severity
        }

        incidents.append(
            incident
        )

    # -------------------------------------------------
    # SORT MOST CRITICAL INCIDENT FIRST
    # -------------------------------------------------

    incidents = sorted(

        incidents,

        key=lambda x:
            x["anomaly_score"],

        reverse=True
    )

    # -------------------------------------------------
    # TOTAL REVENUE AT RISK
    # -------------------------------------------------

    total_revenue_at_risk = sum(

        incident["revenue_at_risk"]

        for incident in incidents
    )

    # -------------------------------------------------
    # RETURN ANALYSIS
    # -------------------------------------------------

    return {

        "summary": {

            "total_transactions":
                total_transactions,

            "failed_transactions":
                total_failed,

            "overall_failure_rate":
                round(
                    overall_failure_rate,
                    2
                ),

            "total_revenue_at_risk":
                round(
                    total_revenue_at_risk,
                    2
                )
        },

        "incidents":
            incidents
    }


# ============================================================
# INTELLIGENT ROOT CAUSE ANALYSIS
# ============================================================

def analyze_root_cause(
    df: pd.DataFrame,
    incident: dict
):
    """
    Identify the most probable root cause behind an incident.

    Confidence is calculated using:
    - Dominance of the primary failure reason
    - Separation from competing failure reasons
    - Evidence volume
    - Incident severity
    """

    provider = incident["provider"]
    payment_method = incident["payment_method"]

    incident_transactions = df[
        (df["provider"] == provider)
        &
        (df["payment_method"] == payment_method)
        &
        (df["status"] == "FAILED")
    ]

    # -------------------------------------------------
    # HANDLE NO FAILURE DATA
    # -------------------------------------------------

    if incident_transactions.empty:

        return {
            "root_cause": "UNKNOWN",
            "confidence": 0,
            "diagnosis": "No failed transactions available for analysis.",
            "evidence": []
        }

    # -------------------------------------------------
    # FAILURE REASON DISTRIBUTION
    # -------------------------------------------------

    reason_counts = (
        incident_transactions["failure_reason"]
        .fillna("UNKNOWN")
        .value_counts()
    )

    total_failures = len(incident_transactions)

    primary_reason = reason_counts.index[0]
    primary_count = int(reason_counts.iloc[0])

    # -------------------------------------------------
    # DOMINANCE SCORE
    #
    # How strongly the primary reason dominates.
    # -------------------------------------------------

    dominance = (
        primary_count / total_failures
    )

    # -------------------------------------------------
    # SEPARATION SCORE
    #
    # Compare primary cause with second-most common cause.
    # -------------------------------------------------

    if len(reason_counts) > 1:

        second_count = int(
            reason_counts.iloc[1]
        )

        separation = (
            primary_count - second_count
        ) / total_failures

    else:

        # Only one failure reason exists
        separation = 1.0

    # -------------------------------------------------
    # EVIDENCE STRENGTH
    #
    # More failures provide stronger evidence.
    # -------------------------------------------------

    evidence_strength = min(
        total_failures / 20,
        1
    )

    # -------------------------------------------------
    # INCIDENT SEVERITY FACTOR
    # -------------------------------------------------

    severity_weights = {
        "LOW": 0.55,
        "MEDIUM": 0.70,
        "HIGH": 0.85,
        "CRITICAL": 1.0
    }

    severity_factor = severity_weights.get(
        incident.get("severity", "MEDIUM"),
        0.70
    )

    # -------------------------------------------------
    # ROOT CAUSE CONFIDENCE
    #
    # Weighted explainable confidence model.
    # -------------------------------------------------

    confidence = (

        dominance * 45

        +

        separation * 25

        +

        evidence_strength * 20

        +

        severity_factor * 10
    )

    # Keep confidence within realistic range
    confidence = min(
        max(confidence, 0),
        99.5
    )

    confidence = round(
        confidence,
        2
    )

    # -------------------------------------------------
    # BUILD EVIDENCE
    # -------------------------------------------------

    evidence = []

    for reason, count in reason_counts.items():

        percentage = (
            count / total_failures * 100
        )

        evidence.append({

            "reason": reason,

            "count": int(count),

            "percentage": round(
                percentage,
                2
            )
        })

    # -------------------------------------------------
    # HUMAN-READABLE DIAGNOSIS
    # -------------------------------------------------

    dominance_percentage = round(
        dominance * 100,
        1
    )

    if primary_reason == "PROVIDER_TIMEOUT":

        diagnosis = (
            f"Provider timeout is the dominant failure pattern, "
            f"accounting for {dominance_percentage}% of failed "
            f"transactions for {provider} via {payment_method}. "
            f"The confidence score incorporates failure dominance, "
            f"pattern separation, evidence volume, and incident severity."
        )

    elif primary_reason == "BANK_DECLINED":

        diagnosis = (
            f"Bank decline responses are the dominant failure pattern, "
            f"accounting for {dominance_percentage}% of failed "
            f"transactions. The pattern indicates that an immediate "
            f"retry may not be the optimal recovery action."
        )

    elif primary_reason == "NETWORK_TIMEOUT":

        diagnosis = (
            f"Network timeout failures dominate the incident, "
            f"representing {dominance_percentage}% of failures. "
            f"A delayed retry strategy is recommended to avoid "
            f"repeating the transaction during instability."
        )

    elif primary_reason == "INSUFFICIENT_FUNDS":

        diagnosis = (
            f"Insufficient funds is the dominant failure pattern, "
            f"representing {dominance_percentage}% of failures. "
            f"Immediate retry carries a lower recovery probability."
        )

    else:

        diagnosis = (
            f"{primary_reason} is the most probable root cause, "
            f"accounting for {dominance_percentage}% of the observed "
            f"failed transactions."
        )

    # -------------------------------------------------
    # RETURN ROOT CAUSE ANALYSIS
    # -------------------------------------------------

    return {

        "root_cause": primary_reason,

        "confidence": confidence,

        "diagnosis": diagnosis,

        "evidence": evidence,

        "analysis_metrics": {

            "total_failures":
                total_failures,

            "dominance_percentage":
                round(
                    dominance * 100,
                    2
                ),

            "separation_score":
                round(
                    separation * 100,
                    2
                ),

            "evidence_strength":
                round(
                    evidence_strength * 100,
                    2
                )
        }
    }


# ============================================================
# INTELLIGENT RECOVERY PLAN GENERATION
# ============================================================

def generate_recovery_plan(
    df: pd.DataFrame,
    incident: dict,
    root_cause_analysis: dict
):
    """
    Generate an explainable recovery plan.

    Each candidate receives an individual recovery probability
    based on:
    - Base strategy effectiveness
    - Root cause confidence
    - Transaction value
    - Incident anomaly score
    """

    provider = incident["provider"]
    payment_method = incident["payment_method"]

    root_cause = root_cause_analysis["root_cause"]

    root_confidence = float(
        root_cause_analysis.get(
            "confidence",
            50
        )
    )

    anomaly_score = float(
        incident.get(
            "anomaly_score",
            50
        )
    )

    # -------------------------------------------------
    # GET FAILED TRANSACTIONS FOR THIS INCIDENT
    # -------------------------------------------------

    failed_transactions = df[
        (df["provider"] == provider)
        &
        (df["payment_method"] == payment_method)
        &
        (df["status"] == "FAILED")
    ].copy()

    if failed_transactions.empty:

        return {
            "strategy": "MANUAL_REVIEW",
            "strategy_description":
                "No failed transactions available for recovery.",
            "root_cause": root_cause,
            "candidate_count": 0,
            "selected_candidates": [],
            "potential_recovery": 0,
            "expected_recovery": 0
        }

    # -------------------------------------------------
    # STRATEGY INTELLIGENCE
    # -------------------------------------------------

    strategy_map = {

        "PROVIDER_TIMEOUT": {
            "strategy": "SMART_RETRY",

            "description":
                "Retry eligible transactions after provider stability is restored.",

            "base_probability": 88
        },

        "NETWORK_TIMEOUT": {
            "strategy": "DELAYED_RETRY",

            "description":
                "Retry transactions after a controlled delay to avoid temporary network instability.",

            "base_probability": 78
        },

        "BANK_DECLINED": {
            "strategy":
                "ALTERNATE_PAYMENT_METHOD",

            "description":
                "Recommend an alternative payment method instead of repeating the same declined transaction.",

            "base_probability": 65
        },

        "INSUFFICIENT_FUNDS": {
            "strategy": "DELAYED_RETRY",

            "description":
                "Delay recovery attempts to increase the probability of sufficient funds becoming available.",

            "base_probability": 48
        }
    }

    strategy_info = strategy_map.get(
        root_cause,
        {
            "strategy": "MANUAL_REVIEW",

            "description":
                "The failure pattern requires manual review before automated recovery.",

            "base_probability": 35
        }
    )

    # -------------------------------------------------
    # NORMALIZATION VALUES
    # -------------------------------------------------

    max_amount = max(
        float(amount)
        for amount in failed_transactions["amount"]
    )

    if max_amount <= 0:
        max_amount = 1

    candidates = []

    # -------------------------------------------------
    # MULTI-FACTOR CANDIDATE SCORING
    # -------------------------------------------------

    for _, transaction in failed_transactions.iterrows():

        amount = float(
            transaction["amount"]
        )

        # Transaction value factor: 0 to 1
        amount_factor = amount / max_amount

        # Root cause confidence factor: 0 to 1
        confidence_factor = root_confidence / 100

        # Anomaly reliability factor: 0 to 1
        anomaly_factor = anomaly_score / 100

        # -------------------------------------------------
        # INDIVIDUAL RECOVERY PROBABILITY
        #
        # The amount factor introduces a small adjustment
        # so high-value transactions receive stronger
        # recovery priority without unrealistically changing
        # the recovery probability.
        # -------------------------------------------------

        recovery_probability = (

            strategy_info["base_probability"]

            * 0.70

            +

            root_confidence
            * 0.20

            +

            anomaly_score
            * 0.05

            +

            amount_factor
            * 100
            * 0.05
        )

        # Keep probability realistic
        recovery_probability = min(
            max(
                recovery_probability,
                5
            ),
            98
        )

        # -------------------------------------------------
        # PRIORITY SCORE
        #
        # Prioritizes transactions using:
        # - Recovery probability
        # - Financial impact
        # -------------------------------------------------

        priority_score = (

            recovery_probability
            * 0.70

            +

            amount_factor
            * 100
            * 0.30
        )

        candidates.append({

            "transaction_id":
                transaction["transaction_id"],

            "amount":
                round(
                    amount,
                    2
                ),

            "strategy":
                strategy_info["strategy"],

            "recovery_probability":
                round(
                    recovery_probability,
                    2
                ),

            "priority_score":
                round(
                    priority_score,
                    2
                ),

            # Explainability data
            "scoring_factors": {

                "base_strategy_probability":
                    strategy_info["base_probability"],

                "root_cause_confidence":
                    round(
                        root_confidence,
                        2
                    ),

                "incident_anomaly_score":
                    round(
                        anomaly_score,
                        2
                    ),

                "transaction_value_factor":
                    round(
                        amount_factor * 100,
                        2
                    )
            }
        })

    # -------------------------------------------------
    # SORT BEST RECOVERY CANDIDATES FIRST
    # -------------------------------------------------

    candidates = sorted(
        candidates,
        key=lambda x:
            x["priority_score"],
        reverse=True
    )

    # -------------------------------------------------
    # SELECT TOP 3 FOR RECOVERY EXECUTION
    # -------------------------------------------------

    selected_candidates = candidates[:3]

    # -------------------------------------------------
    # RECOVERY VALUE CALCULATIONS
    # -------------------------------------------------

    potential_recovery = sum(
        candidate["amount"]
        for candidate
        in selected_candidates
    )

    expected_recovery = sum(
        candidate["amount"]
        *
        candidate["recovery_probability"]
        / 100
        for candidate
        in selected_candidates
    )

    # -------------------------------------------------
    # OVERALL PLAN CONFIDENCE
    # -------------------------------------------------

    if selected_candidates:

        average_confidence = sum(
            candidate[
                "recovery_probability"
            ]
            for candidate
            in selected_candidates
        ) / len(selected_candidates)

    else:

        average_confidence = 0

    # -------------------------------------------------
    # RETURN RECOVERY PLAN
    # -------------------------------------------------

    return {

        "strategy":
            strategy_info["strategy"],

        "strategy_description":
            strategy_info["description"],

        "root_cause":
            root_cause,

        "root_cause_confidence":
            round(
                root_confidence,
                2
            ),

        "candidate_count":
            len(candidates),

        "selected_candidates":
            selected_candidates,

        "potential_recovery":
            round(
                potential_recovery,
                2
            ),

        "expected_recovery":
            round(
                expected_recovery,
                2
            ),

        "plan_confidence":
            round(
                average_confidence,
                2
            )
    }

# ============================================================
# INTELLIGENT RECOVERY EXECUTION
# ============================================================

def execute_recovery_plan(
    recovery_plan: dict
):
    """
    Execute an approved recovery plan.

    This demo execution layer simulates a production
    recovery orchestration engine.

    Each transaction is evaluated using:
    - Recovery probability
    - Candidate priority
    - Safety validation
    - Recovery strategy

    In production, this layer would communicate with
    payment providers or recovery orchestration services.
    """

    execution_results = []

    selected_candidates = recovery_plan.get(
        "selected_candidates",
        []
    )

    # -------------------------------------------------
    # EXECUTION IDENTIFIERS
    # -------------------------------------------------

    execution_time = datetime.now()

    execution_id = (
        f"EXEC-"
        f"{execution_time.strftime('%Y%m%d%H%M%S')}"
    )

    # -------------------------------------------------
    # HANDLE EMPTY RECOVERY PLAN
    # -------------------------------------------------

    if not selected_candidates:

        return {

            "execution_id":
                execution_id,

            "executed_at":
                execution_time.isoformat(),

            "status":
                "NO_ACTION_REQUIRED",

            "total_candidates":
                0,

            "recovered_count":
                0,

            "pending_count":
                0,

            "recovered_amount":
                0,

            "pending_amount":
                0,

            "success_rate":
                0,

            "strategy":
                recovery_plan.get(
                    "strategy",
                    "UNKNOWN"
                ),

            "results":
                []
        }

    # -------------------------------------------------
    # EXECUTE EACH RECOVERY CANDIDATE
    # -------------------------------------------------

    for index, candidate in enumerate(
        selected_candidates
    ):

        transaction_id = candidate.get(
            "transaction_id"
        )

        amount = float(
            candidate.get(
                "amount",
                0
            )
        )

        probability = float(
            candidate.get(
                "recovery_probability",
                0
            )
        )

        priority_score = float(
            candidate.get(
                "priority_score",
                0
            )
        )

        strategy = candidate.get(
            "strategy",
            recovery_plan.get(
                "strategy",
                "MANUAL_REVIEW"
            )
        )

        # -------------------------------------------------
        # SAFETY VALIDATION
        #
        # A transaction must meet a minimum confidence
        # threshold before automated recovery.
        # -------------------------------------------------

        safety_validated = (
            probability >= 50
            and amount > 0
            and transaction_id is not None
        )

        # -------------------------------------------------
        # EXECUTION DECISION
        #
        # Demo logic intentionally produces realistic
        # mixed outcomes.
        #
        # High-confidence candidates:
        #     RECOVERED
        #
        # Medium-confidence candidates:
        #     PENDING
        #
        # Low-confidence candidates:
        #     MANUAL_REVIEW
        # -------------------------------------------------

        if not safety_validated:

            execution_status = (
                "MANUAL_REVIEW"
            )

            execution_reason = (
                "Candidate did not meet automated "
                "recovery safety requirements."
            )

        elif probability >= 80:

            execution_status = (
                "RECOVERED"
            )

            execution_reason = (
                "High-confidence recovery candidate "
                "successfully processed."
            )

        elif probability >= 65:

            # Keep some medium-confidence transactions
            # pending to demonstrate realistic recovery
            # orchestration.

            if index == len(selected_candidates) - 1:

                execution_status = (
                    "PENDING"
                )

                execution_reason = (
                    "Recovery attempt scheduled for "
                    "controlled follow-up."
                )

            else:

                execution_status = (
                    "RECOVERED"
                )

                execution_reason = (
                    "Recovery successfully completed "
                    "after strategy validation."
                )

        else:

            execution_status = (
                "PENDING"
            )

            execution_reason = (
                "Recovery probability is below the "
                "automatic execution threshold."
            )

        # -------------------------------------------------
        # STORE TRANSACTION EXECUTION RESULT
        # -------------------------------------------------

        execution_results.append({

            "transaction_id":
                transaction_id,

            "amount":
                round(
                    amount,
                    2
                ),

            "strategy":
                strategy,

            "recovery_probability":
                round(
                    probability,
                    2
                ),

            "priority_score":
                round(
                    priority_score,
                    2
                ),

            "safety_validated":
                safety_validated,

            "execution_status":
                execution_status,

            "execution_reason":
                execution_reason
        })

    # -------------------------------------------------
    # CALCULATE EXECUTION METRICS
    # -------------------------------------------------

    recovered_results = [

        result

        for result in execution_results

        if result[
            "execution_status"
        ] == "RECOVERED"
    ]

    pending_results = [

        result

        for result in execution_results

        if result[
            "execution_status"
        ] == "PENDING"
    ]

    manual_review_results = [

        result

        for result in execution_results

        if result[
            "execution_status"
        ] == "MANUAL_REVIEW"
    ]

    # -------------------------------------------------
    # RECOVERED AMOUNT
    # -------------------------------------------------

    recovered_amount = sum(

        result["amount"]

        for result
        in recovered_results
    )

    # -------------------------------------------------
    # PENDING AMOUNT
    # -------------------------------------------------

    pending_amount = sum(

        result["amount"]

        for result
        in pending_results
    )

    # -------------------------------------------------
    # COUNTS
    # -------------------------------------------------

    recovered_count = len(
        recovered_results
    )

    pending_count = len(
        pending_results
    )

    manual_review_count = len(
        manual_review_results
    )

    # -------------------------------------------------
    # SUCCESS RATE
    # -------------------------------------------------

    total_candidates = len(
        selected_candidates
    )

    success_rate = (

        recovered_count
        /
        total_candidates
        * 100

        if total_candidates > 0

        else 0
    )

    # -------------------------------------------------
    # DETERMINE OVERALL STATUS
    # -------------------------------------------------

    if recovered_count == total_candidates:

        overall_status = (
            "COMPLETED"
        )

    elif recovered_count > 0:

        overall_status = (
            "PARTIALLY_COMPLETED"
        )

    elif manual_review_count > 0:

        overall_status = (
            "MANUAL_REVIEW_REQUIRED"
        )

    else:

        overall_status = (
            "PENDING"
        )

    # -------------------------------------------------
    # RETURN EXECUTION RESPONSE
    # -------------------------------------------------

    return {

        # ---------------------------------------------
        # EXECUTION IDENTIFIERS
        # ---------------------------------------------

        "execution_id":
            execution_id,

        "executed_at":
            execution_time.isoformat(),

        # ---------------------------------------------
        # EXECUTION STATUS
        # ---------------------------------------------

        "status":
            overall_status,

        # ---------------------------------------------
        # RECOVERY STRATEGY
        # ---------------------------------------------

        "strategy":
            recovery_plan.get(
                "strategy",
                "UNKNOWN"
            ),

        # ---------------------------------------------
        # EXECUTION METRICS
        # ---------------------------------------------

        "total_candidates":
            total_candidates,

        "recovered_count":
            recovered_count,

        "pending_count":
            pending_count,

        "manual_review_count":
            manual_review_count,

        "success_rate":
            round(
                success_rate,
                2
            ),

        # ---------------------------------------------
        # FINANCIAL RESULTS
        # ---------------------------------------------

        "recovered_amount":
            round(
                recovered_amount,
                2
            ),

        "pending_amount":
            round(
                pending_amount,
                2
            ),

        "potential_recovery":
            round(
                float(
                    recovery_plan.get(
                        "potential_recovery",
                        0
                    )
                ),
                2
            ),

        "expected_recovery":
            round(
                float(
                    recovery_plan.get(
                        "expected_recovery",
                        0
                    )
                ),
                2
            ),

        # ---------------------------------------------
        # CANDIDATE EXECUTION RESULTS
        # ---------------------------------------------

        "results":
            execution_results
    }

# ============================================================
# AUDIT LOG PERSISTENCE
# ============================================================

def load_audit_logs():
    """
    Load audit logs from persistent JSON storage.
    """

    if not os.path.exists(
        AUDIT_LOG_FILE
    ):
        return []

    try:

        with open(
            AUDIT_LOG_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            data = json.load(file)

            if isinstance(data, list):
                return data

            return []

    except (
        json.JSONDecodeError,
        OSError
    ):

        return []


def save_audit_logs(logs: list):
    """
    Save audit logs to persistent JSON storage.
    """

    with open(
        AUDIT_LOG_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            logs,
            file,
            indent=4,
            ensure_ascii=False
        )


# ============================================================
# AUDIT LOG CREATION
# ============================================================

def create_audit_log(
    action: str,
    execution_result: dict
):
    """
    Create and persist an audit log entry.
    """

    logs = load_audit_logs()

    # Generate sequential audit ID

    next_audit_number = (
        len(logs) + 1
    )

    audit_entry = {

        "audit_id":
            f"AUD-{next_audit_number:04d}",

        "timestamp":
            datetime.now().isoformat(),

        "action":
            action,

        "execution_id":
            execution_result["execution_id"],

        "status":
            execution_result["status"],

        "total_candidates":
            execution_result[
                "total_candidates"
            ],

        "recovered_count":
            execution_result[
                "recovered_count"
            ],

        "pending_count":
            execution_result[
                "pending_count"
            ],

        "recovered_amount":
            execution_result[
                "recovered_amount"
            ],

        "execution_results":
            execution_result[
                "results"
            ]
    }

    logs.append(
        audit_entry
    )

    save_audit_logs(
        logs
    )

    return audit_entry


# ============================================================
# AUDIT LOG RETRIEVAL
# ============================================================

def get_audit_logs():
    """
    Return all persisted recovery audit logs.
    """

    return load_audit_logs()