// Portfolio Data and Visualization
// The charts can be driven by a generated JSON file at data/portfolio.json.
// If the JSON file is missing/unavailable, we fall back to the static defaults below.

document.addEventListener('DOMContentLoaded', function () {
    loadPortfolioData()
        .then(function (data) {
            initCategoryChart(data);
            initHoldingsChart(data);
            hydrateHoldingReturns(data);
        })
        .catch(function () {
            initCategoryChart(defaultPortfolioData);
            initHoldingsChart(defaultPortfolioData);
        })
        .finally(function () {
            initPerformanceChart();
        });
});

function loadPortfolioData() {
    // Cache-bust so deployed static hosts pick up new JSON after an update.
    return fetch('data/portfolio.json?v=' + Date.now(), { cache: 'no-store' })
        .then(function (res) {
            if (!res.ok) throw new Error('Failed to load portfolio.json');
            return res.json();
        })
        .then(function (payload) {
            // Normalize shape so the rest of the file can use .categories / .holdings.
            return {
                categories: payload.categories || {},
                holdings: payload.holdings || {},
                positions: payload.positions || []
            };
        });
}

// Default portfolio allocation data (fallback)
const defaultPortfolioData = {
    categories: {
        'US Stocks': 85.5,
        'Gold': 7.1,
        'Crypto': 7.4
    },
    holdings: {
        'GOOG': 43.8,
        'META': 22.4,
        'BRK.B': 15.6,
        'IVV': 9.0,
        'AMZN': 6.2,
        'MSFT': 2.8,
        'Others': 0.2 // CMG, KO, XOM, LDOS, CVS, PFE, VOO combined small positions
    },
    positions: []
};

// Color schemes
const colors = {
    categories: {
        'US Stocks': '#004A99',
        'Gold': '#FFD700',
        'Crypto': '#F7931A'
    },
    holdings: [
        '#004A99', '#0066CC', '#3399FF', '#66B2FF', '#99CCFF',
        '#FFD700', '#F7931A', '#627EEA', '#28A745', '#6C757D'
    ]
};

// Category Pie Chart
function initCategoryChart(portfolioData) {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;

    const data = portfolioData.categories;
    const labels = Object.keys(data);
    const values = Object.values(data);
    const backgroundColors = labels.map(l => colors.categories[l]);

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: backgroundColors,
                borderColor: '#ffffff',
                borderWidth: 3,
                hoverBorderWidth: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '60%',
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 14
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: { family: "'Inter', sans-serif", size: 14 },
                    bodyFont: { family: "'Inter', sans-serif", size: 13 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function (context) {
                            return ` ${context.label}: ${context.raw.toFixed(1)}%`;
                        }
                    }
                }
            }
        }
    });
}

// Holdings Pie Chart
function initHoldingsChart(portfolioData) {
    const ctx = document.getElementById('holdingsChart');
    if (!ctx) return;

    const data = portfolioData.holdings;
    const labels = Object.keys(data);
    const values = Object.values(data);

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: colors.holdings,
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '55%',
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        },
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: { family: "'Inter', sans-serif", size: 14 },
                    bodyFont: { family: "'Inter', sans-serif", size: 13 },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function (context) {
                            return ` ${context.label}: ${context.raw.toFixed(1)}%`;
                        }
                    }
                }
            }
        }
    });
}

function hydrateHoldingReturns(portfolioData) {
    if (!portfolioData || !Array.isArray(portfolioData.positions)) return;

    const bySymbol = {};
    portfolioData.positions.forEach(function (p) {
        if (p && p.symbol) bySymbol[String(p.symbol)] = p;
    });

    document.querySelectorAll('[data-holding-symbol]').forEach(function (el) {
        const sym = el.getAttribute('data-holding-symbol');
        const p = bySymbol[sym];
        if (!p || typeof p.totalReturnPct !== 'number') return;

        const pct = p.totalReturnPct;
        const sign = pct >= 0 ? '+' : '';
        el.textContent = sign + pct.toFixed(1) + '%';
        el.classList.toggle('positive', pct >= 0);
        el.classList.toggle('negative', pct < 0);
    });
}

// Historical Performance Data (Static - Monthly from Jan 2021)
// Normalized to 100 at start
const historicalData = {
    labels: [
        'Jan 21', 'Apr 21', 'Jul 21', 'Oct 21',
        'Jan 22', 'Apr 22', 'Jul 22', 'Oct 22',
        'Jan 23', 'Apr 23', 'Jul 23', 'Oct 23',
        'Jan 24', 'Apr 24', 'Jul 24', 'Oct 24',
        'Jan 25', 'Feb 25'
    ],
    // Simulated portfolio performance based on weighted returns
    portfolio: [
        100, 112, 118, 125,
        115, 95, 88, 92,
        105, 115, 125, 118,
        130, 138, 145, 155,
        148, 145
    ],
    // S&P 500 Benchmark (Approximate relative performance)
    sp500: [
        100, 110, 117, 120,
        115, 105, 98, 102,
        110, 115, 122, 118,
        135, 140, 148, 155,
        162, 165
    ]
};

// Performance Line Chart
function initPerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: historicalData.labels,
            datasets: [
                {
                    label: 'My Portfolio',
                    data: historicalData.portfolio,
                    borderColor: '#004A99',
                    backgroundColor: 'rgba(0, 74, 153, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: '#004A99'
                },
                {
                    label: 'S&P 500',
                    data: historicalData.sp500,
                    borderColor: '#6c757d',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        padding: 20,
                        font: {
                            family: "'Inter', sans-serif",
                            size: 13
                        },
                        usePointStyle: true,
                        pointStyle: 'line'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    titleFont: { family: "'Inter', sans-serif", size: 14 },
                    bodyFont: { family: "'Inter', sans-serif", size: 13 },
                    padding: 15,
                    cornerRadius: 8,
                    callbacks: {
                        label: function (context) {
                            const value = context.raw;
                            const change = value - 100;
                            const sign = change >= 0 ? '+' : '';
                            return ` ${context.dataset.label}: ${value}% (${sign}${change.toFixed(1)}%)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 11
                        }
                    }
                },
                y: {
                    beginAtZero: false,
                    min: 40,
                    max: 200,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        font: {
                            family: "'Inter', sans-serif",
                            size: 11
                        },
                        callback: function (value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}
