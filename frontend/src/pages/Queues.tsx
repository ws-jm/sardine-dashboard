import React, { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { FormControl, Image } from "react-bootstrap";
import { captureException } from "utils/errorUtils";
import { useToasts } from "react-toast-notifications";
import { QUEUES_PATH, SESSIONS_PATH } from "modulePaths";
import { useCookies } from "react-cookie";
import { selectIsAdmin, selectIsSuperAdmin, useUserStore } from "store/user";
import moment from "moment";
import { SessionKind } from "sardine-dashboard-typescript-definitions";
import { replaceAllSpacesWithUnderscores } from "utils/stringUtils";
import Layout from "../components/Layout/Main";
import { StoreCtx } from "../utils/store";
import OrganisationDropDown from "../components/Dropdown/OrganisationDropDown";
import { StyledDropdownDiv, StyledNavTitle, StyledStickyNav, StyledTitleName } from "../components/Dashboard/styles";
import { ActionTypes } from "../utils/store/actionTypes";
import { CHECK_POINTS } from "../utils/dataProviderUtils";
import {
  StyledMainDiv,
  StyledTable,
  BackgroundBox,
  Title,
  StyledTh,
  StyledContainer,
  HorizontalContainer,
  HorizontalSpace,
  Container,
  Dropbtn,
  DropDownContent,
  SubDropbtn,
} from "../components/Queues/styles";
import { Queue } from "../components/Queues/Components/Queue";
import { QueueProps } from "../components/Queues/queueInterfaces";
import downArrow from "../utils/logo/down.svg";
import search_icon from "../utils/logo/search_light.svg";
import { getQueueslist, deleteQueue, getSessionslist } from "../utils/api";
import PopUp from "../components/Common/PopUp";
import { headers } from "./Sessions";
import { DATE_FORMATS } from "../constants";
import { exportCSVFile } from "../utils/csvUtils";

const HEADERS = ["Name", "Owner", "Counts", "Action"] as const;

const Queues: React.FC = () => {
  const navigate = useNavigate();
  const { dispatch } = useContext(StoreCtx);
  const location = useLocation();
  const [params] = useSearchParams();

  const [cookies] = useCookies(["organization"]);

  const [queuesData, setQueuesData] = useState<QueueProps[]>([]);
  const [dataHolder, setDataHolder] = useState<QueueProps[]>([]);

  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [exportingQueueId, setExportingQueueId] = useState(-1);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [searchString, setSearchString] = useState("");
  const organisationFromUserStore = useUserStore(({ organisation }) => organisation);
  const [organisation, setOrganisation] = useState(organisationFromUserStore);

  const [checkpoint, setCheckpoint] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [queueToRemove, setQueueToRemove] = useState<QueueProps | undefined>(undefined);
  const { addToast } = useToasts();
  const { isAdmin, isSuperAdmin, setUserStoreOrganisation } = useUserStore((state) => {
    const { setUserStoreOrganisation } = state;

    return {
      isAdmin: selectIsAdmin(state),
      isSuperAdmin: selectIsSuperAdmin(state),
      setUserStoreOrganisation,
    };
  });

  const changeOrganisation = (org: string) => {
    params.set("organization", org);
    navigate(`/queues?${params.toString()}`);
    navigate(0); // Refresh the page. TODO: Change the way to update the filter.
    setUserStoreOrganisation(organisation);
  };

  const loadData = useCallback(
    async (org: string, cp: string) => {
      if (!org || org === "all") {
        return;
      }

      try {
        const organization = isAdmin ? org : organisationFromUserStore;
        setIsLoading(true);
        const data = await getQueueslist(organization, cp);
        setDataHolder(data);
        setQueuesData(data);
      } catch (error) {
        addToast(`${error}`, {
          appearance: "error",
          autoDismiss: true,
        });
      }

      setIsLoading(false);
    },
    [addToast, isAdmin, organisationFromUserStore]
  );

  useEffect(() => {
    if (!isDataLoaded) {
      const org: string = params.get("organization") || organisationFromUserStore;
      const checkpointFromParams = params.get("checkpoint") || "";
      setCheckpoint(checkpointFromParams);

      if (cookies.organization) {
        setOrganisation(cookies.organization);
      } else {
        setOrganisation(org);
      }

      loadData(org, checkpointFromParams).catch(captureException);
      setIsDataLoaded(true);
      setIsLoading(false);
    }
  }, [isDataLoaded, loadData, checkpoint, location.search, organisationFromUserStore]);

  const manageStoreBeforePush = () => {
    const payload = {
      list: dataHolder,
      organisation,
      strSearch: searchString,
      checkpoint,
    };

    dispatch({ type: ActionTypes.QUEUES_LIST, payload });
    return payload;
  };

  const handleRemoveQueue = async (queueId: number) => {
    const result = await deleteQueue(organisation, queueId);

    if (!result.error) {
      setUserStoreOrganisation(organisation);
    }
  };

  const handleExportCases = async (queue: QueueProps) => {
    try {
      const { id, name, owner } = queue;
      const qName = replaceAllSpacesWithUnderscores(name || "");
      setExportingQueueId(id);
      const { list } = await getSessionslist(`${id}`, "start", organisation, "-1", 0, moment().unix(), {});

      const csvHeader = `${headers.join(",")}\n`;
      const csvData: string[] = list
        ? list.map((session: SessionKind) =>
            [
              session.session_key,
              session.customer_id,
              moment(session.timestamp * 1000).format(DATE_FORMATS.DATETIME),
              owner.name || "-",
              session.status,
            ].join(",")
          )
        : [];

      exportCSVFile(csvHeader + csvData.join("\n"), `${organisation}_${qName}_cases.csv`);
    } catch (error) {
      captureException(error);
    } finally {
      setExportingQueueId(-1);
    }
  };

  const DataList = (): JSX.Element => (
    <StyledTable>
      <thead style={{ height: 50 }}>
        <tr>
          {HEADERS.map((header) => (
            <StyledTh key={header}>{header}</StyledTh>
          ))}
        </tr>
      </thead>
      <tbody>
        {queuesData.map((queue) => (
          <Queue
            key={queue.id}
            queueData={queue}
            onRemove={() => setQueueToRemove(queue)}
            onExport={() => handleExportCases(queue)}
            isExporting={queue.id === exportingQueueId}
            isSuperAdmin={isSuperAdmin}
            onClick={() => {
              navigate(
                `${SESSIONS_PATH}?queueID=${queue.id}&name=${queue.name || "-"}&client_id=${queue.client_id}&org=${
                  organisation || "-"
                }&checkpoint=${queue.checkpoint}`,
                {
                  state: {
                    details: queue,
                    list: manageStoreBeforePush(),
                  },
                }
              );
            }}
          />
        ))}
      </tbody>
    </StyledTable>
  );

  const Dropdown = (): JSX.Element => (
    <>
      {Object.entries(CHECK_POINTS).map((element) => (
        <Container key={element[1]}>
          <SubDropbtn
            onClick={() => {
              params.set("checkpoint", element[1]);
              navigate(`${QUEUES_PATH}?${params.toString()}`);
              navigate(0); // Refresh the page. TODO: Change the way to update the filter.
            }}
          >
            <Title style={{ textAlign: "left", width: "max-content" }}>{element[1]}</Title>
          </SubDropbtn>
        </Container>
      ))}
    </>
  );

  const DropDownContainer = (): JSX.Element => (
    <Container>
      <Dropbtn
        style={{
          width: "max-content",
          flexDirection: "row",
          justifyContent: "space-between",
          height: 36,
          alignItems: "center",
        }}
        onClick={() => {
          setIsDropdownVisible(!isDropdownVisible);
        }}
      >
        {checkpoint.length > 0 ? checkpoint : "Checkpoint"}
        <Image
          src={downArrow}
          style={{
            marginLeft: 10,
            width: 12,
            height: 12,
            alignSelf: "center",
          }}
        />
      </Dropbtn>
      <DropDownContent style={{ display: isDropdownVisible ? "block" : "none", width: 200 }}>
        <Dropdown />
      </DropDownContent>
    </Container>
  );

  return (
    <Layout>
      <PopUp
        show={queueToRemove !== undefined}
        title="Remove Queue"
        message="Are you sure you want to remove this queue?"
        handleClose={() => setQueueToRemove(undefined)}
        handleSubmit={() => {
          if (queueToRemove) {
            handleRemoveQueue(queueToRemove.id)
              .catch((e) => {
                addToast(`${e}`, {
                  appearance: "error",
                  autoDismiss: true,
                });
                captureException(e);
              })
              .finally(() => setQueueToRemove(undefined));
          }
        }}
      />
      <StyledStickyNav style={{ width: "100%", marginBottom: 0, backgroundColor: "white" }}>
        <HorizontalContainer
          style={{
            padding: 20,
            flexDirection: window.screen.width < 760 ? "column" : "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <img alt="search" src={search_icon} style={{ width: 30, marginLeft: 30 }} />
          <FormControl
            type="text"
            placeholder="Search here"
            value={searchString}
            style={{
              marginRight: 20,
              height: 40,
              border: "none",
            }}
            data-tid="queues_search_form_control"
            onChange={(event) => {
              const text = event.target.value;
              setSearchString(text);
              if (text.length > 0) {
                const t = text.toLowerCase();
                setQueuesData(
                  dataHolder.filter(
                    (d) =>
                      d.name?.toLowerCase().includes(t) ||
                      d.owner.name?.toLowerCase().includes(t) ||
                      d.hits?.toString().includes(t)
                  )
                );
              } else {
                setQueuesData(dataHolder);
              }
            }}
          />
          <DropDownContainer />
          <StyledDropdownDiv>
            {isAdmin ? (
              <div style={{ zIndex: 20, marginRight: 20, minWidth: "max-content" }}>
                <OrganisationDropDown organisation={organisation} changeOrganisation={changeOrganisation} />
              </div>
            ) : (
              <div style={{ paddingRight: 100 }} />
            )}
          </StyledDropdownDiv>
        </HorizontalContainer>
      </StyledStickyNav>

      <StyledMainDiv style={{ height: "100vh", backgroundColor: "#FFF", width: "100%", margin: 0 }}>
        <StyledNavTitle style={{ width: "100%", marginLeft: 30 }}>
          <StyledTitleName style={{ fontSize: 32, fontWeight: "normal", paddingTop: 20 }}>
            Queues
            <StyledTitleName style={{ fontSize: 14, fontWeight: "normal", color: "#B9C5E0", marginTop: 10 }}>
              Case Management for the rules engine
            </StyledTitleName>
          </StyledTitleName>
        </StyledNavTitle>
        <StyledContainer>
          <BackgroundBox>
            {queuesData.length > 0 && !isLoading ? (
              <DataList />
            ) : (
              <div style={{ padding: "10px 50px 50px 30px", overflowX: "scroll" }}>
                <Title style={{ margin: 30, marginLeft: 50, textAlign: "center" }}>
                  {isLoading ? "Loading..." : organisation === "all" ? "Please select an organization" : "No list available!"}
                </Title>
              </div>
            )}
          </BackgroundBox>
          <HorizontalSpace style={{ marginTop: 50 }} />
        </StyledContainer>
      </StyledMainDiv>
    </Layout>
  );
};

export default Queues;
