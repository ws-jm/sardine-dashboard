import { useContext, useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FormControl, Image, Button, Badge } from "react-bootstrap";
import { captureException } from "utils/errorUtils";
import { useCookies } from "react-cookie";
import { selectIsAdmin, useUserStore } from "store/user";
import Layout from "../Layout/Main";
import { StoreCtx } from "../../utils/store";
import OrganisationDropDown from "../Dropdown/OrganisationDropDown";
import { StyledDropdownDiv, StyledNavTitle, StyledStickyNav, StyledTitleName } from "../Dashboard/styles";
import { ActionTypes } from "../../utils/store/actionTypes";
import { isWideScreen } from "../../utils/dataProviderUtils";
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
  StyledUl,
} from "./styles";
import { RowItem, BlocklistProps } from "./RowItem";
import downArrow from "../../utils/logo/down.svg";
import blocklistSelected from "../../utils/logo/blocklist_selected.svg";
import blocklistUnselected from "../../utils/logo/blocklist_unselected.svg";
import allowlistSelected from "../../utils/logo/allowlist_selected.svg";
import allowlistUnselected from "../../utils/logo/allowlist_unselected.svg";
import RemovePopup from "./RemovePopup";
import { getBlocklist, getAllowlist } from "../../utils/api";
import { getHeaders } from "./BlockAllowListUtils";
import { convertType } from "./AddNew";
import { ADD_NEW_BLOCK_ALLOW_LIST_PATH } from "./urls";

export * from "./urls";

interface ITabProps {
  isBlocklist: boolean;
  isSelected: boolean;
}

export interface IDataProps {
  blocklist: BlocklistProps[];
  allowlist: BlocklistProps[];
}

const listTypes = {
  blocklist: "blocklist",
  allowlist: "allowlist",
};

const BlockAllowList = (): JSX.Element => {
  const { state, dispatch } = useContext(StoreCtx);
  const navigate = useNavigate();

  const [cookies] = useCookies(["organization"]);

  const [blocklistData, setBlocklistData] = useState<BlocklistProps[]>([]);
  const [allowlistData, setAllowlistData] = useState<BlocklistProps[]>([]);
  const [dataHolder, setDataHolder] = useState<IDataProps>({
    blocklist: [],
    allowlist: [],
  });
  const [fieldType, setFieldType] = useState("");
  const [listType, setListType] = useState(listTypes.blocklist);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [searchString, setSearchString] = useState("");
  const [deleteIndex, setDeleteIndex] = useState(-1);

  const [isLoading, setIsLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const { isAdmin, organisationFromUserStore, setUserStoreOrganisation } = useUserStore((state) => {
    const { organisation, setUserStoreOrganisation } = state;

    const org = searchParams.get("organization") || organisation;

    return {
      isAdmin: selectIsAdmin(state),
      organisationFromUserStore: org,
      setUserStoreOrganisation,
    };
  });
  const [organisation, setOrganisation] = useState(organisationFromUserStore);

  const changeOrganisation = (organisationName: string) => {
    state.blockAllowList.blocklist = [];
    state.blockAllowList.allowlist = [];
    setIsDataLoaded(false);
    setOrganisation(organisationName);
    setUserStoreOrganisation(organisationName);
    navigate(`?organization=${organisationName}`);
    navigate(0); // Refresh the page. TODO: Change the way to update the filter.
  };

  const loadData = useCallback(
    async (org: string) => {
      try {
        if (org === "all" || isLoading) {
          return;
        }

        setIsLoading(true);

        const ft = fieldType === "All" ? "" : fieldType;
        const blocklists = await getBlocklist(org, ft);
        const allowlists = await getAllowlist(org, ft);

        const bl = blocklists.result || [];
        const wl = allowlists.result || [];

        if (searchString.length > 0) {
          const t = searchString;
          setBlocklistData(
            bl.filter(
              (b: BlocklistProps) =>
                b.type.toLowerCase().includes(t) || b.value.toLowerCase().includes(t) || b.scope.toLowerCase().includes(t)
            )
          );
          setAllowlistData(
            wl.filter(
              (w: BlocklistProps) =>
                w.type.toLowerCase().includes(t) || w.value.toLowerCase().includes(t) || w.scope.toLowerCase().includes(t)
            )
          );
        } else {
          setBlocklistData(bl);
          setAllowlistData(wl);
        }

        setDataHolder({
          blocklist: bl,
          allowlist: wl,
        });
      } catch (error) {
        // Do nothing
      }
      setIsLoading(false);
    },
    [fieldType, searchString, isLoading]
  );

  useEffect(() => {
    if (!isDataLoaded) {
      setIsDataLoaded(true);

      const bl = state.blockAllowList;
      if (bl.blocklist.length > 0 || bl.allowlist.length > 0) {
        const blockListItem = bl.blocklist;
        const allowListItem = bl.allowlist;

        setBlocklistData(blockListItem);
        setAllowlistData(allowListItem);

        setDataHolder({
          blocklist: blockListItem,
          allowlist: allowListItem,
        });

        if (bl.selectedTab) {
          setListType(bl.selectedTab);
        }

        if (cookies.organization) {
          setOrganisation(cookies.organization);
        } else if (bl.organisation) {
          setOrganisation(bl.organisation);
        }

        if (bl.strSearch) {
          setSearchString(bl.strSearch);

          if (bl.strSearch.length > 0) {
            const t = bl.strSearch;
            setBlocklistData(
              blockListItem.filter(
                (b: BlocklistProps) =>
                  b.type.toLowerCase().includes(t) || b.value.toLowerCase().includes(t) || b.scope.toLowerCase().includes(t)
              )
            );
            setAllowlistData(
              allowListItem.filter(
                (w: BlocklistProps) =>
                  w.type.toLowerCase().includes(t) || w.value.toLowerCase().includes(t) || w.scope.toLowerCase().includes(t)
              )
            );
          }
        }

        if (bl.fieldType) {
          setFieldType(bl.fieldType);
        }

        if (bl.shouldRefresh && bl.shouldRefresh === true) {
          setTimeout(() => {
            loadData(bl.organisation).catch(captureException);
          }, 200);
        }
      } else {
        loadData(organisation).catch(captureException);
      }
    }
  }, [isDataLoaded, organisation, state.blockAllowList, loadData]);

  const manageStoreBeforePush = () => {
    const payload = {
      blocklist: dataHolder.blocklist,
      allowlist: dataHolder.allowlist,
      selectedTab: listType,
      organisation,
      fieldType,
      shouldRefresh: false,
      strSearch: searchString,
    };

    dispatch({ type: ActionTypes.BLOCK_LIST, payload });
    return payload;
  };

  const isBlockList = () => listType === listTypes.blocklist;

  const DataList = () => {
    const data = isBlockList() ? blocklistData : allowlistData;

    return (
      <StyledTable>
        <thead style={{ height: 40, border: 5 }}>
          <tr>
            {getHeaders(isBlockList()).map((ele, eleIndex) => (
              <StyledTh
                style={{
                  textAlign: "left",
                  width: eleIndex === 0 ? "20%" : "auto",
                  backgroundColor: "#F7F9FC",
                }}
                key={ele}
              >
                {ele}
              </StyledTh>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((d, index) => {
            const { id, scope, type, value, created_at, expiry } = d;
            const convertedType = convertType(type, false);
            return (
              <RowItem
                key={id}
                id={id}
                type={convertedType === "" ? type : convertedType}
                value={value}
                expiry={expiry}
                scope={scope}
                created_at={created_at}
                onClick={(isEdit: boolean) => {
                  if (isEdit) {
                    const item = isBlockList() ? blocklistData[index] : allowlistData[index];

                    item.isBlocklist = isBlockList();

                    navigate(ADD_NEW_BLOCK_ALLOW_LIST_PATH, {
                      state: {
                        details: item,
                        list: manageStoreBeforePush(),
                      },
                    });
                    navigate(0); // Refresh the page. TODO: Change the way to update the filter.
                  } else {
                    setDeleteIndex(index);
                  }
                }}
              />
            );
          })}
        </tbody>
      </StyledTable>
    );
  };

  const renderDropDown = () =>
    ["All", "Field level", "Transaction level"].map((element) => (
      <Container key={element}>
        <SubDropbtn
          onClick={() => {
            setFieldType(element);
            setIsDropdownVisible(false);
            loadData(organisation).catch(captureException);
          }}
        >
          <Title style={{ width: 180, textAlign: "left" }}>{element}</Title>
        </SubDropbtn>
      </Container>
    ));

  const DropDownContainer = () => (
    <Container style={{ display: "none" }}>
      <Dropbtn
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          height: 36,
          alignItems: "center",
        }}
        onClick={() => {
          setIsDropdownVisible(!isDropdownVisible);
        }}
      >
        {fieldType.length > 0 ? fieldType : "Field Type"}
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
      <DropDownContent style={{ display: isDropdownVisible ? "block" : "none", width: 160 }}>{renderDropDown()}</DropDownContent>
    </Container>
  );

  const ListTab = (p: ITabProps) => {
    const { isSelected, isBlocklist } = p;
    return (
      <HorizontalContainer
        style={{
          height: "100%",
          border: "solid 5px transparent",
          borderBottomColor: isSelected ? "#2173FF" : "transparent",
        }}
        onClick={() => {
          setListType(isBlocklist ? listTypes.blocklist : listTypes.allowlist);
        }}
      >
        <img
          alt=""
          src={
            isBlocklist
              ? isSelected
                ? blocklistSelected
                : blocklistUnselected
              : isSelected
              ? allowlistSelected
              : allowlistUnselected
          }
        />
        <StyledTitleName
          style={{
            marginLeft: 10,
            marginRight: 10,
            color: isSelected ? "#2173FF" : "#325078",
          }}
        >
          {" "}
          {isBlocklist ? "Blocklist" : "Allowlist"}
        </StyledTitleName>
        <Badge
          style={{
            backgroundColor: isSelected ? "#2173FF25" : "#32507815",
            height: "max-content",
          }}
        >
          {isBlocklist ? blocklistData.length : allowlistData.length}
        </Badge>
      </HorizontalContainer>
    );
  };

  return (
    <Layout>
      {deleteIndex > -1 ? (
        <RemovePopup
          show
          data={isBlockList() ? blocklistData[deleteIndex] : allowlistData[deleteIndex]}
          isBlockList={isBlockList()}
          organisation={organisation}
          handleClose={() => {
            setDeleteIndex(-1);
          }}
          handleSuccess={() => {
            setDeleteIndex(-1);
            loadData(organisation).catch(captureException);
          }}
        />
      ) : null}
      <StyledMainDiv>
        <StyledStickyNav id="device-info" style={{ width: "inherit", marginBottom: 10 }}>
          <StyledNavTitle style={{ width: "100%" }}>
            <StyledTitleName> Blocklist/Allowlist</StyledTitleName>
            <StyledDropdownDiv>
              {isAdmin ? (
                <>
                  Organization:
                  <div style={{ zIndex: 20 }}>
                    <OrganisationDropDown organisation={organisation} changeOrganisation={changeOrganisation} />
                  </div>
                </>
              ) : null}
            </StyledDropdownDiv>
          </StyledNavTitle>
        </StyledStickyNav>
        <StyledContainer>
          <BackgroundBox>
            <HorizontalContainer
              style={{
                marginTop: 20,
                flexDirection: window.screen.width < 760 ? "column" : "row",
                justifyContent: "space-between",
              }}
            >
              <HorizontalContainer>
                <FormControl
                  type="text"
                  placeholder="Search here"
                  value={searchString}
                  style={{
                    width: isWideScreen() ? 300 : 200,
                    marginLeft: 30,
                    marginRight: 20,
                    height: 36,
                  }}
                  onChange={(event) => {
                    const text = event.target.value;
                    setSearchString(text);

                    const bl = dataHolder.blocklist;
                    const wl = dataHolder.allowlist;

                    if (text.length > 0) {
                      const t = text.toLowerCase();

                      setBlocklistData(
                        bl.filter(
                          (b) =>
                            b.type.toLowerCase().includes(t) ||
                            b.value.toLowerCase().includes(t) ||
                            b.scope.toLowerCase().includes(t)
                        )
                      );

                      setAllowlistData(
                        wl.filter(
                          (w) =>
                            w.type.toLowerCase().includes(t) ||
                            w.value.toLowerCase().includes(t) ||
                            w.scope.toLowerCase().includes(t)
                        )
                      );
                    } else {
                      setBlocklistData(bl);
                      setAllowlistData(wl);
                    }
                  }}
                />
                <DropDownContainer />
              </HorizontalContainer>
              <Button
                style={{ backgroundColor: "#2173FF", marginRight: 30 }}
                onClick={() => {
                  navigate(ADD_NEW_BLOCK_ALLOW_LIST_PATH, {
                    state: {
                      list: manageStoreBeforePush(),
                    },
                  });
                  navigate(0); // Refresh the page. TODO: Change the way to update the filter.
                }}
              >
                + Add New
              </Button>
            </HorizontalContainer>
            <StyledUl style={{ marginTop: 10 }}>
              <ListTab isBlocklist isSelected={listType === listTypes.blocklist} />
              <HorizontalSpace />
              <ListTab isBlocklist={false} isSelected={listType === listTypes.allowlist} />
            </StyledUl>
            <div style={{ padding: "10px 50px 50px 30px", overflowX: "scroll" }}>
              {(isBlockList() && blocklistData.length > 0) || (!isBlockList() && allowlistData.length > 0) ? (
                <DataList />
              ) : (
                <Title style={{ margin: 30, marginLeft: 50, textAlign: "center" }}>
                  {isLoading ? "Loading..." : organisation === "all" ? "Please select an organization" : "No list available!"}
                </Title>
              )}
            </div>
          </BackgroundBox>
          <HorizontalSpace style={{ marginTop: 50 }} />
        </StyledContainer>
      </StyledMainDiv>
    </Layout>
  );
};

export default BlockAllowList;
