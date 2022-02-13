import { useState } from "react";
import moment from "moment"; // TODO: Stop using moment.js because it is obsolete.
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import styled from "styled-components";
import { Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { WEBHOOK_PATH } from "components/Webhooks";
import { SAR_PATH } from "components/SAR";
import { INTEGRATION_STATUS_PATH } from "components/IntegrationStatus";
import { BLOCK_ALLOW_LIST_PATH } from "components/BlockAllowList/urls";
import {
  DATA_DISTRIBUTION_PATH,
  TRANSACTIONS_PATH,
  NOTIFICATIONS_PATH,
  FEATURE_FLAGS_PATH,
  DOCUMENT_VERIFICATIONS_PATH,
  QUEUES_PATH,
  FRAUD_SCORE_PATH,
  CUSTOMERS_PATH,
  RULES_PATH,
} from "modulePaths";
import { Line } from "components/RulesModule/styles";
import { useUserStore, selectIsAdmin, selectIsSuperAdmin } from "store/user";
import { CLIENT_QUERY_FIELD } from "utils/constructFiltersQueryParams";
import { DATE_FORMATS, ORGANIZATION_QUERY_FIELD } from "../../constants";
import firebaseClient from "../../utils/firebase";
import { captureException } from "../../utils/errorUtils";
import { replaceAllSpacesWithUnderscores } from "../../utils/stringUtils";
import PopUp from "../Common/PopUp";
import deviceIntelligence from "../../utils/logo/deviceIntelligence.svg";
import adminLogo from "../../utils/logo/admin.svg";
import transactionsLogo from "../../utils/logo/transactions.svg";
import dashboardLogo from "../../utils/logo/dashboard.svg";
import darkLogo from "../../utils/logo/Dark.svg";
import rulesLogos from "../../utils/logo/rules.svg";
import settingsLogo from "../../utils/logo/settings.svg";
import logoutIcon from "../../utils/logo/logout.svg";
import docsLogo from "../../utils/logo/docs.svg";
import customers from "../../utils/logo/customer.svg";
import blocklist from "../../utils/logo/blocklist.svg";
import queuesLogo from "../../utils/logo/queues.svg";
import infoLogo from "../../utils/logo/info.svg";

const SideBarMainDiv = styled.div`
  position: fixed;
  width: 250px;
  height: 100vh;
  left: 0px;
  top: 0px;
  background: #ffffff;
`;

const StyledLogoTitle = styled.div`
  margin-top: 26px;
  margin-left: 20px;
  display: flex;
  @media (max-width: 700px) {
    margin-top: 16px;
  }
`;

const StyledTitle = styled.div`
  align-self: center;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: 600;
  font-size: 14px;
  line-height: 18px;
  font-feature-settings: "ss02" on;

  /* Primary */

  color: #001932;
  margin-left: 12px;
`;

const StyledMenu = styled.div`
  margin: 45px 0px 125px 24px;
  overflow: auto;
  height: -webkit-fill-available;
  ::-webkit-scrollbar {
    width: 0px;
  }
`;

const MenuItem = styled.div<{ index?: number; isActive?: boolean }>`
  height: ${(props) => (props.index === 0 ? "36px" : "24px")};
  margin-bottom: 4px;
  display: flex;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: ${(props) => (props.index === 0 ? "14px" : "12px")};
  line-height: 16px;
  /* identical to box height */

  font-feature-settings: "ss02" on;

  /* Primary */

  color: var(--dark-14);
  align-items: center;
  border-right: ${(props) => (props.isActive ? "2px solid #37C2F2" : "")};
  cursor: pointer;
`;

const StyledItemLogo = styled.div`
  width: 16px;
  height: 16px;
  marign: auto;
`;

const StyledSubItem = styled.div`
  height: 16px;
  margin-left: 16px;
`;

const StyledUser = styled.div`
  width: 240px;
  background: #ffffff;
  height: 68px;
  align-items: center;
  display: flex;
  bottom: 0;
  position: fixed;
  @media only screen and (max-width: 700px) {
  }
`;

const UserProfilePic = styled.div`
  height: 36px;
  width: 36px;
  border-radius: 18px;
  margin: 16px 12px 16px 16px;
  background-color: #909bad;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-weight: 700;
`;

const UserName = styled.div`
  max-width: 113px;
  overflow: hidden;
  left: 64px;
  height: 20px;
  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 140%;
  /* identical to box height, or 20px */

  font-feature-settings: "ss02" on;

  /* Secondary */

  color: #909bad;
`;

const StyledLogout = styled.img`
  position: absolute;
  width: 16px;
  height: 16px;
  left: 208px;
`;

const StyledUpcomingDiv = styled.div`
  display: flex;
  height: 30px;
  margin-top: 15px;
  align-items: center;

  font-family: IBM Plex Sans;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 140%;
  font-feature-settings: "ss02" on;

  color: #325078;
`;

const StyledLink = styled(Link)`
  color: var(--dark-14);
  font-size: 14px;
  line-height: 18px;
  text-decoration: none !important;
`;

const SettingsIcon = styled(Link)`
  position: absolute;
  width: 16px;
  height: 16px;
  left: 180px;
  top: 27px;
  img {
    vertical-align: top;
  }
`;

const Image = styled.img`
  width: 18px;
  height: 18px;
`;

interface SuperAdminMenuProps {
  title: string;
  path: string;
}

const filterStartDate = moment().subtract({ days: 1 }).utc().format(DATE_FORMATS.DATETIME);
const filterEndDate = moment().utc().format(DATE_FORMATS.DATETIME);

const diDefaultPath = `${FRAUD_SCORE_PATH}?session_risk=high&start_date=${filterStartDate}&end_date=${filterEndDate}`;

const ciDefaultPath = `${CUSTOMERS_PATH}?risk_level=high&start_date=${filterStartDate}&end_date=${filterEndDate}`;

const Sidebar = (): JSX.Element => {
  const navigate = useNavigate();
  const [cookies] = useCookies(["organization"]);
  const { isSuperAdmin, logout, userName } = useUserStore((state) => {
    const { logout, name } = state;
    return {
      isSuperAdmin: selectIsSuperAdmin(state),
      logout,
      userName: name,
    };
  });
  const isAdmin = useUserStore(selectIsAdmin);

  const [showPopup, setShowPopup] = useState(false);

  const logoutUser = async () => {
    try {
      await firebaseClient.logout();
      await logout();
      navigate("/login");
    } catch (e) {
      captureException(e);
    }
  };

  const superAdminMenu: SuperAdminMenuProps[] = [
    {
      title: "Flags",
      path: FEATURE_FLAGS_PATH,
    },
    {
      title: "Integration Status",
      path: INTEGRATION_STATUS_PATH,
    },
    {
      title: "Purchase Limit",
      path: "/purchaseLimit",
    },
    {
      title: "Webhooks",
      path: WEBHOOK_PATH,
    },
    {
      title: "Send Notification",
      path: NOTIFICATIONS_PATH,
    },
  ];

  return (
    <SideBarMainDiv>
      <PopUp
        show={showPopup}
        title="Logout"
        message="Are you sure you want to logout?"
        handleClose={() => {
          setShowPopup(false);
        }}
        handleSubmit={logoutUser}
      />
      <StyledLogoTitle>
        <Image alt="" src={darkLogo} />
        <StyledTitle>Sardine</StyledTitle>
      </StyledLogoTitle>
      <StyledMenu>
        <MenuItem>
          <Image alt="" src={deviceIntelligence} />
          <StyledSubItem>
            <StyledLink to={diDefaultPath} data-tid="sidebar_link_device_intelligence">
              Device Intelligence
            </StyledLink>
          </StyledSubItem>
        </MenuItem>

        <StyledUpcomingDiv>
          <Image alt="customers" src={customers} />
          <StyledSubItem>
            <StyledLink to={ciDefaultPath} data-tid="sidebar_link_customer_intelligence">
              Customer Intelligence
            </StyledLink>
          </StyledSubItem>
        </StyledUpcomingDiv>
        <StyledUpcomingDiv>
          <Image src={docsLogo} />
          <StyledSubItem>
            <StyledLink
              to={`${DOCUMENT_VERIFICATIONS_PATH}${cookies.organization ? `?${CLIENT_QUERY_FIELD}=${cookies.organization}` : ""}`}
              data-tid="sidebar_link_document_verifications"
            >
              Document Verifications
            </StyledLink>
          </StyledSubItem>
        </StyledUpcomingDiv>

        <StyledUpcomingDiv>
          <Image alt="transactions" src={transactionsLogo} />
          <StyledSubItem>
            <StyledLink
              to={`${TRANSACTIONS_PATH}${cookies.organization ? `?${CLIENT_QUERY_FIELD}=${cookies.organization}` : ""}`}
              data-tid="sidebar_link_transaction_intelligence"
            >
              Transaction Intelligence
            </StyledLink>
          </StyledSubItem>
          <Badge style={{ fontSize: 8, marginLeft: 5 }} bg="info">
            BETA
          </Badge>
        </StyledUpcomingDiv>

        <StyledUpcomingDiv>
          <StyledItemLogo>
            <Image alt="" src={dashboardLogo} />
          </StyledItemLogo>
          <StyledSubItem>
            <StyledLink to={DATA_DISTRIBUTION_PATH} data-tid="sidebar_link_data_distribution">
              Data Distribution
            </StyledLink>
          </StyledSubItem>
        </StyledUpcomingDiv>

        <StyledUpcomingDiv>
          <Image alt="" src={rulesLogos} />
          <StyledSubItem>
            <StyledLink
              to={`${RULES_PATH}${cookies.organization ? `?${CLIENT_QUERY_FIELD}=${cookies.organization}` : ""}`}
              data-tid="sidebar_link_rules"
            >
              Rules
            </StyledLink>
          </StyledSubItem>
        </StyledUpcomingDiv>

        <StyledUpcomingDiv>
          <Image alt="" src={blocklist} />
          <StyledSubItem>
            <StyledLink
              to={`${BLOCK_ALLOW_LIST_PATH}${cookies.organization ? `?${ORGANIZATION_QUERY_FIELD}=${cookies.organization}` : ""}`}
              data-tid="sidebar_link_block_allow_list"
            >
              Blocklist/Allowlist
            </StyledLink>
          </StyledSubItem>
        </StyledUpcomingDiv>

        <StyledUpcomingDiv>
          <Image alt="queues" src={queuesLogo} />
          <StyledSubItem>
            <StyledLink
              to={`${QUEUES_PATH}${cookies.organization ? `?${ORGANIZATION_QUERY_FIELD}=${cookies.organization}` : ""}`}
              data-tid="sidebar_link_queues"
            >
              Queues
            </StyledLink>
          </StyledSubItem>
        </StyledUpcomingDiv>

        <StyledUpcomingDiv>
          <Image alt="" src={docsLogo} />
          <StyledSubItem>
            <a
              href="https://sardine:apidoc@docs.sardine.ai"
              style={{ color: "#325078", textDecoration: "none" }}
              data-tid="sidebar_link_docs"
            >
              Docs
            </a>
          </StyledSubItem>
        </StyledUpcomingDiv>

        {isSuperAdmin && (
          <StyledUpcomingDiv>
            <Image src={infoLogo} />
            <StyledSubItem>
              <StyledLink to={INTEGRATION_STATUS_PATH} data-tid="sidebar_link_integration_status">
                Integration Status
              </StyledLink>
            </StyledSubItem>
          </StyledUpcomingDiv>
        )}

        {isAdmin && (
          <StyledUpcomingDiv>
            <Image alt="admin" src={adminLogo} />
            <StyledSubItem>
              <StyledLink to="/admin" data-tid="sidebar_link_admin">
                Admin
              </StyledLink>
            </StyledSubItem>
          </StyledUpcomingDiv>
        )}

        {isSuperAdmin && (
          <StyledUpcomingDiv>
            <Image alt="sar" src={docsLogo} />
            <StyledSubItem>
              <StyledLink to={SAR_PATH} data-tid="sidebar_link_file_a_sar">
                File A SAR
              </StyledLink>
            </StyledSubItem>
          </StyledUpcomingDiv>
        )}

        {isSuperAdmin && (
          <>
            <Line />
            <StyledUpcomingDiv>
              <Image src={adminLogo} />
              <StyledSubItem style={{ fontWeight: 500, color: "var(--dark-14)" }} data-tid="sidebar_sardine_admin">
                Sardine Admin
              </StyledSubItem>
            </StyledUpcomingDiv>
            {superAdminMenu.map((menu) => (
              <StyledUpcomingDiv key={menu.path} style={{ marginTop: 5 }}>
                <StyledSubItem style={{ paddingLeft: 20 }}>
                  <StyledLink
                    to={menu.path}
                    data-tid={`sidebar_link_sardine_admin_${replaceAllSpacesWithUnderscores(menu.title.toLowerCase())}`}
                  >
                    {menu.title}
                  </StyledLink>
                </StyledSubItem>
              </StyledUpcomingDiv>
            ))}
          </>
        )}
      </StyledMenu>
      <StyledUser>
        <UserProfilePic>{false ? <img alt="" src="" /> : userName?.slice(0, 1).toUpperCase()}</UserProfilePic>
        <UserName>{userName}</UserName>
        <>
          <OverlayTrigger key="top" placement="top" overlay={<Tooltip id="tooltip-top">Settings</Tooltip>}>
            <SettingsIcon to="/settings">
              <img alt="" src={settingsLogo} />
            </SettingsIcon>
          </OverlayTrigger>{" "}
        </>
        <>
          <OverlayTrigger key="top" placement="top" overlay={<Tooltip id="tooltip-top">Logout</Tooltip>}>
            <StyledLogout
              alt=""
              onClick={() => {
                setShowPopup(true);
              }}
              src={logoutIcon}
            />
          </OverlayTrigger>{" "}
        </>
      </StyledUser>
    </SideBarMainDiv>
  );
};

export default Sidebar;
