import { Dispatch, SetStateAction, RefObject, useRef, useState } from "react";
import useClickOutside from "../utils/useClickOutside";
import { useQuery } from "react-query";
import { useLocalStorage } from "../utils/useStorage";
import Fuse from "fuse.js";

interface Props {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
  selectedToken: Token[];
  setSelectedToken: Dispatch<SetStateAction<Token[]>>;
  modalIndex: 0 | 1;
}

export type Token = {
  id: string;
  name: string;
  symbol: string;
} & Record<string, any>;

export default function Modal({
  isOpen,
  setIsOpen,
  selectedToken,
  setSelectedToken,
  modalIndex,
}: Props) {
  // 리액트 훅 & 커스텀 훅
  const modalRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [value, setValue] = useLocalStorage(
    "recent",
    Array.from({ length: 7 }, () => ({ id: "", name: "", symbol: "" })),
  );
  const { data } = useQuery(["allTokenData"], async () => {
    const data: Token[] = await fetch(
      `https://api.coingecko.com/api/v3/coins/list`,
    ).then((res) => res.json());
    return data;
  });
  useClickOutside(modalRef, () => {
    setQuery("");
    modalClose();
  });
  const modalClose = () => setIsOpen(false);

  // fuse 검색 필터링
  const fuse = data && new Fuse(data, { includeScore: true, keys: ["symbol"] });
  const filteredData =
    query === "" ? data : fuse?.search(query).map((res) => ({ ...res.item }));

  // JSX
  return (
    <div
      className={`fixed duration-200 -z-10 inset-0 flex items-center justify-center bg-black/50 ${
        isOpen ? "opacity-100 z-10" : "opacity-0"
      }`}
    >
      <div ref={modalRef} className="max-w-lg">
        <div className="w-96 bg-black rounded-3xl p-2">
          <div className="flex justify-between text-white px-3 py-2">
            <div>Select a Token</div>
            <button onClick={() => setIsOpen(false)}>X</button>
          </div>
          <div className="flex px-3 flex-col items-center">
            <input
              className="my-3 w-full px-3 rounded-lg h-10"
              placeholder="Search name"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex flex-wrap justify-start gap-x-4">
              {value instanceof Array &&
                value.map((token, i) => {
                  return (
                    <div
                      key={i}
                      className={`flex justify-between items-center my-1 px-2 rounded-full max-w-[100px] h-8 bg-white ${
                        token.symbol === "" ? "opacity-0" : "opacity-100"
                      } ${
                        token.id === selectedToken[modalIndex]?.id
                          ? "bg-amber-100 pointer-events-none"
                          : ""
                      }`}
                    >
                      <div className="w-6 h-6 bg-red-300 rounded-full"></div>
                      <button
                        onClick={() => {
                          setSelectedToken((prev) => {
                            prev[modalIndex] = { ...token };
                            return [...prev];
                          });
                          modalClose();
                          setQuery("");
                        }}
                        disabled={token.symbol === ""}
                      >
                        {token.symbol}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
          <div className="h-[1px] my-4 w-full bg-slate-600"></div>
          <ul className="w-full h-32 max-h-72 overflow-y-auto bg-slate-800 text-white rounded-2xl">
            {filteredData?.map((item) => (
              <li
                key={item.id}
                className={`hover:bg-amber-100 hover:text-black px-3 py-1 h-8 cursor-pointer ${
                  item.id === selectedToken[modalIndex]?.id
                    ? "bg-black/20 text-amber-200 pointer-events-none "
                    : ""
                }`}
                onClick={() => {
                  setSelectedToken((prev) => {
                    prev[modalIndex] = { ...item };
                    return [...prev];
                  });
                  setValue((prev) => {
                    if (prev instanceof Array) {
                      unShift(prev, item);
                      return [...prev];
                    }
                  });
                  modalClose();
                  setQuery("");
                }}
              >
                <div>{item.symbol.toUpperCase()}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// 최신토큰목록 유지
function unShift(array: Token[], value: Token) {
  const length = array.length;
  for (let i = length - 1; i > 0; i--) {
    array[i] = array[i - 1];
  }
  array[0] = { ...value, symbol: value.symbol.toUpperCase() };
}
