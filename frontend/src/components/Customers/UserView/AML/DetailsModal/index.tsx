import { useMemo } from "react";
import { AmlPostalAddress, CustomersResponse, AnyTodo } from "sardine-dashboard-typescript-definitions";
import { Tabs, Tab, Modal } from "react-bootstrap";
import Badge from "components/Common/Badge";
import Highlighter from "react-highlight-words";
import { extractStreetWords } from "utils/customerSessionUtils";
import { Table } from "./DetailsTable";
import { DataTable, DataColumn } from "../../../../Common/DataTable";
import { Sections } from "../AMLSection";
import { DetailsHeaderTile } from "../../../styles";
import { Entity } from "../types";
import { Attribute } from "./Attribute";
import { ListItemSepByComa } from "../../../../../styles/List";
import { NameHighlighter } from "../Highlighters/NameHighlighter";
import { mapStateByCode } from "../Highlighters/AddressHighlighter/mapStateByCode";

const renderList = <T extends unknown>(list: T[], render: (entity: T) => AnyTodo) => {
  if (list.length === 0) {
    return "";
  }

  return list.map((li) => <ListItemSepByComa>{render(li)}</ListItemSepByComa>);
};

interface IModal {
  show: boolean;
  onClose: () => void;
  entity: Entity["originalEntity"];
  customerData: CustomersResponse;
}

const renderAddress = (address: string, matchWords: string[]) => {
  if (!address) return null;
  return <Highlighter searchWords={matchWords} textToHighlight={address} />;
};

export const DetailsModal = ({ show, onClose, entity, customerData }: IModal): JSX.Element | null => {
  if (!entity) {
    return null;
  }

  const { address_fields_list } = customerData;
  let regionCode = "";
  let postalCode = "";
  let cityName = "";
  let countryCode = "";
  if (address_fields_list.length > 0) {
    const { region_code, postal_code, city, country_code } = address_fields_list[0];
    regionCode = region_code;
    postalCode = postal_code;
    cityName = city;
    countryCode = country_code;
  }
  const stateFromRegionCode = mapStateByCode[regionCode];

  const parsedSections = useMemo(() => {
    const sections: Sections[] = [
      {
        name: "Attributes",
        key: "ATTRIBUTES",
        attributes: [
          {
            key: "Alias Names",
            value: renderList(entity.alias, (alias) => <NameHighlighter customerData={customerData} value={alias.name} />),
            description: "",
          },
          {
            key: "Birth Dates",
            value: renderList(entity.birthdates, (birthdate) => (
              <NameHighlighter customerData={customerData} value={birthdate} />
            )),
            description: "",
          },
          {
            key: "Entity Name",
            value: <NameHighlighter customerData={customerData} value={entity.entity_name} />,
            description: "",
          },
          { key: "Match Score", value: (entity.match_score || 0).toString(), description: "" },
        ],
      },
      {
        name: "Sanction List",
        key: 1,
      },
      {
        name: "PEP (Politically Exposed Person)",
        key: 2,
      },
      {
        name: "Adverse Media",
        key: 3,
      },
    ]
      .concat(
        entity.postal_addresses && [
          {
            name: "Addresses",
            key: 9,
          },
        ]
      )
      .filter((s) => !!s);

    const signals = (entity.signals || []).filter((s) => !!s);

    sections.forEach((section, index) => {
      signals.forEach((signal) => {
        if (!(signal.key === section.key)) {
          return;
        }

        sections[index].level = signal.value;
        sections[index].sources = signal.sources;
      });
    });

    return sections;
  }, [entity]);

  const initialSectionSectionKey = useMemo(() => {
    if (!parsedSections || parsedSections.length === 0) return "";
    const sectionWithLevelMediumHigh = parsedSections.find((s) => s.level === "medium" || s.level === "high");
    if (sectionWithLevelMediumHigh) return sectionWithLevelMediumHigh.name;
    return parsedSections[0].name;
  }, [parsedSections]);

  const addresses = entity?.postal_addresses || [];
  const streetWords = extractStreetWords(customerData);
  const tableColumns: DataColumn<AmlPostalAddress>[] = [
    {
      title: "Type",
      field: "type",
      render: (data: AmlPostalAddress) => data.type,
    },
    {
      title: "Address Line",
      field: "line1",
      render: (data: AmlPostalAddress) => renderAddress(data.line1, streetWords),
    },
    {
      title: "City",
      field: "city",
      render: (data: AmlPostalAddress) => renderAddress(data.city, [cityName]),
    },
    {
      title: "State",
      field: "state",
      render: (data: AmlPostalAddress) => renderAddress(data.state, [stateFromRegionCode]),
    },
    {
      title: "Country Code",
      field: "country_code",
      render: (data: AmlPostalAddress) => renderAddress(data.country_code, [countryCode]),
    },
    {
      title: "Postal Code",
      field: "postal_code",
      render: (data: AmlPostalAddress) => renderAddress(data.postal_code, [postalCode]),
    },
  ];

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>AML - Entity "{entity.entity_name}"</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Tabs id="aml_tabs" defaultActiveKey={initialSectionSectionKey} title="sanction">
          {parsedSections.map(({ name, level, sources, attributes }) => (
            <Tab
              id={`tab_${name}`}
              eventKey={name}
              key={name}
              title={<DetailsHeaderTile style={{ fontWeight: 600, color: "var(--dark-14)" }}>{name}</DetailsHeaderTile>}
            >
              <div className="flex mt-3">
                {level && (
                  <>
                    <b>Risk level</b> <Badge title={level} />{" "}
                  </>
                )}
                {level !== "low" && !attributes && <Table sources={sources} />}
                {attributes && attributes.map((a) => <Attribute attribute={a} />)}

                {name.toLowerCase() === "addresses" && addresses.length > 0 && (
                  <DataTable
                    title=""
                    columns={tableColumns}
                    data={addresses}
                    options={{ grouping: false, paging: false }}
                    components={{
                      Toolbar: () => null,
                    }}
                  />
                )}
              </div>
            </Tab>
          ))}
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};
