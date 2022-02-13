import React, { useEffect, useState, useRef } from "react";
import { FormControl } from "react-bootstrap";
import { Grid } from "@material-ui/core";
import { ALL, getFailureResult, getSuccessResult, isFailure, Result } from "sardine-dashboard-typescript-definitions";
import {
  loadCustomerRiskLevelSessionDistribution,
  loadCustomerEmailRiskLevelDistribution,
  DateRiskExpression,
  loadDeviceSessionRiskLevelBreakdown,
} from "utils/chartUtils";
import { captureException } from "utils/errorUtils";
import Loader from "components/Common/Loader";
import { BackgroundBox, ChartContainer } from "styles/DataDistributionStyles";
import { selectIsAdmin, useUserStore } from "store/user";
import Layout from "../components/Layout/Main";
import { fetchOrganisationDetail } from "../utils/api";
import downArrow from "../utils/logo/down.svg";
import {
  Title,
  Container,
  Dropbtn,
  DropDownContent,
  SubDropbtn,
  StyledUl,
  HorizontalSpace,
} from "../components/RulesModule/styles";
import ZoomableBarChart from "../components/Common/ZoomableBarChart";

interface Organisation {
  name: string;
}

const CHART_HEIGHT = 400;

const LOADING_STATES = {
  LOADING: "loading",
  LOADED: "loaded",
  ERROR: "error",
} as const;

type LoadingState = typeof LOADING_STATES[keyof typeof LOADING_STATES];

const DataDistributionChart = ({
  title,
  dateRiskExpressions,
  loadingState,
}: {
  title: string;
  dateRiskExpressions: DateRiskExpression[];
  loadingState: LoadingState;
}) => {
  const chartLoaderOrErrorDiv = {
    [LOADING_STATES.LOADING]: <Loader height={CHART_HEIGHT} />,
    [LOADING_STATES.LOADED]: <ZoomableBarChart data={dateRiskExpressions} height={CHART_HEIGHT} />,
    [LOADING_STATES.ERROR]: <div style={{ height: CHART_HEIGHT }}>Failed to load the chart data.</div>,
  }[loadingState];

  return (
    <BackgroundBox>
      <ChartContainer>
        <h6>{title}</h6>
        {chartLoaderOrErrorDiv}
      </ChartContainer>
    </BackgroundBox>
  );
};

const DropDownContainer = ({
  setIsDropdownVisible,
  isDropdownVisible,
  organisation,
  refOrgSearch,
  organisationSearch,
  setOrganisationSearch,
  renderDropDown,
}: {
  setIsDropdownVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isDropdownVisible: boolean;
  organisation: Organisation;
  refOrgSearch: React.MutableRefObject<null>;
  organisationSearch: string;
  setOrganisationSearch: React.Dispatch<React.SetStateAction<string>>;
  renderDropDown: () => JSX.Element[];
}): JSX.Element => (
  <StyledUl style={{ justifyContent: "flex-end", marginRight: 50 }}>
    <Title>Select Organization: </Title>
    <HorizontalSpace />
    <Container>
      <Dropbtn
        data-tid="dropdown_button_org"
        style={{ width: 200, flexDirection: "row", justifyContent: "space-between", height: 40, alignItems: "center" }}
        onClick={() => {
          setIsDropdownVisible(!isDropdownVisible);
        }}
      >
        {organisation !== undefined && organisation.name !== undefined ? organisation.name.toUpperCase() : "Organization"}
        <img src={downArrow} alt="Down arrow" style={{ marginLeft: 10, width: 12, height: 12, alignSelf: "center" }} />
      </Dropbtn>
      <DropDownContent style={{ display: isDropdownVisible ? "block" : "", width: 200, maxHeight: 300, overflowY: "scroll" }}>
        <FormControl
          ref={refOrgSearch}
          type="text"
          value={organisationSearch}
          placeholder="Search"
          onChange={(event) => {
            const text = event.target.value;
            setOrganisationSearch(text);
          }}
        />
        {renderDropDown()}
      </DropDownContent>
    </Container>
  </StyledUl>
);

const DataDistribution = (): JSX.Element => {
  const [baseUrl, setBaseUrl] = useState(null);
  const [day] = useState(1);
  const refOrgSearch = useRef(null);
  const { organisationFromUserStore, isAdmin } = useUserStore((state) => {
    const { organisation, setUserStoreOrganisation } = state;
    return {
      organisationFromUserStore: organisation,
      isAdmin: selectIsAdmin(state),
      setUserStoreOrganisation,
    };
  });
  const [organisation, setOrganisation] = useState<Organisation>({ name: organisationFromUserStore });
  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [organisationSearch, setOrganisationSearch] = useState("");

  const [deviceSessionRiskLevelBreakdownLoadingState, setDeviceSessionRiskLevelBreakdownLoadingState] = useState<LoadingState>(
    LOADING_STATES.LOADING
  );
  const [customerRiskLevelSessionDistributionState, setCustomerRiskLevelSessionDistributionState] = useState<LoadingState>(
    LOADING_STATES.LOADING
  );
  const [customerEmailRiskLevelDistributionState, setCustomerEmailRiskLevelDistributionState] = useState<LoadingState>(
    LOADING_STATES.LOADING
  );
  const [deviceSessionRiskLevelSeries, setDeviceSessionRiskLevelSeries] = useState<DateRiskExpression[]>([]);
  const [customerRiskLevelSessionSeries, setCustomerRiskLevelSessionSeries] = useState<DateRiskExpression[]>([]);
  const [customerEmailRiskLevelSeries, setCustomerEmailRiskLevelSeries] = useState<DateRiskExpression[]>([]);

  useEffect(() => {
    const updateChartValues = async ({
      setLoadingState,
      load,
      setChartValues,
    }: {
      setLoadingState: (value: React.SetStateAction<LoadingState>) => void;
      load: (orgName: string) => Promise<Result<DateRiskExpression[]>>;
      setChartValues: (value: React.SetStateAction<DateRiskExpression[]>) => void;
    }) => {
      setLoadingState(LOADING_STATES.LOADING);
      const result = await load(organisation ? organisation.name : ALL);
      if (isFailure(result)) {
        setLoadingState(LOADING_STATES.ERROR);
        return;
      }

      setLoadingState(LOADING_STATES.LOADED);
      const seriesList = getSuccessResult(result);

      setChartValues(seriesList);
    };

    const updateCustomerRiskLevelSessionDistribution = async () => {
      await updateChartValues({
        setLoadingState: setCustomerRiskLevelSessionDistributionState,
        load: loadCustomerRiskLevelSessionDistribution,
        setChartValues: setCustomerRiskLevelSessionSeries,
      });
    };

    const updateDeviceSessionRiskLevelBreakdown = async () => {
      await updateChartValues({
        setLoadingState: setDeviceSessionRiskLevelBreakdownLoadingState,
        load: loadDeviceSessionRiskLevelBreakdown,
        setChartValues: setDeviceSessionRiskLevelSeries,
      });
    };

    const updateCustomerEmailRiskLevelDistribution = async () => {
      await updateChartValues({
        setLoadingState: setCustomerEmailRiskLevelDistributionState,
        load: loadCustomerEmailRiskLevelDistribution,
        setChartValues: setCustomerEmailRiskLevelSeries,
      });
    };

    const loadOrganisations = async () => {
      try {
        const result = await fetchOrganisationDetail();
        if (isFailure(result)) {
          const error = getFailureResult(result);
          captureException(error);
          return;
        }
        const orgs = getSuccessResult(result);
        setOrganisations(orgs.map((org) => ({ name: org.display_name })));
      } catch (e) {
        captureException(e);
      }
    };

    Promise.all([
      updateDeviceSessionRiskLevelBreakdown(),
      updateCustomerRiskLevelSessionDistribution(),
      updateCustomerEmailRiskLevelDistribution(),
    ])
      .then()
      .catch((e) => {
        captureException(e);
      });

    if (organisations.length === 0 && isAdmin) {
      loadOrganisations()
        .then()
        .catch((e) => {
          captureException(e);
        });
    }
  }, [day, organisationFromUserStore, baseUrl, isAdmin, organisation, organisations.length]);

  const renderDropDown = () =>
    organisations
      .filter((org) => org.name.toLowerCase().includes(organisationSearch.toLowerCase()))
      .map((element) => (
        <Container key={element.name}>
          <SubDropbtn
            onClick={() => {
              setOrganisation(element);
              setIsDropdownVisible(false);
              setTimeout(() => {
                setBaseUrl(null);
              }, 100);
            }}
          >
            <Title style={{ width: 180, textAlign: "left" }}>{element.name.toUpperCase()}</Title>
          </SubDropbtn>
        </Container>
      ));

  return (
    <Layout>
      {isAdmin ? (
        <DropDownContainer
          setIsDropdownVisible={setIsDropdownVisible}
          isDropdownVisible={isDropdownVisible}
          organisation={organisation}
          refOrgSearch={refOrgSearch}
          organisationSearch={organisationSearch}
          setOrganisationSearch={setOrganisationSearch}
          renderDropDown={renderDropDown}
        />
      ) : null}
      <div style={{ padding: 8 }}>
        <div style={{ padding: 20 }}>
          <h2>ALL Score distribution/breakdown</h2>
        </div>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <DataDistributionChart
              title="Percentage of Device Session Risk Level breakdown"
              key="device-session-risk-level-breakdown"
              dateRiskExpressions={deviceSessionRiskLevelSeries}
              loadingState={deviceSessionRiskLevelBreakdownLoadingState}
            />
          </Grid>
          <Grid item xs={6}>
            <DataDistributionChart
              title="Customer risk level(session) distribution"
              key="customer-risk-level-session-distribution"
              dateRiskExpressions={customerRiskLevelSessionSeries}
              loadingState={customerRiskLevelSessionDistributionState}
            />
          </Grid>
          <Grid item xs={6}>
            <DataDistributionChart
              title="Customer email risk level distribution"
              key="customer-email-risk-level-distribution"
              dateRiskExpressions={customerEmailRiskLevelSeries}
              loadingState={customerEmailRiskLevelDistributionState}
            />
          </Grid>
        </Grid>
      </div>
    </Layout>
  );
};

export { DataDistribution };
