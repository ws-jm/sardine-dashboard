import { useNavigate } from "react-router-dom";
import { AnyTodo } from "sardine-dashboard-typescript-definitions";

export const useUpdateUrlParams = (): ((key: string, value: AnyTodo) => void) => {
  const navigate = useNavigate();

  const updateUrlParams = (key: string, value: AnyTodo) => {
    const url = new URL(window.location.href);
    url.searchParams.set(key, value);
    navigate(url.pathname + url.search);
  };

  return updateUrlParams;
};
