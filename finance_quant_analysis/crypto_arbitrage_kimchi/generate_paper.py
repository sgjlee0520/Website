import os
import psycopg2

# Connect to TimescaleDB
conn = psycopg2.connect(
    host=os.environ.get("UPBIT_DB_HOST", "127.0.0.1"),
    port=int(os.environ.get("UPBIT_DB_PORT", "5432")),
    dbname=os.environ.get("UPBIT_DB_NAME", "upbit_history"),
    user=os.environ.get("UPBIT_DB_USER", "quant_user"),
    password=os.environ.get("UPBIT_DB_PASSWORD", "")
)
cursor = conn.cursor()

# Get summary statistics from the continuous aggregate
cursor.execute("""
    SELECT pair_path, ROUND(MAX(max_profit)::numeric, 4), ROUND(AVG(avg_kimchi)::numeric, 4)
    FROM arb_logs_1min
    GROUP BY pair_path
    ORDER BY MAX(max_profit) DESC;
""")
rows = cursor.fetchall()

# Format the LaTeX table rows dynamically
table_rows = ""
for row in rows:
    table_rows += f"{row[0]} & {row[1]} & {row[2]} \\\\\n"

# The full LaTeX Template
latex_content = f"""\\documentclass[11pt, a4paper]{{article}}
\\usepackage[utf8]{{inputenc}}
\\usepackage{{amsmath, amssymb}}
\\usepackage{{graphicx}}
\\usepackage{{booktabs}}
\\usepackage{{geometry}}
\\geometry{{margin=1in}}

\\title{{\\textbf{{Empirical Observation of Transient Arbitrage Phase Transitions}}}}
\\author{{Songgun Lee \\\\ \\textit{{Department of Physics, UC Santa Barbara}}}}
\\date{{\\today}}

\\begin{{document}}
\\maketitle

\\section{{Empirical Results from Edge Node}}
The following data represents the continuous aggregation of our edge-computing node, capturing the maximum dislocation events across a heavily monitored timeframe.

\\begin{{table}}[h]
\\centering
\\caption{{Summary Statistics of Maximum Observed Dislocation by Asset}}
\\vspace{{0.2cm}}
\\begin{{tabular}}{{l | r | r}}
\\textit{{Asset Pair}} & \\textit{{Max Gross Profit (\\%)}} & \\textit{{Mean Kimchi Premium (\\%)}} \\\\
\\hline
{table_rows}\\end{{tabular}}
\\end{{table}}

\\begin{{figure}}[h]
    \\centering
    \\includegraphics[width=0.85\\textwidth]{{ada_compressed_analysis.png}}
    \\caption{{Correlation between the Kimchi Premium and Triangular Net Profit (1-Minute Intervals).}}
\\end{{figure}}

\\end{{document}}
"""

with open("dynamic_paper.tex", "w") as f:
    f.write(latex_content)

print("Success! dynamic_paper.tex has been generated with live database metrics.")
