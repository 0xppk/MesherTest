import { ChangeEventHandler, useCallback, useState } from "react";

export default function useInput() {
  const [inputValue, setInputValue] = useState("");

  const changeHandler: ChangeEventHandler<HTMLInputElement> = (e) =>
    setInputValue(e.target.value);

  const reset = () => setInputValue("");

  return [inputValue, changeHandler, reset] as const;
}
