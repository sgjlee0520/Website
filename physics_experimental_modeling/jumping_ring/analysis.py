import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from scipy.optimize import curve_fit

# ---------- Raw height data (cm) ----------
h_raw = {
    -52.3 : np.array([96.4, 103.1, 98.1, 96.9, 101.8]),
     22.4 : np.array([84.5, 88.5, 89.0, 84.7, 86.11]),
    148.0 : np.array([55.2, 55.4, 55.4, 55.4, 55.4]),
   -196.0 : np.array([116.2, 120.2, 117.8, 114.1, 115.2])   # LN2 data
}

h_offset = 17.9      # starting height of the ring above floor (cm)
# subtract the offset to obtain *net* rise of the ring
for T in h_raw:
    h_raw[T] = h_raw[T] - h_offset

# ---------- Collate means and uncertainties ----------
T_main  = np.array([-52.3, 22.4, 148.0])    # exact set-points
T_extra = np.array([-196.0])                # LN2 group

# Helper to compute mean & st.dev of each group
def mean_and_unc(dict_, keys):
    means  = np.array([ h_raw[k].mean() for k in keys ])
    stdevs = np.array([ h_raw[k].std(ddof=1) for k in keys ])   # 1-sigma (sample)
    return means, stdevs

H_main,  dH_main  = mean_and_unc(h_raw, T_main)
H_extra, dH_extra = mean_and_unc(h_raw, T_extra)

# ---------- Assign *ad-hoc* x-uncertainties ----------
dT_main  = np.full_like(T_main, 1.0)     # +/-1 C on controlled temperatures
dT_extra = np.full_like(T_extra, 2.0)    # +/-2 C on LN2 estimate

# ---------- Linear fit through the *controlled* data ----------
def linear(T, m, b):          # H = m T + b
    return m*T + b

(popt, pcov) = curve_fit(linear, T_main, H_main, sigma=dH_main, absolute_sigma=True)
m_fit, b_fit = popt
m_err, b_err = np.sqrt(np.diag(pcov))

print(f"Slope     m = {m_fit:.3f} +/- {m_err:.3f}  cm / C")
print(f"Intercept b = {b_fit:.2f} +/- {b_err:.2f} cm")

# ---------- Plot ----------
fig, ax = plt.subplots(figsize=(7,5))

# controlled points & fit
ax.errorbar(T_main, H_main, yerr=dH_main, xerr=dT_main,
            fmt='o', color='tab:blue', capsize=4, label='Controlled temps')
T_fit = np.linspace(T_main.min()-20, T_main.max()+20, 200)
ax.plot(T_fit, linear(T_fit, *popt), color='tab:blue', lw=1.8,
        label=f'Linear fit  $H = ({m_fit:.3f}\\,\\pm\\,{m_err:.3f})T + ({b_fit:.2f}\\,\\pm\\,{b_err:.2f})$')

# LN2 overlay
ax.errorbar(T_extra, H_extra, yerr=dH_extra, xerr=dT_extra,
            fmt='s', mfc='none', mec='tab:orange', capsize=4, ms=6,
            label='LN$_2$ point ($-196\\,^{\\circ}$C)')

# >>> dotted extrapolation into the deep-cold regime <<<
T_extrap = np.linspace(-200, -75, 150)
ax.plot(T_extrap, linear(T_extrap, *popt),
        linestyle=':', linewidth=1.6, color='tab:gray',
        label='Fit extrapolated ($-200\\,^{\\circ}$C to $-75\\,^{\\circ}$C)')

ax.set_xlabel('Ring temperature $T$ ($^{\\circ}$C)')
ax.set_ylabel('Net jump height $H$ (cm)')
ax.set_title('Jump height vs. ring temperature')
ax.grid(alpha=0.3)
ax.legend()
plt.tight_layout()
plt.savefig("fit.pdf")
plt.savefig("../../images/jumping-ring-plot.png", dpi=120)   # the plot shown on the site

# ---------- Numbers quoted in the text ----------
T_all = np.array([-196.0, -52.3, 22.4, 148.0])
for T in T_all:
    print(f"T = {T:7.1f} C   mean H = {h_raw[T].mean():6.2f} cm   s = {h_raw[T].std(ddof=1):.2f} cm")
chi2 = (((H_main - linear(T_main, *popt)) / dH_main)**2).sum()
print(f"chi2 = {chi2:.2f} for 1 degree of freedom")
print(f"Line at -196 C: {linear(-196.0, *popt):.1f} cm; measured {H_extra[0]:.1f} cm")
# check: adding the 0.13 cm reading uncertainty in quadrature does not move the fit
p2, c2 = curve_fit(linear, T_main, H_main, sigma=np.hypot(dH_main, 0.13), absolute_sigma=True)
assert abs(p2[0] - m_fit) < 5e-4 and abs(np.sqrt(c2[0, 0]) - m_err) < 5e-4
# check: with standard-error weights the slope is the same but the fit is poor
se = np.hypot(dH_main / np.sqrt(5), 0.13)
p3, c3 = curve_fit(linear, T_main, H_main, sigma=se, absolute_sigma=True)
chi2_se = (((H_main - linear(T_main, *p3)) / se)**2).sum()
print(f"Standard-error weights: m = {p3[0]:.3f} +/- {np.sqrt(c3[0, 0]):.3f}, chi2 = {chi2_se:.1f}")
