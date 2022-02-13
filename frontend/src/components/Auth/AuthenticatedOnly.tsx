import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useUserStore } from "store/user";
import { LOGIN_PATH } from "../../modulePaths";

export const REDIRECT_URL_KEY = "redirect_url";

export const AuthenticatedOnly = ({ element }: { element: JSX.Element }): JSX.Element | null => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = useUserStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      return;
    }

    const searchParams = new URLSearchParams();
    const { pathname, search } = location;
    const redirectPath = pathname + search;
    searchParams.append(REDIRECT_URL_KEY, redirectPath);

    navigate({
      pathname: LOGIN_PATH,
      search: searchParams.toString(),
    });
  }, [isAuthenticated, navigate, location]);

  if (!isAuthenticated) return null;
  return element;
};
