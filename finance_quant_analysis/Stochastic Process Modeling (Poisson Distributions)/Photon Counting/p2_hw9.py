#!/usr/bin/env python3
import numpy as np
import matplotlib.pyplot as plt
from scipy.stats import poisson

# Part a
def simulate_photon_count():
    return np.random.binomial(1000, 0.002)

# Part b
counts = [simulate_photon_count() for _ in range(1000)]

# Part c
mu = 1000 * 0.002  
x = np.arange(0, np.max(counts) + 3)
y_poisson = 1000 * poisson.pmf(x, mu)

plt.figure()
plt.hist(counts, bins=np.arange(x.max() + 1) - 0.5, rwidth=0.8, label='Simulation')
plt.plot(x, y_poisson, color='red', marker='o', label=f'Poisson ($\mu={mu}$)')
plt.title('Photon Counting Simulation (1000 Trials)')
plt.xlabel('Number of Photons Detected')
plt.ylabel('Frequency')
plt.legend()
plt.savefig('p2_hw9.eps')
