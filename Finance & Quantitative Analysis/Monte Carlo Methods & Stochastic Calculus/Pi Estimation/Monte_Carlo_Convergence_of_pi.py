#!/usr/bin/env python3
import numpy as np
import matplotlib.pyplot as plt

N_min=100
N_max=100000

N_values = np.geomspace(N_min, N_max, num=50, dtype=int) #I can also use np.logspace but found out that np.geomspace is better
fractional_errors = []

for N in N_values:
    points = np.random.uniform(0, 2, (N, 2))
    dist_sq = np.sum((points- 1)**2, axis=1)
    pi_est = 4 * np.mean(dist_sq <= 1)
    error = np.abs(pi_est-np.pi) /np.pi
    fractional_errors.append(error)

plt.figure(figsize=(8, 6))
plt.plot(N_values, fractional_errors, 'o-')
plt.xscale('log') 
plt.yscale('log')
plt.xlabel('Number of Points $N$')
plt.ylabel('Fractional Error in $\pi$')
plt.title('Monte Carlo Convergence of $\pi$')
plt.savefig('Monte_Carlo_Convergence_of_pi.eps', format='eps')
plt.show()
