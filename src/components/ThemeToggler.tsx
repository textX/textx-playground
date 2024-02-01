import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

export default function ThemeToggler() {
  const [theme, setTheme] = useState<'light' | 'dark'>();

  useEffect(() => {
    const currentTheme = localStorage.theme ?? 'light';
    setTheme(currentTheme);
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    const { documentElement } = document;
    if (newTheme === 'dark') {
      documentElement.classList.add('dark')
    } else {
      documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', newTheme);
  }

  if (!theme) {
    return null;
  }

  return (
    <div onClick={() => toggleTheme()} className="cursor-pointer hover:opacity-80">
      <SunIcon className="w-6 h-6 text-yellow-500 inline dark:hidden" />
      <MoonIcon className="w-6 h-6 text-blue-500 hidden dark:inline" />
    </div>
  );
}
