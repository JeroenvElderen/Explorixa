import { useState, useEffect } from 'react';

export default function useExchangeRates(fromCurrency, toCurrency) {
  const [rate, setRate] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchRate() {
      const from = (fromCurrency || 'USD').trim().toUpperCase();
      const to = (toCurrency || 'USD').trim().toUpperCase();
      if (from === to) {
        setRate(1);
        return;
      }
      if (!/^[A-Z]{3}$/.test(from) || !/^[A-Z]{3}$/.test(to)) {
        console.warn('Invalid currency codes', from, to);
        setRate(1);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`https://api.frankfurter.app/latest?amount=1&from=${from}&to=${to}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const fetchedRate = data.rates?.[to];
        setRate(typeof fetchedRate === 'number' ? fetchedRate : 1);
      } catch (err) {
        console.error('Exchange API error', err);
        setRate(1);
      } finally {
        setLoading(false);
      }
    }
    fetchRate();
  }, [fromCurrency, toCurrency]);

  return { rate, loading };
}