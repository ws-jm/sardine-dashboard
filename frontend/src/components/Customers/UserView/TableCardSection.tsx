import { CustomersResponse } from "sardine-dashboard-typescript-definitions";
import { TableCard, TableCardData, isTableCardCustomerData, isTableCardComponentData, isTableCardListData } from "./TableCard";
import { TableCardWrapper } from "./TableCardWrapper";

export const TableCardSection = ({
  data,
  customerData,
}: {
  data: TableCardData;
  customerData?: CustomersResponse;
}): JSX.Element | null => {
  if (isTableCardCustomerData(data)) {
    return <TableCard customerData={customerData} value={data.value} name={data.key} />;
  }
  if (isTableCardComponentData(data) || isTableCardListData(data)) {
    return (
      <TableCardWrapper headerLabel={data.key} cardKey={data.key} cardBodyStyle={{}}>
        {data.component}
      </TableCardWrapper>
    );
  }
  return null;
};
