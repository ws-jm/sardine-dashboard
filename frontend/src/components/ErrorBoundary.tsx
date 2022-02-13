import { FC, useEffect, useState } from "react";
import * as Sentry from "@sentry/react";
import { GenericError } from "./Error/GenericError";

export const fallbackComponent = <GenericError />;

export const ErrorBoundary: FC = ({ children }) => {
  const [renderGenericErr, setRenderGenericErr] = useState(false);
  useEffect(() => {
    window.addEventListener("error", (e) => {
      Sentry.captureException(e);
      setRenderGenericErr(true);
    });

    window.addEventListener("unhandledrejection", (e) => {
      Sentry.captureException(e.reason);
    });
  }, []);

  if (renderGenericErr) {
    return fallbackComponent;
  }

  return <Sentry.ErrorBoundary fallback={fallbackComponent}>{children}</Sentry.ErrorBoundary>;
};
