import {
  ChangeEventHandler,
  ComponentProps,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQueries } from "react-query";
import Modal, { type Token } from "./Modal";
import "./Styles.css";

function getTokenData(firstTokenId: string, secondTokenId: string) {
  return useQueries([
    {
      queryKey: ["firstToken", firstTokenId],
      queryFn: async () =>
        await await fetch(
          `https://api.coingecko.com/api/v3/simple/price?vs_currencies=USD&ids=${firstTokenId}`,
        ).then((res) => res.json()),
    },
    {
      queryKey: ["secondToken", secondTokenId],
      queryFn: async () =>
        await await fetch(
          `https://api.coingecko.com/api/v3/simple/price?vs_currencies=USD&ids=${secondTokenId}`,
        ).then((res) => res.json()),
    },
  ]);
}

const initialTokenData: Token[] = [
  { id: "dai", name: "dai", symbol: "dai" },
  { id: "usd-coin", name: "usdc", symbol: "usdc" },
];

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [firstInputValue, setFirstInputValue] = useState("");
  const [secondInputValue, setSecondInputValue] = useState("");
  const previousInputsRef = useRef({ input1: "", input2: "" });
  const [selectedToken, setSelectedToken] = useState<Token[]>(initialTokenData);
  const [modalIndex, setModalIndex] = useState<0 | 1>(0);
  const data = getTokenData(selectedToken[0].id, selectedToken[1].id);
  const modalOpen = () => setIsOpen(true);

  const firstUsd = useMemo((): number | undefined => {
    if (data[0].isSuccess) return data[0]?.data[selectedToken[0].id].usd;
    return undefined;
  }, [data, selectedToken]);
  const secondUsd = useMemo((): number | undefined => {
    if (data[1].isSuccess) return data[1]?.data[selectedToken[1].id].usd;
    return undefined;
  }, [data, selectedToken]);

  useEffect(() => {
    if (firstUsd && secondUsd)
      setSecondInputValue(() => {
        const result = String(
          +((firstUsd / secondUsd) * Number(firstInputValue)).toFixed(10),
        );
        if (result === "0") return "";
        return result;
      });
  }, [firstUsd, secondUsd, firstInputValue]);

  const inputChangeHandler1: ChangeEventHandler<HTMLInputElement> = (e) => {
    let regexp = /^\d*.?\d{0,10}$/;
    if (!regexp.test(e.target.value)) {
      alert("소수점 열째자리까지만 입력해주세요");
      return;
    } else {
      const newValue = e.target.value;
      const prevValue = previousInputsRef.current.input1;
      previousInputsRef.current.input1 = newValue;
      if (newValue !== prevValue && secondUsd && firstUsd) {
        setFirstInputValue(newValue);
        setSecondInputValue(() => {
          const result = String(
            +((firstUsd / secondUsd) * Number(newValue)).toFixed(10),
          );
          if (result === "0") return "";
          return result;
        });
      }
    }
  };
  const inputChangeHandler2: ChangeEventHandler<HTMLInputElement> = (e) => {
    let regexp = /^\d*.?\d{0,10}$/;
    if (!regexp.test(e.target.value)) {
      alert("소수점 열째자리까지만 입력해주세요");
      return;
    } else {
      const newValue = e.target.value;
      const prevValue = previousInputsRef.current.input2;
      previousInputsRef.current.input2 = newValue;
      if (newValue !== prevValue && secondUsd && firstUsd) {
        setSecondInputValue(newValue);
        setFirstInputValue(() => {
          const result = String(
            +((secondUsd / firstUsd) * Number(newValue)).toFixed(10),
          );
          if (result === "0") return "";
          return result;
        });
      }
    }
  };

  return (
    <div className="bg-black w-full h-screen pt-20">
      <Modal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        selectedToken={selectedToken}
        setSelectedToken={setSelectedToken}
        modalIndex={modalIndex}
      />
      <div className="flex justify-center">
        <div className="max-w-md w-full bg-black rounded-3xl p-2">
          <Title />
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col pt-5 px-3 w-full h-32 rounded-2xl bg-slate-800 mb-1 border border-transparent focus-within:border-slate-500 hover:border-slate-600">
              <div className="flex justify-end">
                <Input value={firstInputValue} onChange={inputChangeHandler1} />
                <SelectButton
                  onClick={() => {
                    setModalIndex(0);
                    modalOpen();
                  }}
                  selectedToken={selectedToken[0]}
                />
              </div>
              <Calculator
                usd={firstUsd}
                inputValue={firstInputValue}
                selectedToken={selectedToken[0]}
              />
            </div>

            <CenterZone />

            <div className="flex flex-col pt-5 px-3 w-full h-32 rounded-2xl bg-slate-800 mb-1 border border-transparent focus-within:border-slate-500 hover:border-slate-600">
              <div className="flex justify-end">
                <Input
                  value={secondInputValue}
                  onChange={inputChangeHandler2}
                />
                <SelectButton
                  onClick={() => {
                    setModalIndex(1);
                    modalOpen();
                  }}
                  selectedToken={selectedToken[1]}
                />
              </div>
              <Calculator
                usd={secondUsd}
                inputValue={secondInputValue}
                selectedToken={selectedToken[1]}
              />
            </div>
          </div>

          <span className="text-white">{`1 ${selectedToken[1].symbol.toUpperCase()} = ${
            secondUsd && firstUsd && +(secondUsd / firstUsd).toFixed(5)
          } ${selectedToken[0].symbol.toUpperCase()}`}</span>

          <SubmitButton
            firstInputValue={firstInputValue}
            secondInputValue={secondInputValue}
          />
        </div>
      </div>
    </div>
  );
}

// 컴퍼넌트
function Title() {
  return (
    <div className="flex justify-between text-white px-3 py-2">
      <div className="cursor-default">Swap</div>
      <div className="cursor-pointer" onClick={() => alert("준비중입니다")}>
        Setting
      </div>
    </div>
  );
}

interface SelectProps extends ComponentProps<"div"> {
  selectedToken: Token;
}
function SelectButton({ selectedToken, ...props }: SelectProps) {
  const { id, name, symbol } = selectedToken;
  return (
    <div
      {...props}
      className="absolute hover:cursor-pointer flex justify-between items-center px-2 rounded-full w-24 h-10 bg-white mb-7"
    >
      <div className="w-6 h-6 bg-red-300 rounded-full"></div>
      <div>{symbol.toUpperCase()}</div>
    </div>
  );
}

function CenterZone() {
  return (
    <div className="flex justify-center items-center w-10 h-10 absolute bg-black rounded-2xl">
      <button className="w-8 h-8 bg-slate-800 rounded-xl flex justify-center items-center">
        👇🏼
      </button>
    </div>
  );
}

type CalculatorProps = {
  usd?: number;
  inputValue: string;
  selectedToken: Token;
};
function Calculator({ usd, inputValue, selectedToken }: CalculatorProps) {
  const getRelativeValue = () => {
    if (usd && inputValue && selectedToken) {
      return `$ ${+(usd * Number(inputValue)).toFixed(10)}`;
    }
  };
  return <div className="flex text-white">{getRelativeValue()}</div>;
}

interface InputProps extends ComponentProps<"input"> {
  value: string;
}
function Input({ value, ...props }: InputProps) {
  return (
    <input
      value={value}
      type="number"
      placeholder="0"
      className="h-full bg-transparent rounded-2xl w-full px-3 pb-7 outline-none text-white text-3xl"
      {...props}
    />
  );
}

type ButtonProps = {
  firstInputValue: string;
  secondInputValue: string;
};
function SubmitButton({ firstInputValue, secondInputValue }: ButtonProps) {
  return (
    <button
      disabled={!firstInputValue || !secondInputValue}
      onClick={() => alert("준비중입니다")}
      className="w-full h-20 mt-2 bg-slate-800 text-white rounded-2xl disabled:cursor-not-allowed"
    >
      금액을 입력하세요
    </button>
  );
}
