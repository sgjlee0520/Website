#!/usr/bin/env python3
import numpy as np
import matplotlib.pyplot as plt


KNOWN_VALUE = np.sqrt(np.pi)
LIMIT = 10.0  

def riemann_sum(N):
    dx = (2 * LIMIT) / N
    x_rect = np.linspace(-LIMIT, LIMIT - dx, N)
    y_rect = np.exp(-x_rect**2)
    return dx * np.sum(y_rect)

def monte_carlo_simulation(N):
    x_mc = np.random.uniform(-LIMIT, LIMIT, N)
    return (2 * LIMIT) * np.mean(np.exp(-x_mc**2))

def main():
    N_values = np.logspace(1, 6, 20, dtype=int)
    rect_errors = []
    mc_errors = []
    for N in N_values:
        #part a
        rect_val = riemann_sum(N)
        r_err = (rect_val - KNOWN_VALUE) / KNOWN_VALUE
        rect_errors.append(abs(r_err))

        #part b
        mc_val = monte_carlo_simulation(N)
        m_err = (mc_val - KNOWN_VALUE) / KNOWN_VALUE
        mc_errors.append(abs(m_err))

    #part a
    plt.loglog(N_values, rect_errors, 
               color='blue', linestyle='none', marker='o', 
               label='Rectangle Method (Left Sum)')
    
    plt.xlabel('Number of Rectangles (N)')
    plt.ylabel('Fractional Error (Absolute)')
    plt.title(r'Riemann Sum Error for $\int e^{-x^2} dx$')
    plt.legend()
    plt.savefig('p4_hw9_integration.eps')
    plt.close()

    #part b
    plt.loglog(N_values, mc_errors, 
               color='red', linestyle='none', marker='s', 
               label='Monte Carlo Simulation')

    plt.xlabel('Number of Random Points (N)')
    plt.ylabel('Fractional Error (Absolute)')
    plt.title(r'Monte Carlo Error for $\int e^{-x^2} dx$')
    plt.legend()
    plt.savefig('p4_hw9_monte_carlo.eps')
    plt.close()

if __name__ == "__main__":
    main()
