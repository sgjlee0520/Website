#!/usr/bin/env python3
#before I begin, I want to say that first I will plot the mandelbrot via pyplot and then make a ps file with the exact scaling (image) of the part that I zoomed in the pyplot.

import numpy as np
import matplotlib.pyplot as plt

#function of mandelbrot

def mandelbrot(c, max_iter):
	z = 0
	for n in range(max_iter):
		if abs(z) > 2:
			return n
		z = z*z +c
	return max_iter

def mandelbrotset(xmin, xmax, ymin,ymax, width, height, max_iter):
	x = np.linspace(xmin,xmax, width)
	y = np.linspace(ymin, ymax, height)
	mset = np.zeros((height,width))
	
	for i in range(height):
		for j in range(width):
			c = complex(x[j],y[i])
			mset[i,j] = mandelbrot(c, max_iter)
	return mset

width, height = 512, 384
max_iter = 250
xmin, xmax, ymin, ymax = -0.74625,-0.73875,0.10125,0.11375

#Telling progress

print("Generating Mandelbrot: ")
print(f"Re axis: [{xmin},{xmax}] (range: {xmax - xmin})")
print(f"Im axis: [{ymin},{ymax}] (range: {ymax - ymin})")
print(f"Grid: {width}x{height}, Max iterations: {max_iter}\n")

#Generate and display
mandelbrot_image = mandelbrotset(xmin,xmax,ymin,ymax,width,height,max_iter)
plt.imshow(mandelbrot_image, extent=[xmin,xmax,ymin,ymax], cmap = 'hot')
plt.colorbar()
plt.title('mandelbrot visualization')
plt.xlabel('Re(c)')
plt.ylabel('Im(c)')
plt.savefig("p5_hw5.ps")
plt.show()



