#!/usr/bin/python3

"""
Sales Analytics: Generate plots showing item sales velocity
"""
import sys
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
from inventory_stock import load_sales_history, get_sales_summary
#i need to import for y=only integers
from matplotlib.ticker import MaxNLocator
def plot_sales_velocity(days=30):
    """Generate bar chart showing units sold per item"""
    summary = get_sales_summary(days)
    if not summary:
        print("No sales data available")
        return

    #Sort items by quantity sold (descending to show "winner items")
    sorted_items = sorted(summary.items(), key=lambda x: x[1], reverse=True)
    items = [x[0] for x in sorted_items]
    quantities = [x[1] for x in sorted_items]

    plt.figure(figsize=(10, 6))
    bars = plt.bar(items, quantities, color='steelblue')

    #Highlight top 3 sellers (Gold, Silver, Bronze)
    colors = ['gold', 'silver', '#CD7F32']
    for bar, color in zip(bars[:3], colors):
        bar.set_color(color)

    plt.xlabel('Product')
    plt.ylabel('Units Sold')
    plt.title(f'Sales Velocity - Last {days} Days')
    plt.xticks(rotation=45, ha='right')
    plt.gca().yaxis.set_major_locator(MaxNLocator(integer=True))
    plt.tight_layout()

    filename = f'sales_velocity_{days}days.png'
    plt.savefig(filename, dpi=300)
    print(f"✓ Plot saved as '{filename}'")
    plt.show()

def plot_daily_sales(days=30):
    """Generate line chart showing daily sales over time"""
    history = load_sales_history()
    if not history:
        print("No sales data available")
        return

    end_date = datetime.now()
    start_date=end_date-timedelta(days=days)

    #Initialize daily counts
    daily_counts={}
    curr = start_date
    while curr <= end_date:
        daily_counts[curr.date()] = 0
        curr += timedelta(days=1)

    #Aggregate sales
    for sale in history:
        sale_date = datetime.fromisoformat(sale["timestamp"]).date()
        if start_date.date() <= sale_date <= end_date.date():
            daily_counts[sale_date] += sum(sale["items"].values())

    #Plot
    dates = sorted(daily_counts.keys())
    counts = [daily_counts[d] for d in dates]
    plt.figure(figsize=(10, 6))
    plt.plot(dates, counts, marker='o', linewidth=2)
    plt.xlabel('Date')
    plt.ylabel('Items Sold')
    plt.title(f'Daily Sales - Last {days} Days')
    plt.xticks(rotation=45,ha='right')
    plt.gca().yaxis.set_major_locator(MaxNLocator(integer=True))

    plt.tight_layout()

    filename = f'daily_sales_{days}days.png'
    plt.savefig(filename, dpi=300)
    print(f"✓ Plot saved as '{filename}'")
    plt.show()

def generate_reorder_report():
    """Print report showing items to reorder"""
    summary = get_sales_summary(30)
    if not summary:
        print("No sales data found.")
        return

    print(f"\n {'='*60} \n 📊 REORDER REPORT (Last 30 Days) \n {'='*60}")
    print(f"{'Product':<40} {'Sold':>10} {'Priority':>10} \n {'-'*60}")

    for item, qty in sorted(summary.items(), key=lambda x: x[1], reverse=True):
        if qty > 100: priority="HIGH"
        elif qty > 50: priority="MEDIUM"
        else: priority ="LOW"
        
        print(f"{item:<40} {qty:>10} {priority:>10}")
    print("="*60)

if __name__ == '__main__':
    print("=== Warehouse Sales Analytics ===\n")
    days = int(sys.argv[1]) if len(sys.argv) > 1 else 30
    print(f"Analyzing last {days} days...\n")
    
    plot_sales_velocity(days)
    plot_daily_sales(days)
    generate_reorder_report()
