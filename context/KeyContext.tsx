"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useEffectEvent,
} from "react";

type DataContextType = {
  key: string;
  setKey: (key: string) => void;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [key, setKeyState] = useState("");
  const onMount = useEffectEvent(() => {
    const storedKey = sessionStorage.getItem("key");
    if (storedKey) {
      setKeyState(storedKey);
    }
  });

  // Load from sessionStorage on mount
  useEffect(() => {
    onMount();
  });

  // Custom setter that updates both state and sessionStorage
  const setKey = (newKey: string) => {
    setKeyState(newKey);
    sessionStorage.setItem("key", newKey);
  };

  return (
    <DataContext.Provider value={{ key, setKey }}>
      {children}
    </DataContext.Provider>
  );
}

export function useKey() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useKey must be used within a DataProvider");
  }
  return context;
}
