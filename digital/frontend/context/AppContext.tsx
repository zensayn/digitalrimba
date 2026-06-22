"use client";

import React, { createContext, useContext, useState, ReactNode, useMemo, useCallback } from "react";

interface AppState {
  product: string;
  qty: number;
  tier: string;
  total: number;
  design: string;
}

interface AppContextType {
  state: AppState;
  setProduct: (name: string) => void;
  setQty: (q: number) => void;
  setTier: (t: string) => void;
  setTotal: (t: number) => void;
  setDesign: (d: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    product: "Yield Aggregator",
    qty: 100,
    tier: "Elite",
    total: 0,
    design: "Institutional RIVR"
  });

  const setProduct = useCallback((product: string) => setState(prev => ({ ...prev, product })), []);
  const setQty = useCallback((qty: number) => setState(prev => ({ ...prev, qty })), []);
  const setTier = useCallback((tier: string) => setState(prev => ({ ...prev, tier })), []);
  const setTotal = useCallback((total: number) => setState(prev => ({ ...prev, total })), []);
  const setDesign = useCallback((design: string) => setState(prev => ({ ...prev, design })), []);

  const value = useMemo(() => ({
    state,
    setProduct,
    setQty,
    setTier,
    setTotal,
    setDesign
  }), [state, setProduct, setQty, setTier, setTotal, setDesign]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
