import pandas as pd
import os
import psycopg2
import matplotlib.pyplot as plt

# Connect to TimescaleDB
conn = psycopg2.connect(
    host=os.environ.get("UPBIT_DB_HOST", "127.0.0.1"),
    port=int(os.environ.get("UPBIT_DB_PORT", "5432")),
    dbname=os.environ.get("UPBIT_DB_NAME", "upbit_history"),
    user=os.environ.get("UPBIT_DB_USER", "quant_user"),
    password=os.environ.get("UPBIT_DB_PASSWORD", "")
)

# Query the 1-minute compressed diary
query = """
SELECT minute_bucket as time, avg_kimchi as kimchi_premium, max_profit as net_profit_pct
FROM arb_logs_1min
WHERE pair_path = 'ADA'
"""

print("Querying compressed database... (This should be instant)")
df = pd.read_sql(query, conn)

plt.figure(figsize=(10, 6), dpi=300)

# Plot the 1-minute summaries
plt.scatter(df['kimchi_premium'], df['net_profit_pct'], alpha=0.5, s=2, color='navy', label='1-Min Max Profit')

# Add the 'Potential Energy Barrier'
plt.axhline(y=0.15, color='red', linestyle='--', label='Fee Threshold (0.15%)', linewidth=1.5)

# Highlight outliers
outliers = df[df['net_profit_pct'] > 0]
if not outliers.empty:
    plt.scatter(outliers['kimchi_premium'], outliers['net_profit_pct'], color='orange', s=20, label='Dislocation Events (> 0%)', zorder=5)

plt.title('ADA: Market Friction vs. Arbitrage Opportunity (Compressed History)', fontsize=14)
plt.xlabel('Average Kimchi Premium (%)', fontsize=12)
plt.ylabel('Maximum Triangular Net Profit (%)', fontsize=12)
plt.grid(True, alpha=0.3)
plt.legend(loc='lower right')

plt.tight_layout()
plt.savefig('ada_compressed_analysis.png')
print(f"Success! Plot generated with {len(df)} compressed 1-minute intervals.")
