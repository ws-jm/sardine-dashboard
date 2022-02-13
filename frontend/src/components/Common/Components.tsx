import React from "react";
import { Button, Spinner } from "react-bootstrap";

interface IButtonProps {
  title: string;
  onClick: () => void;
  style?: React.CSSProperties;
  isLoading?: boolean;
}

export const SubmitButton = (p: IButtonProps) => (
  <Button
    style={{
      height: 45,
      borderRadius: 12,
      backgroundColor: "#2173FF",
      border: "none",
      ...p.style,
    }}
    onClick={p.onClick}
    disabled={p.isLoading || false}
  >
    {p.isLoading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : p.title}
  </Button>
);
