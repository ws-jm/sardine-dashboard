import { AnyTodo } from "sardine-dashboard-typescript-definitions";
import { DataColumn, DataTable } from "components/Common/DataTable";
import { HandleInlineError } from "components/Error/InlineGenericError";
import { useQuery as useReactQuery } from "react-query";
import { TableWrapper } from "styles/EntityList";
import { getAllFeatureFlags } from "utils/api";

const tableColumns: DataColumn<AnyTodo>[] = [
  {
    title: "Features",
    field: "featureFlagNames",
  },
  {
    title: "Merchants",
    field: "merchantNames",
    render: ({ merchantNames }) => (
      <ul>
        {merchantNames.map((name: string) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    ),
  },
];
export const AllFlagsTable = () => {
  const { data, error, isLoading } = useReactQuery("flags", () => getAllFeatureFlags());

  return (
    <TableWrapper>
      <HandleInlineError isError={Boolean(error)}>
        <DataTable columns={tableColumns} data={data} title="" isLoading={isLoading} />
      </HandleInlineError>
    </TableWrapper>
  );
};
