import * as Sentry from "@sentry/react";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { AnyTodo } from "sardine-dashboard-typescript-definitions";

/**
 * check in history.state
 * if don't have, check in local storage using the key pushed by openUrlNewTabWithHistoryState (path name + query string)
 *    if find, then push the state to history and clear the localStorage key
 */
export const useGetFallbackHistoryState = <T>() => {
  const location = useLocation();
  const { pathname, search } = location;
  const pathnameWithQueryString = pathname + search;

  return useMemo(() => {
    const historyState = location.state as T;

    if (historyState) {
      return historyState;
    }

    const serializedHistoryStateFromLocal = localStorage.getItem(pathnameWithQueryString);

    if (!serializedHistoryStateFromLocal) {
      return null;
    }

    try {
      const historyStateFromLocal = JSON.parse(serializedHistoryStateFromLocal);
      window.history.replaceState(historyStateFromLocal, window.title);
      localStorage.removeItem(pathnameWithQueryString);
      return window.history.state;
    } catch (error) {
      console.log({ error });
      Sentry.captureException(error);
      return null;
    }
  }, [pathnameWithQueryString, location.state]);
};

export const openUrlNewTabWithHistoryState = (url: string, state: Record<string, AnyTodo>) => {
  const serializedState = JSON.stringify(state);
  localStorage.setItem(url, serializedState);
  window.open(url);
};
