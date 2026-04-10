from __future__ import annotations

import json
import math
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

import pandas as pd
import yfinance as yf
from pycoingecko import CoinGeckoAPI


ROOT = Path(__file__).resolve().parents[1]
OUT_PATH = ROOT / "data" / "portfolio.json"


@dataclass(frozen=True)
class Holding:
    symbol: str
    shares: float
    avg_price_usd: float
    kind: str  # "stock" | "crypto" | "gold"
    # Optional metadata
    coingecko_id: Optional[str] = None
    yfinance_symbol: Optional[str] = None


HOLDINGS: List[Holding] = [
    # US stocks / ETFs
    Holding(symbol="GOOG", shares=20, avg_price_usd=200.51, kind="stock", yfinance_symbol="GOOG"),
    Holding(symbol="AMZN", shares=4, avg_price_usd=224.90, kind="stock", yfinance_symbol="AMZN"),
    Holding(symbol="BRK.B", shares=6, avg_price_usd=400.23, kind="stock", yfinance_symbol="BRK-B"),
    Holding(symbol="META", shares=5, avg_price_usd=687.92, kind="stock", yfinance_symbol="META"),
    Holding(symbol="CVS", shares=3, avg_price_usd=81.03, kind="stock", yfinance_symbol="CVS"),
    Holding(symbol="IVV", shares=2, avg_price_usd=523.17, kind="stock", yfinance_symbol="IVV"),
    Holding(symbol="CMG", shares=1, avg_price_usd=61.33, kind="stock", yfinance_symbol="CMG"),
    Holding(symbol="KO", shares=1, avg_price_usd=63.39, kind="stock", yfinance_symbol="KO"),
    Holding(symbol="XOM", shares=1, avg_price_usd=118.60, kind="stock", yfinance_symbol="XOM"),
    Holding(symbol="LDOS", shares=1, avg_price_usd=168.80, kind="stock", yfinance_symbol="LDOS"),
    Holding(symbol="MSFT", shares=1, avg_price_usd=454.17, kind="stock", yfinance_symbol="MSFT"),
    Holding(symbol="PFE", shares=7, avg_price_usd=27.62, kind="stock", yfinance_symbol="PFE"),
    Holding(symbol="VOO", shares=0.13, avg_price_usd=528.01, kind="stock", yfinance_symbol="VOO"),
    # Gold (kept manual unless you map to a specific ticker you hold)
    Holding(symbol="TIGER KRX", shares=107, avg_price_usd=9.33, kind="gold"),
    # Crypto
    Holding(symbol="BTC", shares=0.00168, avg_price_usd=102000, kind="crypto", coingecko_id="bitcoin"),
    Holding(symbol="ETH", shares=0.336, avg_price_usd=3365, kind="crypto", coingecko_id="ethereum"),
]


def _safe_float(x: Any) -> Optional[float]:
    try:
        if x is None:
            return None
        v = float(x)
        if math.isnan(v) or math.isinf(v):
            return None
        return v
    except Exception:
        return None


def fetch_stock_prices_usd(holdings: List[Holding]) -> Dict[str, float]:
    symbols = sorted({h.yfinance_symbol for h in holdings if h.kind == "stock" and h.yfinance_symbol})
    if not symbols:
        return {}

    # yfinance is happiest with space-delimited tickers
    tickers = yf.Tickers(" ".join(symbols))
    prices: Dict[str, float] = {}
    for sym in symbols:
        try:
            info = tickers.tickers[sym].fast_info
            px = _safe_float(getattr(info, "last_price", None))
            if px is None:
                # fallback
                hist = tickers.tickers[sym].history(period="5d", interval="1d")
                if not hist.empty:
                    px = _safe_float(hist["Close"].dropna().iloc[-1])
            if px is not None:
                prices[sym] = px
        except Exception:
            continue
    return prices


def fetch_crypto_prices_usd(holdings: List[Holding]) -> Dict[str, float]:
    ids = sorted({h.coingecko_id for h in holdings if h.kind == "crypto" and h.coingecko_id})
    if not ids:
        return {}
    cg = CoinGeckoAPI()
    data = cg.get_price(ids=ids, vs_currencies="usd")
    prices: Dict[str, float] = {}
    for h in holdings:
        if h.kind != "crypto" or not h.coingecko_id:
            continue
        px = _safe_float(data.get(h.coingecko_id, {}).get("usd"))
        if px is not None:
            prices[h.symbol] = px
    return prices


def compute(holdings: List[Holding]) -> Dict[str, Any]:
    stock_prices = fetch_stock_prices_usd(holdings)
    crypto_prices = fetch_crypto_prices_usd(holdings)

    rows: List[Dict[str, Any]] = []
    for h in holdings:
        current_price: Optional[float] = None
        if h.kind == "stock" and h.yfinance_symbol:
            current_price = stock_prices.get(h.yfinance_symbol)
        elif h.kind == "crypto":
            current_price = crypto_prices.get(h.symbol)
        elif h.kind == "gold":
            current_price = None  # manual / unknown

        market_value = None if current_price is None else current_price * h.shares
        cost_basis = h.avg_price_usd * h.shares
        total_return_pct = None
        if current_price is not None and h.avg_price_usd:
            total_return_pct = (current_price / h.avg_price_usd - 1.0) * 100.0

        rows.append(
            {
                "symbol": h.symbol,
                "kind": h.kind,
                "shares": h.shares,
                "avgPriceUsd": h.avg_price_usd,
                "currentPriceUsd": current_price,
                "marketValueUsd": market_value,
                "costBasisUsd": cost_basis,
                "totalReturnPct": total_return_pct,
            }
        )

    df = pd.DataFrame(rows)
    known_mv = df["marketValueUsd"].dropna()
    total_known_mv = float(known_mv.sum()) if not known_mv.empty else 0.0
    df["weightPct"] = df["marketValueUsd"].apply(lambda v: None if v is None or total_known_mv <= 0 else float(v) / total_known_mv * 100.0)

    # Category weights (based only on assets with known market values)
    kind_to_category = {"stock": "US Stocks", "gold": "Gold", "crypto": "Crypto"}
    cat_weights: Dict[str, float] = {}
    for _, r in df.dropna(subset=["marketValueUsd"]).iterrows():
        cat = kind_to_category.get(r["kind"], "Other")
        cat_weights[cat] = cat_weights.get(cat, 0.0) + float(r["marketValueUsd"])
    if total_known_mv > 0:
        cat_weights = {k: v / total_known_mv * 100.0 for k, v in cat_weights.items()}

    # Holdings pie — group tiny positions into "Others"
    # (based on known market values only)
    holding_weights: Dict[str, float] = {}
    for _, r in df.dropna(subset=["weightPct"]).iterrows():
        holding_weights[str(r["symbol"])] = float(r["weightPct"])

    major: Dict[str, float] = {}
    others_sum = 0.0
    for sym, w in sorted(holding_weights.items(), key=lambda kv: kv[1], reverse=True):
        if w >= 1.0:
            major[sym] = w
        else:
            others_sum += w
    if others_sum > 0.0:
        major["Others"] = others_sum

    # Convert NaN/NaT to JSON-safe nulls (and avoid non-standard JSON NaN tokens)
    df_json = df.copy().astype(object)
    df_json = df_json.where(pd.notnull(df_json), None)

    return {
        "asOf": datetime.now(timezone.utc).isoformat(),
        "currency": "USD",
        "totals": {
            "knownMarketValueUsd": total_known_mv,
        },
        "categories": cat_weights,
        "holdings": major,
        "positions": df_json.to_dict(orient="records"),
        "notes": {
            "goldPricing": "Gold position is not priced automatically yet; currentPriceUsd may be null.",
        },
    }


def main() -> None:
    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    payload = compute(HOLDINGS)
    OUT_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {OUT_PATH.relative_to(ROOT)} (asOf={payload['asOf']})")


if __name__ == "__main__":
    main()
