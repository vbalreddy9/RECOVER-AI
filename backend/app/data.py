import random
from datetime import datetime, timedelta

import pandas as pd


def generate_transactions(count: int = 500):
    """
    Generate realistic simulated payment transaction data.

    A small cluster of transactions is intentionally created
    with provider failures so the RECOVR engine has an incident
    to detect and investigate.
    """

    transactions = []

    providers = [
        "Razorpay",
        "Provider-X",
        "Provider-Y",
    ]

    payment_methods = [
        "UPI",
        "Card",
        "Net Banking",
    ]

    base_time = datetime.now() - timedelta(hours=6)

    for i in range(count):

        transaction_time = base_time + timedelta(
            seconds=i * 40
        )

        provider = random.choice(providers)
        payment_method = random.choice(payment_methods)

        amount = random.randint(500, 15000)

        # Normal transaction behavior
        status = random.choices(
            ["SUCCESS", "FAILED"],
            weights=[88, 12],
        )[0]

        failure_reason = None

        if status == "FAILED":
            failure_reason = random.choice([
                "INSUFFICIENT_FUNDS",
                "USER_CANCELLED",
                "NETWORK_TIMEOUT",
                "BANK_DECLINED",
            ])

        # -------------------------------------------------
        # SIMULATED INCIDENT
        # -------------------------------------------------
        # Create a cluster of provider failures near the
        # end of the transaction stream.
        # -------------------------------------------------

        if i >= count - 60:

            provider = "Provider-X"
            payment_method = "UPI"

            if random.random() < 0.72:

                status = "FAILED"
                failure_reason = "PROVIDER_TIMEOUT"

        transaction = {
            "transaction_id": f"TXN-{100000 + i}",
            "timestamp": transaction_time.isoformat(),
            "amount": amount,
            "provider": provider,
            "payment_method": payment_method,
            "status": status,
            "failure_reason": failure_reason,
        }

        transactions.append(transaction)

    return pd.DataFrame(transactions)


def get_transactions():

    """
    Returns transaction records as JSON-compatible dictionaries.
    """

    df = generate_transactions()

    return df.to_dict(
        orient="records"
    )
# Shared in-memory dataset for the current RECOVR demo session
transactions_df = generate_transactions()


def get_dataframe():
    """
    Return the shared transaction dataset.
    """
    return transactions_df.copy()