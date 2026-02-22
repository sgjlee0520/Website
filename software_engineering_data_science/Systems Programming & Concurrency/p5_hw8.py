#!/usr/bin/env python3
# using logic from thread_example

import numpy as np
from matplotlib.lines import Line2D
import matplotlib.pyplot as plt
import matplotlib.animation as animation
import time
import threading
import sys

current_val = 0.0

def get_input():
    """Continuously prompts user for input to update global variable."""
    global current_val
    print("Plot running. Enter numbers to update. The range of y-values visible in this graph is from -10 to 10 so keep that in mind.")
    while True:
        try:
            current_val = float(input("New value: "))
        except ValueError:
            print("Input must be a number.", file=sys.stderr)

class Scope():
    def __init__(self, ax, maxt=10, dt=0.02):
        self.ax = ax
        self.dt = dt
        self.maxt = maxt
        self.tdata = np.array([])
        self.ydata = np.array([])
        self.t0 = time.perf_counter()
        self.line = Line2D(self.tdata, self.ydata)
        self.ax.add_line(self.line)
        self.ax.set_ylim(-10, 10) 
        self.ax.set_xlim(0, self.maxt)

    def update(self, data):
        t, y = data
        self.tdata = np.append(self.tdata, t)
        self.ydata = np.append(self.ydata, y)
        self.ydata = self.ydata[self.tdata > (t - self.maxt)]
        self.tdata = self.tdata[self.tdata > (t - self.maxt)]
        self.line.set_data(self.tdata, self.ydata)
        if len(self.tdata) > 0:
            self.ax.set_xlim(self.tdata[0], self.tdata[0] + self.maxt) 
        self.ax.figure.canvas.draw()
        return self.line,

    def emitter(self):
        while True:
            t = time.perf_counter() - self.t0
            yield t, current_val

if __name__ == '__main__':
    input_thr = threading.Thread(target=get_input)
    input_thr.daemon = True 
    input_thr.start()
    dt = 0.01
    fig, ax = plt.subplots()
    scope = Scope(ax, maxt=10, dt=dt)
    ani = animation.FuncAnimation(fig, scope.update, scope.emitter, interval=dt*1000., blit=True)
    plt.show()

