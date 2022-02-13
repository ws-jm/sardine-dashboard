import React from "react";
import styled from "styled-components";
import { ProgressBar, Button } from "react-bootstrap";
import { StyledTitleName } from "../Dashboard/styles";
import { StyledTr, TdValue } from "./styles";
import imgEdit from "../../utils/logo/edit.svg";
import imgDelete from "../../utils/logo/delete.svg";

export const Cell = styled.td`
  vertical-align: middle;
  min-height: 25px;
  padding: 15px 10px;
  letter-spacing: 0em;
  text-align: left;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 18px;
  color: #325078;
`;

export const Title = styled(StyledTitleName)`
  font-size: 14px;
  padding: 5px 0;
`;

export interface BlocklistProps {
  id: string;
  type: string;
  value: string;
  expiry: string;
  scope: string;
  created_at?: string;
  isRemove?: boolean;
  onClick(isEdit: boolean): void;

  // Additional params for store management
  isBlocklist?: boolean;
}

export interface IExpiry {
  title: string;
  value: number;
  color: string;
  variant: string;
}

export const RowItem = (p: BlocklistProps) => {
  const getExpiryFromDate = (): IExpiry => {
    const expiryAt = new Date(p.expiry).getTime();
    const today = new Date().getTime();
    const diffTime = Math.abs(expiryAt - today);
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365);
    const years = parseFloat(diffYears.toFixed(2));

    let progress = years;
    if (p.created_at) {
      const createdAt = new Date(p.created_at!).getTime();
      const diffTotal = Math.abs(expiryAt - createdAt);

      progress = diffTime / diffTotal;
    }

    let t = `${years} year${years > 1 ? "s" : ""} remaining`;
    if (diffYears < 0.5) {
      const _days = diffYears * 365;
      if (_days > 0) {
        const d = Math.ceil(_days);
        t = `${d} day${d > 1 ? "s" : ""} remaining`;
      } else {
        const d = Math.ceil(_days * 24);
        t = `${d} hour${d > 1 ? "s" : ""} remaining`;
      }
    }

    return {
      title: t,
      value: progress * 100,
      variant: progress > 0.75 ? "danger" : progress > 0.5 ? "info" : progress > 0.25 ? "warning" : "success",
      color: progress > 0.75 ? "#FDF0F1" : progress > 0.5 ? "#E9FAFF" : progress > 0.25 ? "#FFF8E8" : "#E6FAEF",
    };
  };

  const expiry = getExpiryFromDate();

  return (
    <StyledTr key={p.value}>
      <Cell>
        <TdValue>{p.type}</TdValue>
        <TdValue style={{ fontSize: 15, color: "#325078", marginTop: 7 }}>{p.value}</TdValue>
      </Cell>
      <Cell>
        <TdValue>{expiry.title}</TdValue>
        <ProgressBar
          variant={expiry.variant}
          now={expiry.value}
          style={{ marginTop: 8, height: 6, width: 120, backgroundColor: expiry.color }}
        />
      </Cell>
      <Cell style={{ display: "none" }}>{p.scope}</Cell>
      {p.isRemove ? null : (
        <Cell style={{ width: 130 }}>
          <Button
            onClick={() => {
              p.onClick(true);
            }}
            style={{ backgroundColor: "#F8FBFF", border: "none", marginRight: 5 }}
          >
            <img alt="" src={imgEdit} />
          </Button>
          <Button
            onClick={() => {
              p.onClick(false);
            }}
            style={{ backgroundColor: "#F8FBFF", border: "none" }}
          >
            <img alt="" src={imgDelete} />
          </Button>
        </Cell>
      )}
    </StyledTr>
  );
};
