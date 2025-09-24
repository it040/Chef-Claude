import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const PromptContext = createContext(null);
const STORAGE_KEY = 'chefclaude_prompts';

export const PromptProvider = ({ children }) => {
  const [prompts, setPrompts] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
    } catch {}
  }, [prompts]);

  const addPrompt = (text) => {
    if (!text?.trim()) return null;
    const id = (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : String(Date.now());
    const item = { id, text, createdAt: Date.now() };
    setPrompts((prev) => [item, ...prev].slice(0, 100));
    return item;
  };

  const updatePrompt = (id, updates) => {
    setPrompts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const deletePrompt = (id) => {
    setPrompts((prev) => prev.filter((p) => p.id !== id));
  };

  const clearPrompts = () => setPrompts([]);

  const value = useMemo(() => ({ prompts, addPrompt, updatePrompt, deletePrompt, clearPrompts }), [prompts]);

  return <PromptContext.Provider value={value}>{children}</PromptContext.Provider>;
};

export const usePrompts = () => {
  const ctx = useContext(PromptContext);
  if (!ctx) throw new Error('usePrompts must be used within a PromptProvider');
  return ctx;
};
