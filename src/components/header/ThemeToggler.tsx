import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import { useEditorsContext } from '../../context/editorContext';
import { Theme, currentTheme, saveTheme } from '../../utils/theme';

export default function ThemeToggler() {
  // index.html already applied the shared theme (cookie / localStorage / system) before render.
  const [theme, setTheme] = useState<Theme>(currentTheme);
  const { modelEditor, grammarEditor, setEditorsTheme } = useEditorsContext();

  useEffect(() => {
    if (modelEditor && grammarEditor) {
      setEditorsTheme(currentTheme() === 'dark' ? 'vs-dark' : 'vs');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setEditorsTheme is recreated every render
  }, [modelEditor, grammarEditor]);

  const toggleTheme = () => {
    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    saveTheme(newTheme);
    setEditorsTheme(newTheme === 'dark' ? 'vs-dark' : 'vs');
  }

  return (
    <button
      type="button"
      onClick={() => toggleTheme()}
      className="rounded-md p-1 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
    >
      <SunIcon className="w-5 h-5 inline dark:hidden" />
      <MoonIcon className="w-5 h-5 hidden dark:inline" />
    </button>
  );
}
