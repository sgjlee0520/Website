#!/usr/bin/python3
#Fianl version: 12/08 22:10
#I removed the audio feedback module because the Raspberry Pi 5’s internal 
#audio hardware drivers proved inconsistent across different OS updates. 
#To ensure the system remains robust and crash-proof during the demo, 
# I decided to rely exclusively on the high-contrast visual GUI 
#(Red/Green alerts), which provides 100% reliability without external hardware
# dependencies. On top of that, relying to a beeper in a warehouse where hundreds
# of orders are processed everyday may not be a smart decision.
#
#
#Emojis imported for intuitive UI/UX, copy and pasted from Noto Color Emoji. That
#makes these emojis not-os dependent.
"""
Warehouse Scanner - GUI Version with Tkinter
"""
"""
Warehouse Scanner - GUI Version with Tkinter
"""

import tkinter as tk
from tkinter import ttk, messagebox
from barcode_info import lookup_barcode
from waybill_database import get_waybill_order, is_waybill
from inventory_stock import check_stock_availability, deduct_stock, record_sale

class WarehouseGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Warehouse System")
        #KIOSK MODE: Fullscreen
        self.root.attributes('-fullscreen', True)
        self.root.bind("<Escape>", lambda e: self.root.destroy()) 
        
        self.current_order = None
        self.required_items = {}
        self.scanned_items = {}
        
        self.setup_ui()
        self.barcode_entry.focus_set()
    
    def setup_ui(self):
        #Title
        tk.Label(self.root, text="📦 WAREHOUSE SYSTEM", font=('Arial', 24, 'bold'), bg='#2c3e50', fg='white', pady=20).pack(fill=tk.X)
        
        #Input Area
        input_frame = tk.Frame(self.root, pady=20)
        input_frame.pack(fill=tk.X)
        tk.Label(input_frame, text="SCAN BARCODE:", font=('Arial', 14)).pack(side=tk.LEFT, padx=20)
        
        self.barcode_entry = tk.Entry(input_frame, font=('Arial', 14), width=30)
        self.barcode_entry.pack(side=tk.LEFT, padx=10)
        self.barcode_entry.bind('<Return>', self.on_scan)
        
        self.status_label = tk.Label(input_frame, text="READY - SCAN WAYBILL", font=('Arial', 14), fg='green')
        self.status_label.pack(side=tk.LEFT, padx=20)
        
        #Columns
        cols = tk.Frame(self.root, padx=20, pady=10)
        cols.pack(fill=tk.BOTH, expand=True)
        
        #Left: Required Items
        left = tk.LabelFrame(cols, text="REQUIRED", font=('Arial', 12, 'bold'))
        left.pack(side=tk.LEFT, fill=tk.BOTH, expand=True, padx=5)
        
        self.tree_req = ttk.Treeview(left, columns=('Item','Qty'), show='headings', height=10)
        self.tree_req.heading('Item', text='Product'); self.tree_req.column('Item', width=300)
        self.tree_req.heading('Qty', text='Qty'); self.tree_req.column('Qty', width=50)
        self.tree_req.pack(fill=tk.BOTH, expand=True)
        
        #Right: Scanned Items
        right = tk.LabelFrame(cols, text="SCANNED", font=('Arial', 12, 'bold'))
        right.pack(side=tk.RIGHT, fill=tk.BOTH, expand=True, padx=5)
        
        self.tree_scan = ttk.Treeview(right, columns=('Item','Status'), show='headings', height=10)
        self.tree_scan.heading('Item', text='Product'); self.tree_scan.column('Item', width=300)
        self.tree_scan.heading('Status', text='Status'); self.tree_scan.column('Status', width=100)
        self.tree_scan.pack(fill=tk.BOTH, expand=True)
        
        #Bottom Buttons
        btn_frame = tk.Frame(self.root, pady=20)
        btn_frame.pack(fill=tk.X)
        tk.Button(btn_frame, text="EXIT (Esc)", command=self.root.destroy, bg='#e74c3c', fg='white', font=('Arial', 12)).pack(side=tk.RIGHT, padx=20)

    def on_scan(self, event):
        code = self.barcode_entry.get().strip()
        self.barcode_entry.delete(0, tk.END)
        if not code: return
        
        if not self.current_order:
            self.process_waybill(code)
        else:
            self.process_item(code)

    def process_waybill(self, code):
        if not is_waybill(code):
            self.alert("INVALID WAYBILL", error=True)
            return
            
        order = get_waybill_order(code)
        #Check Stock
        ok, missing = check_stock_availability(order['items'])
        if not ok:
            messagebox.showerror("STOCK ERROR", "\n".join(missing))
            return
            
        self.current_order = order
        self.required_items = order['items']
        self.scanned_items = {k:0 for k in self.required_items}
        self.update_ui()
        self.status_label.config(text=f"ORDER: {order['customer_name']}", fg='blue')

    def process_item(self, code):
        product = lookup_barcode(code)
        if not product:
            self.alert("UNKNOWN BARCODE", error=True)
            return
            
        name = product['name']
        if name not in self.required_items:
            self.alert("WRONG ITEM!", error=True)
            return
            
        if self.scanned_items[name] >= self.required_items[name]:
            self.alert("ALREADY SCANNED", error=True)
            return
            
        self.scanned_items[name] += 1
        self.update_ui()
        self.status_label.config(text=f"✓ SCANNED: {name}", fg='green')
        
        #Check completion
        if all(self.scanned_items[k] >= self.required_items[k] for k in self.required_items):
            self.finish_order()

    def finish_order(self):
        deduct_stock(self.required_items)
        record_sale(self.current_order['order_id'], self.required_items)
        messagebox.showinfo("COMPLETE", "ORDER VERIFIED & INVENTORY UPDATED")
        self.reset()

    def update_ui(self):
        for t in (self.tree_req, self.tree_scan):
            for i in t.get_children(): t.delete(i)
            
        for item, qty in self.required_items.items():
            self.tree_req.insert('', tk.END, values=(item, qty))
            
        for item, qty in self.required_items.items():
            done = self.scanned_items[item]
            status = "✅ DONE" if done >= qty else f"⏳ {done}/{qty}"
            self.tree_scan.insert('', tk.END, values=(item, status))

    def alert(self, msg, error=False):
        self.status_label.config(text=msg, fg='red' if error else 'green')
        self.barcode_entry.focus_set()

    def reset(self):
        self.current_order = None
        self.update_ui()
        self.status_label.config(text="READY - SCAN WAYBILL", fg='green')
        self.barcode_entry.focus_set()

if __name__ == '__main__':
    root = tk.Tk()
    app = WarehouseGUI(root)
    root.mainloop()