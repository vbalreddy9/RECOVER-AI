from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.data import (
    get_transactions,
    get_dataframe
)

from app.engine import (
    analyze_transactions,
    analyze_root_cause,
    generate_recovery_plan,
    execute_recovery_plan,
    create_audit_log,
    get_audit_logs
)

app = FastAPI(
    title="RECOVR AI API",
    description="AI-powered payment recovery intelligence system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "RECOVR AI backend is running",
        "status": "healthy"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "RECOVR AI"
    }

@app.get("/transactions")
def transactions():
    return get_transactions()

@app.get("/incidents")
def incidents():

    df = get_dataframe()

    analysis = analyze_transactions(df)

    return analysis

@app.get("/investigation")
def investigation():

    # Get the shared transaction dataset
    df = get_dataframe()

    # Detect incidents in the transaction data
    analysis = analyze_transactions(df)

    # If no suspicious incident was detected
    if not analysis["incidents"]:

        return {
            "incident_detected": False,
            "message": "No significant incident detected"
        }

    # Select the most suspicious incident
    incident = analysis["incidents"][0]

    # Analyze why this incident happened
    root_cause = analyze_root_cause(
        df,
        incident
    )

    # Return everything to the frontend
    return {
        "incident_detected": True,

        "incident": incident,

        "root_cause_analysis": root_cause
    }

@app.get("/recovery-plan")
def recovery_plan():

    # Get shared transaction data
    df = get_dataframe()

    # Detect incidents
    analysis = analyze_transactions(df)

    # Handle case where no incident exists
    if not analysis["incidents"]:

        return {
            "recovery_available": False,
            "message": "No significant incident detected"
        }

    # Select the primary incident
    incident = analysis["incidents"][0]

    # Investigate root cause
    root_cause = analyze_root_cause(
        df,
        incident
    )

    # Generate recovery intelligence
    plan = generate_recovery_plan(
        df,
        incident,
        root_cause
    )

    return {
        "recovery_available": True,

        "incident": incident,

        "root_cause_analysis": root_cause,

        "recovery_plan": plan
    }

@app.post("/execute-recovery")
def execute_recovery():

    # Get the shared transaction dataset
    df = get_dataframe()

    # Detect incidents
    analysis = analyze_transactions(df)

    if not analysis["incidents"]:

        return {
            "execution_available": False,
            "message": "No incident available for recovery"
        }

    # Select primary incident
    incident = analysis["incidents"][0]

    # Analyze root cause
    root_cause = analyze_root_cause(
        df,
        incident
    )

    # Generate recovery plan
    recovery_plan = generate_recovery_plan(
        df,
        incident,
        root_cause
    )

    # Execute the recovery plan
    execution_result = execute_recovery_plan(
        recovery_plan
    )

    # Create audit log
    audit_entry = create_audit_log(
        "RECOVERY_EXECUTED",
        execution_result
    )

    return {
        "execution_available": True,

        "execution": execution_result,

        "audit_log": audit_entry
    }

@app.get("/audit-logs")
def audit_log_history():

    return {
        "logs": get_audit_logs()
    }