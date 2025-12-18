#!/usr/bin/env python3

import numpy as np
import matplotlib.pyplot as plt
from PIL import Image

X, Y = 512, 409
lw = 20
base_x1, base_y1 = 0, 0
base_x2, base_y2 = 400, 0
top_x, top_y = 400, 300
slope = 3 / 4
color = (0, 0, 255)        
bg_color = (255, 255, 255) 
offset = 48
half_lw = lw//2
total_offset = offset+half_lw
save_name = "p4_hw5_rt345_raster.tif"

hyp_thickness = int(lw/0.8) #cos of angle is 0.8)

#Setting white canvas
pvals = np.full((X, Y, 3), bg_color, dtype='uint8')

# Draw
for x in range(X):
    for y in range(Y):
        rel_x = x-total_offset
        rel_y = y-total_offset
        y_hyp = slope * rel_x
        if (0 <= rel_y <= lw) or (y_hyp - hyp_thickness <= rel_y <= y_hyp) or (top_x - lw <= rel_x <= top_x):
            if rel_y <= slope * rel_x and rel_x <= top_x and rel_y >= 0:
                pvals[x, y, :] = color

plotarr = np.flipud(pvals.transpose(1, 0, 2))
f1, ax1 = plt.subplots()
ax1.imshow(plotarr, interpolation='none')
ax1.axis('off')
plt.show()

# Save image
im = Image.fromarray(plotarr, 'RGB')
im.save(save_name)
print(f'Image saved to {save_name}')
input("\nPress Enter to exit...\n")

