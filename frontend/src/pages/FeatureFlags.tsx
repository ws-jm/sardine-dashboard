import { useQuery as useReactQuery } from "react-query";
import OrganisationDropDown from "components/Dropdown/OrganisationDropDown";
import { StyledDropdownDiv, StyledMainDiv } from "styles/Layout";
import { CLIENT_QUERY_FIELD } from "utils/constructFiltersQueryParams";
import { getClientIdObject } from "utils/api";
import { useSearchQuery } from "hooks/useSearchQuery";
import { FEATURE_FLAGS_PATH } from "modulePaths";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { selectIsSuperAdmin, useUserStore } from "store/user";
import Layout from "../components/Layout/Main";
import { StyledNavTitle, StyledStickyNav, StyledTitleName } from "../components/Dashboard/styles";
import { AllFlagsTable } from "../components/FeatureFlags/AllFeatureFragsTable";
import { FeatureFlagsOfOrgTable } from "../components/FeatureFlags/FeatureFlagsOfOrgTable";

const FlagPage = (): JSX.Element => {
  const queries = useSearchQuery();
  const navigate = useNavigate();

  const [cookies] = useCookies(["organization"]);

  const isSuperAdmin = useUserStore(selectIsSuperAdmin);
  const organisation = cookies.organization || queries.get(CLIENT_QUERY_FIELD);
  const { data: clientIdData } = useReactQuery(String(organisation), () => getClientIdObject(String(organisation)), {
    enabled: Boolean(organisation),
  });

  const updateFilters = (newOrganisation: string) => {
    const url = new URL(FEATURE_FLAGS_PATH, window.origin);
    url.searchParams.append(CLIENT_QUERY_FIELD, newOrganisation);
    navigate(url.pathname + url.search);
    navigate(0); // Refresh the page. TODO: Change the way to update the filter.
  };

  const renderFlagsTable = () => {
    if (clientIdData) return <FeatureFlagsOfOrgTable clientID={clientIdData?.client_id} />;
    return <AllFlagsTable />;
  };

  return (
    <Layout>
      <StyledMainDiv>
        <StyledStickyNav id="flags" className="m-2">
          <StyledNavTitle className="w-100">
            <StyledTitleName>Flags</StyledTitleName>
            {isSuperAdmin && (
              <StyledDropdownDiv>
                <OrganisationDropDown organisation={organisation} changeOrganisation={updateFilters} />
              </StyledDropdownDiv>
            )}
          </StyledNavTitle>
        </StyledStickyNav>
        {renderFlagsTable()}
      </StyledMainDiv>
    </Layout>
  );
};

export default FlagPage;
