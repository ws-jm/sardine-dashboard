import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { useUserStore } from "store/user";
import Sidebar from "./Sidebar";

import menuCloseDark from "../../utils/logo/menuCloseDark.svg";
import menuOpen from "../../utils/logo/menuOpen.svg";
import sardineLogoGradient from "../../utils/logo/sardineLogoGradient.svg";
import { useSearchQuery } from "../../hooks/useSearchQuery";

const StyledMainDiv = styled.div<{ open: boolean }>`
  // height : 100vh;
  min-width: 100%;
  display: flex;
  overflow: hidden;
  min-height: 540px;
  @media only screen and (max-width: 700px) {
    display: ${(props) => (props.open ? "flex" : "grid")};
    transition: all 500ms linear;
    min-height: 100vh;
  }
`;

const StyledChildren = styled.div<{ open: boolean }>`
  width: 100%;
  @media only screen and (max-width: 700px) {
    transition: left 0.5s ease;
    left: ${(props) => (props.open ? "0px" : "auto")};
    margin-left: ${(props) => (props.open ? "none" : "auto")};
    overflow-x: hidden;
    overflow-y: auto;
    min-height: 100vh;
  }
`;

const StyledMobileNavBar = styled.div`
  display: none;
  min-width: 300px;
  height: 56px;
  background: #ffffff;
  padding: 16px 16px;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
  @media only screen and (max-width: 700px) {
    display: flex;
  }
`;

const StyledUserPhoto = styled.div<{ profilePic: boolean }>`
  display: flex;
  width: 24px;
  height: 24px;
  border: ${(props) => (props.profilePic ? "" : "1px solid #002D96")};
  border-radius: 36px;
  color: #002d96;
  justify-content: center;
  align-items: center;
  font-weight: 700;
`;

const StyledDivWithNav = styled.div`
  max-width: 100vw;
  overflow-x: hidden;
  overflow-y: auto;
  box-shadow: drop-shadow(0px 0px 10px rgba(0, 0, 0, 0.05));
`;

const StyledDrawer = styled.div<{ open: boolean }>`
display : flex;
@media only screen and (min-width: 700px){
  min-width : 240px;
}
@media only screen and (max-width: 700px){
  display : ${(props) => (props.open ? "flex" : "none")};
  position : ${(props) => (props.open ? "fixed" : "")};
  height : 100vh;
  overflow-x : auto
  transition : left 0.5s ease;
  // transform : ${(props) => (props.open ? "translateX(0)" : "translateX(-100%)")}
}
`;

const StyledImg = styled.img`
  height: 24px;
  width: 24px;
  z-index: 101;
`;

const StyledMainContentDiv = styled.div<{ open: boolean }>`
  width: 100%;
  @media only screen and (max-width: 700px) {
    min-width: 300px;
    margin-left: ${(props) => (props.open ? "240px" : "0")};
    overflow-y: ${(props) => (props.open ? "hidden" : "")};
  }
`;

const StyledBackdrop = styled.div`
  width: 100%;
  height: 100%;
  position: fixed;
  z-index: 100;
  left: 0;
  top: 0;
  background-color: #001932;
  opacity: 0.25;
  margin-left: 240px;
`;

const Main: React.FC = ({ children }) => {
  const [open, setOpen] = useState(false);
  const queries = useSearchQuery();
  const embed = queries.get("embed");
  const hideMenu = useMemo(() => embed === "true", [embed]);
  const userName = useUserStore((state) => state.name);

  return (
    <StyledMainDiv open={open}>
      {!hideMenu && (
        <StyledDrawer open={open}>
          <Sidebar />
        </StyledDrawer>
      )}
      <StyledMainContentDiv open={open}>
        <StyledDivWithNav>
          <StyledMobileNavBar>
            {!open ? (
              <StyledImg alt="" onClick={() => setOpen(!open)} src={menuCloseDark} />
            ) : (
              <StyledImg alt="" onClick={() => setOpen(!open)} src={menuOpen} />
            )}
            <StyledImg alt="" src={sardineLogoGradient} />
            <StyledUserPhoto profilePic={false}>{userName?.slice(0, 1)}</StyledUserPhoto>
          </StyledMobileNavBar>
        </StyledDivWithNav>
        {open ? <StyledBackdrop onClick={() => open && setOpen(false)} /> : null}
        {children ? <StyledChildren open={open}>{children}</StyledChildren> : null}
      </StyledMainContentDiv>
    </StyledMainDiv>
  );
};
export default Main;
