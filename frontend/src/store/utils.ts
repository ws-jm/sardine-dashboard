import { State, StateCreator } from "zustand";
import produce, { Draft } from "immer";
import { NamedSet } from "zustand/middleware";
import { AnyTodo } from "sardine-dashboard-typescript-definitions";

// eslint-disable-next-line @typescript-eslint/ban-types
export const createSetWithReplaceParamLast = <T extends object>(set: NamedSet<T>) => {
  type Params = Parameters<NamedSet<T>>;
  type State = Partial<T> | ((state: T) => void);

  const newSet = (state: State, reduxKey?: Params[2], replace: Params[1] = false) => {
    // Prebuilt typescript definition of zustand didn't play nice with each other
    set(state as AnyTodo, replace, reduxKey);
  };
  return newSet;
};

export const immer =
  <T extends State>(config: StateCreator<T>): StateCreator<T> =>
  (set, get, api) =>
    config(
      (partial, replace) => {
        const nextState = typeof partial === "function" ? produce(partial as (state: Draft<T>) => T) : (partial as T);
        return set(nextState, replace);
      },
      get,
      api
    );
