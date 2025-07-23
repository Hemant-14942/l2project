import { useEffect, useState } from 'react';

export function useTheme() {
  const [theme,setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  useEffect(()=>{
    document.documentElement.classList.remove('light','dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme',theme);
  },[theme]);
  const toggle = () => setTheme(t => t==='dark'?'light':'dark');
  return { theme, toggle };
}