import { useState, useEffect } from 'react';

function getStorageValue(key: string) {
  // getting stored value
  const saved = localStorage.getItem(key);
  const initial = JSON.parse(saved || 'null');
  return initial;
}

export const useLocalStorage = <T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [value, setValue] = useState<T>(() => {
    const storage = getStorageValue(key);
    if (!storage) return defaultValue;
    return storage;
  });

  useEffect(() => {
    // storing input name
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};
