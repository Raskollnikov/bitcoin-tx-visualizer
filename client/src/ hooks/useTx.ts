import { useReducer, useCallback } from "react";
import type { Transaction } from "../types";

interface State {
  tx: Transaction | null;
  loading: boolean;
  error: string | null;
  lastTxid: string | null; 
}

type Action =
  | { type: "FETCH_START"; txid: string }
  | { type: "FETCH_SUCCESS"; payload: Transaction }
  | { type: "FETCH_ERROR"; payload: string };

const initialState: State = {
  tx: null,
  loading: false,
  error: null,
  lastTxid: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":
      return { tx: null, loading: true, error: null, lastTxid: action.txid };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, tx: action.payload };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

export function useTx() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const search = useCallback(
    async (txid: string) => {
      const trimmed = txid.trim();
      if (!trimmed) return;

      if (trimmed === state.lastTxid) return;

      dispatch({ type: "FETCH_START", txid: trimmed });

      try {
        const res = await fetch(`/api/tx/${trimmed}`);

        if (res.status === 429) {
          dispatch({
            type: "FETCH_ERROR",
            payload: "rate limited, please wait a moment and try again.",
          });
          return;
        }
        if (!res.ok) {
          dispatch({
            type: "FETCH_ERROR",
            payload: `transaction not found (${res.status})`,
          });
          return;
        }

        const json = await res.json();
        dispatch({ type: "FETCH_SUCCESS", payload: json.data });
      } catch {
        dispatch({
          type: "FETCH_ERROR",
          payload: "network error, check your connection.",
        });
      }
    },
    [state.lastTxid],
  );

  return { ...state, search };
}
