#!/usr/bin/env python3
#First eps file is 256 iterations, gridsize 60, plate thickness 0.05,plate
#width 0.2, gap between plates being 2*plate thickness which is 0.1, and voltage
#equal to 1.
#The second file is 100000 iterations (as I wanted to see if the converging num
#ber changes).
#The last file is the "dipole", as I changed the gap between plates being 10*plate thickness.


import numpy as np
import matplotlib.pyplot as plt
import time

ITER = 256
#ITER=100000
GRIDSIZE = 60
PTH = 0.05
PWID = 0.2
GAP = 2.0 * PTH
#GAP = 10.0 * PTH
VOLTAGE = 1.0

def load_boundary(darray, gridsize):
    """Place predetermined potential at boundary points."""
    clx = int(0.5 * gridsize * (1.0 - PWID))
    cux = gridsize - clx
    capth = (2.0 * PTH + GAP) * gridsize
    cly1 = int(0.5 * (gridsize - capth))
    cuy1 = int(cly1 + gridsize * PTH)
    cly2 = int(cly1 + gridsize * (GAP + PTH))
    cuy2 = gridsize - cly1
    darray[clx:cux, cly1:cuy1] = -VOLTAGE
    darray[clx:cux, cly2:cuy2] = VOLTAGE
    darray[0, :] = 0.0        
    darray[gridsize-1, :] = 0.0 
    darray[:, 0] = 0.0  
    darray[:, gridsize-1] = 0.0

olddata = np.zeros((GRIDSIZE, GRIDSIZE))
newdata = np.zeros((GRIDSIZE, GRIDSIZE))
load_boundary(olddata, GRIDSIZE)

print(f"Starting simulation with {ITER} iterations on grid {GRIDSIZE}x{GRIDSIZE}...")

t0 = time.perf_counter()

for i in range(ITER):
    newdata = 0.25 * (np.roll(olddata, 1, axis=0) + 
                      np.roll(olddata, -1, axis=0) + 
                      np.roll(olddata, 1, axis=1) + 
                      np.roll(olddata, -1, axis=1))
    load_boundary(newdata, GRIDSIZE)
    diff = np.abs(newdata - olddata).sum()
    print('iteration: %d difference sum: %.16f' % (i, diff))
    olddata = np.copy(newdata)

elapsed = time.perf_counter() - t0
print()
print('Time elapsed: %.6f s' % elapsed)

# Plotting
plotarr = np.flipud(olddata.transpose(1, 0))
fig, ax = plt.subplots(dpi=180)
im = ax.imshow(plotarr, interpolation='none', cmap='jet')
plt.colorbar(im, label='Potential (V)')
plt.title("Capacitor Potential Relaxation")
output_filename='capacitor_config_1.eps'
plt.savefig(output_filename,format='eps')
plt.show()

input("\nPress <Enter> to exit . . . \n")
