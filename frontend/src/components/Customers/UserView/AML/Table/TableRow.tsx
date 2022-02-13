import { StyledTr, Cell } from "components/Table/styles";
import { CustomersResponse, AmlPostalAddress, amlPostalAddressToString } from "sardine-dashboard-typescript-definitions";
import Badge from "../../../../Common/Badge";
import { ListSignalContainer } from "../styles";
import { Entity } from "../types";
import { NameHighlighter } from "../Highlighters/NameHighlighter";
import { DobHighlighter } from "../Highlighters/DobHighlighter";
import { AddressHighlighter } from "../Highlighters/AddressHighlighter";

const renderList = <T extends unknown>(list: T[], render: (entity: T) => JSX.Element, toKey: (item: T) => string) => {
  if (list.length === 0) {
    return "";
  }

  if (list.length === 1) {
    return render(list[0]);
  }

  return (
    <ul>
      {list.map((li) => (
        <li key={toKey(li)}>{render(li)}</li>
      ))}
    </ul>
  );
};

interface AmlListItemProps {
  entity: Entity;
  onEntityView: (entity: Entity) => void;
  customerData: CustomersResponse;
}

export const TableRow = ({ entity, onEntityView, customerData }: AmlListItemProps): JSX.Element | null => {
  const { addresses, aliases, dobs, entityName, matchScore, signals } = entity;
  const filteredSignal = signals.filter((s) => s.level !== "low");

  if (filteredSignal.length === 0) return null;

  return (
    <StyledTr>
      <Cell>
        <NameHighlighter customerData={customerData} value={entityName} />
      </Cell>
      <Cell>{matchScore}</Cell>
      <Cell key="abc">
        {renderList<string>(
          aliases,
          (listitem) => (
            <NameHighlighter customerData={customerData} value={listitem} />
          ),
          (item) => item
        )}
      </Cell>
      <Cell>
        {renderList<AmlPostalAddress>(
          addresses,
          (address) => (
            <AddressHighlighter customerData={customerData} value={address} />
          ),
          (address) => amlPostalAddressToString(address)
        )}
      </Cell>
      <Cell>
        {renderList<string>(
          dobs,
          (dob) => (
            <DobHighlighter customerData={customerData} value={dob} />
          ),
          (item) => item
        )}
      </Cell>
      <Cell>
        <ul>
          {filteredSignal.map((signal) => (
            <ListSignalContainer key={signal.name}>
              {signal.name}: <Badge title={signal.level} />
            </ListSignalContainer>
          ))}
        </ul>
      </Cell>
      <Cell>
        <button type="button" onClick={() => onEntityView(entity)} className="btn btn-outline-primary">
          View details
        </button>
      </Cell>
    </StyledTr>
  );
};
