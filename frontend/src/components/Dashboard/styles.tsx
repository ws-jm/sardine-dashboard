import styled from "styled-components";
import { AnyTodo } from "sardine-dashboard-typescript-definitions";

export const StyledDropdownDiv = styled.div`
  display: flex;
  align-items: center;
`;

export const StyledMainDiv = styled.div`
  @media (min-width: 1400px) {
    margin: 74px auto 20px 87px;
    width: 100%;
  }
  @media only screen and (max-width: 1400px) and (min-width: 1300px) {
    margin: 74px auto;
    width: max-content;
  }
  @media only screen and (max-width: 1300px) and (min-width: 700px) {
    margin: 20px auto 20px 10px;
    width: calc(100vw - 240px);
  }
`;

export const StyledNavTitle = styled.div<{ fixedHeight?: boolean }>`
  display: flex;
  justify-content: space-between;
  width: 994px;
  height: ${({ fixedHeight = true }) => (fixedHeight ? "70px" : "auto")};
  display: flex;
  @media only screen and (max-width: 1300px) and (min-width: 700px) {
    width: calc(100vw - 260px);
  }
`;

export const StyledStickyNav = styled.div`
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  margin-bottom: ${(props: AnyTodo) => (props.id === "all" ? "0px" : "96px")};
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  z-index: 10;
  @media (max-width: 700px) {
    display: none;
  }
  @media only screen and (max-width: 1300px) and (min-width: 700px) {
    width: calc(100vw - 260px);
  }
`;

export const StyledTitleName = styled.div`
  margin: auto 0px;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-size: 16px;
  line-height: 26px;
  color: var(--dark-14);
  line-break: anywhere;
`;
