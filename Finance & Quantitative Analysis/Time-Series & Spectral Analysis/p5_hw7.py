#!/usr/bin/env python3
#
# Using FFT method

import numpy as np
import matplotlib.pyplot as plt

#part (a)
FS = 920
input_filename = 'solarcell_data.txt'
print('Reading data from %s...' % input_filename)
data = np.loadtxt(input_filename)
print('Successfully read %d data points.' % len(data))
print()

#part (b)
npts = len(data)
data = data-np.mean(data) #removing DC components (average voltage)
ft = np.fft.fft(data, n=16*npts)
ftnorm = np.abs(ft)
ps = ftnorm**2
freqs = np.fft.fftfreq(len(ps), 1.0/FS)
time = np.arange(npts) /FS 
f1, ax1 = plt.subplots()
ax1.plot(time, data)
ax1.set_xlabel('Time (s)')
ax1.set_ylabel('Voltage (V)')
ax1.set_title('Solar Cell Voltage vs Time')
f1.show()

f2, ax2 = plt.subplots()
ax2.plot(freqs, ps)
ax2.set_xlim(0, 200)
ax2.set_xlabel('Frequency (Hz)')
ax2.set_ylabel('Power')
ax2.set_title('Power Spectrum of Solar Cell Signal')
f2.show()

# part (c)
eps_filename = 'power_spectrum_fft.eps'
print('Saving power spectrum to %s...' % eps_filename)
f2.savefig(eps_filename, format='eps')
print('Plot saved successfully.')
print()

real_freq = freqs > 0.5  # Exclude DC and very low frequencies
real_freqs = freqs[real_freq]
real_ps = ps[real_freq]

# Find the peak
max_idx = np.argmax(real_ps)
fundamental_freq = real_freqs[max_idx]
max_power = real_ps[max_idx]

print('Fundamental frequency: %.2f Hz' % fundamental_freq)
print('Power at fundamental frequency: %.2e' % max_power)
print()

input("Press <Enter> to exit...\n")



