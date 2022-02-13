import { useMemo } from "react";
import { AnyTodo } from "sardine-dashboard-typescript-definitions";
import { DataColumn, DataTable } from "components/Common/DataTable";
import { HandleInlineError } from "components/Error/InlineGenericError";
import { useQuery as useReactQuery } from "react-query";
import { TableWrapper } from "styles/EntityList";
import { getFeatureFlagsOfOrg } from "utils/api";

const tableColumns: DataColumn<AnyTodo>[] = [
  {
    title: "Status",
    field: "featureStatus",
  },
  {
    title: "Features",
    field: "merchantNames",
    render: ({ merchantNames }) => (
      <ul>
        {merchantNames.map((name: string) => (
          <li>{name}</li>
        ))}
      </ul>
    ),
  },
];

interface AllFlagsTableProps {
  clientID: string;
}
export const FeatureFlagsOfOrgTable = ({ clientID }: AllFlagsTableProps) => {
  const { data, error, isLoading } = useReactQuery("flags", () => getFeatureFlagsOfOrg(clientID));
  const tableData = useMemo(() => {
    if (!data) return [];
    return [
      { featureStatus: "Feature enabled", merchantNames: data.enabledFeatureFlagNames },
      { featureStatus: "Feature not enabled", merchantNames: data.disabledFeatureFlagNames },
    ];
  }, [data]);

  return (
    <TableWrapper>
      <HandleInlineError isError={Boolean(error)}>
        <DataTable columns={tableColumns} data={tableData} title="" isLoading={isLoading} />
      </HandleInlineError>
    </TableWrapper>
  );
};
