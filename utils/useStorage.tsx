import { useEffect, useCallback, useState, SetStateAction } from "react";

export function useLocalStorage<T>(key: string, defaultValue: T) {
  return useStorage<T>(key, defaultValue, globalThis.localStorage);
}

function useStorage<T>(key: string, defaultValue: T, storageObject: Storage) {
  const [value, setValue] = useState<T | (() => T) | undefined>(() => {
    // 스토리지에 이미 있으면
    const jsonValue = storageObject.getItem(key);
    if (jsonValue != null) JSON.parse(jsonValue);
    // 스토리지에 없고 함수 리턴형이면
    if (typeof defaultValue === "function") defaultValue();
    else return defaultValue;
  });

  useEffect(() => {
    if (value === undefined) storageObject.removeItem(key);
    storageObject.setItem(key, JSON.stringify(value));
  }, [key, value, storageObject]);

  const remove = useCallback(() => {
    setValue(undefined);
  }, []);

  return [value, setValue, remove] as const;
}
