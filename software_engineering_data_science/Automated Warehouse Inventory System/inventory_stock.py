#!/usr/bin/python3
"""
Inventory Stock Management
"""
import json
import os
from datetime import datetime

STOCK_FILE = "current_stock.json"
SALES_FILE = "sales_history.json"
LOW_STOCK_LIMIT = 40

#Starting Inventory
INITIAL_STOCK = {
    "Mini Flat Gora Dark Brown": 200,
    "Mini Flat Gora Black":200,
    "Mini Flat Gora Tan": 200,
    "Minkmore Rabbit Keyring Black": 200,
    "Minkmore Rabbit Keyring Baekseolgi": 200,
    "Minkmore Rabbit Keyring Powder": 200,
    "Minkmore Rabbit Keyring Bunyu": 200,
    "Minkmore Rabbit Keyring Yulmucha": 200,
    "Minkmore Rabbit Keyring Misutgaru": 200
}

def load_stock():
    """Load stock from disk or return initial defaults"""
    if os.path.exists(STOCK_FILE):
        with open(STOCK_FILE,'r') as f: return json.load(f)
    return INITIAL_STOCK.copy()

def save_stock(stock):
    with open(STOCK_FILE,'w') as f: json.dump(stock, f, indent=2)

def check_stock_availability(items_needed):
    """Return (True/False, List of missing items)"""
    current = load_stock()
    missing = []
    for item, qty in items_needed.items():
        if current.get(item, 0) < qty:
            missing.append(f"{item} (Have: {current.get(item, 0)})")
    return (len(missing) == 0, missing)

def deduct_stock(items_sold):
    """Subtract sold items from inventory"""
    stock = load_stock()
    for item, qty in items_sold.items():
        if item in stock:
            #preventing negative stock
            stock[item] = max(0, stock[item] - qty)
    save_stock(stock)

def get_low_stock_items():
    """Return list of items below threshold"""
    stock = load_stock()
    return [(k, v) for k, v in stock.items() if v<=LOW_STOCK_LIMIT]

def load_sales_history():
    """Load full sales history log"""
    if os.path.exists(SALES_FILE):
        with open(SALES_FILE, 'r') as f: return json.load(f)
    return []

def record_sale(order_id, items_sold):
    """Log sale to history file"""
    history = load_sales_history()
    
    history.append({
        "timestamp": datetime.now().isoformat(),
        "order_id": order_id,
        "items": items_sold
    })
    
    with open(SALES_FILE, 'w') as f: json.dump(history, f, indent=2)

def get_sales_summary(days=30):
    """Aggregate sales for last N days"""
    summary = {}
    history = load_sales_history()
    
    cutoff = datetime.now().timestamp() - (days * 86400)
    
    for sale in history:
        sale_ts = datetime.fromisoformat(sale["timestamp"]).timestamp()
        if sale_ts >= cutoff:
            for item, qty in sale["items"].items():
                summary[item] = summary.get(item, 0) + qty
    return summary

