import { useState, useRef, useEffect } from "react";
import { AnyTodo } from "sardine-dashboard-typescript-definitions";
import styled from "styled-components";
import { FormControl } from "react-bootstrap";
import { useCookies } from "react-cookie";
import { selectIsAdmin, useUserStore } from "store/user";
import DropwdownItem from "./DropdownItem";
import DropdownButton from "./DropdownButton";
import { fetchOrganisationNames } from "../../utils/api";
import { captureException } from "../../utils/errorUtils";
import { replaceAllSpacesWithUnderscores } from "../../utils/stringUtils";
import { DEFAULT_ORGANISATION_FOR_SUPERUSER } from "../../config";

const StyledDropdown = styled.div`
  z-index: 10;
  height: 40px;
  margin-left: 20px;
`;

const StyledDropdownItems = styled.div`
  padding: 8px;
  background: #ffffff;
  z-index: 12;
  top: 0;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.02);
  max-height: 400px;
  overflow-y: scroll;
`;

const Dropdown = (props: AnyTodo) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [cookies, setCookie] = useCookies(["organization"]);

  const [open, setOpen] = useState(false);

  const { organisationFromUserStore, isAdmin } = useUserStore((state: AnyTodo) => {
    const { organisation } = state;
    return { organisationFromUserStore: organisation, isAdmin: selectIsAdmin(state) };
  });
  const [selectedIndex, setSelectedIndex] = useState(cookies.organization || organisationFromUserStore);
  const [organisations, setOrganisations] = useState([
    { option: cookies.organization || (isAdmin ? DEFAULT_ORGANISATION_FOR_SUPERUSER : organisationFromUserStore) },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [organisationSearch, setOrganisationSearch] = useState("");

  const handleClick = (e: AnyTodo) => {
    if (dropdownRef && dropdownRef.current && dropdownRef.current.contains(e.target)) {
    } else {
      setOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);

    if (organisations.length === 1 && !isLoading) {
      setIsLoading(true);
      fetchOrganisationNames()
        .then((data) => {
          setOrganisations(data.map((i: AnyTodo) => ({ option: i.name })));
        })
        .catch((e) => captureException(e));
    }

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [organisations, isLoading]);

  const activeData = organisations.find((i) => i.option === selectedIndex);

  const setOrganisationIndex = (org: AnyTodo) => {
    if (org && selectedIndex !== org) {
      setSelectedIndex(org);
    }
  };

  return (
    <>
      {props.organisation ? setOrganisationIndex(props.organisation) : null}
      {open ? (
        <StyledDropdown ref={dropdownRef}>
          <StyledDropdownItems>
            <FormControl
              type="text"
              value={organisationSearch}
              placeholder="Search here"
              style={{ height: 30 }}
              onChange={(event) => {
                setOrganisationSearch(event.target.value);
              }}
            />
            {organisations
              .filter((org) => org.option.toLowerCase().includes(organisationSearch.toLowerCase()))
              .map((ele) => (
                <DropwdownItem
                  clicked={() => {
                    setSelectedIndex(ele.option);
                    setOpen(false);
                    props.changeOrganisation(ele.option);

                    setCookie("organization", ele.option);
                  }}
                  key={ele.option}
                  item={ele}
                  isSelected={ele.option === selectedIndex}
                  id={`dropdown_item_org_${replaceAllSpacesWithUnderscores(ele.option)}`}
                />
              ))}
          </StyledDropdownItems>
        </StyledDropdown>
      ) : (
        <DropdownButton clicked={() => setOpen(true)} item={activeData} title="Organization" id="dropdown_button_org" />
      )}
    </>
  );
};

export default Dropdown;
