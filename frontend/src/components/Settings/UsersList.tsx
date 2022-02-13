import { useState, useEffect } from "react";
import { getSuccessResult, isFailure, OrganizationUser } from "sardine-dashboard-typescript-definitions";

import { useUserStore } from "store/user";
import { TableWrapper } from "../Admin/styles";
import { DataTable } from "../Common/DataTable";
import { getOrganizationUsers } from "../../utils/api";
import { captureException, captureFailure } from "../../utils/errorUtils";

const UsersList = (): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<Array<OrganizationUser>>([]);
  const organisation = useUserStore(({ organisation }) => organisation);
  const columnsData = [
    {
      title: "Name",
      field: "name",
      grouping: false,
    },
    {
      title: "Email",
      field: "email",
      grouping: false,
    },
  ];

  useEffect(() => {
    async function fetchUsers() {
      setIsLoading(true);
      try {
        const res = await getOrganizationUsers(organisation);
        if (isFailure(res)) {
          captureFailure(res);
          return;
        }
        const u = getSuccessResult(res);
        setUsers(u);
      } catch (e) {
        captureException(e);
      }
      setIsLoading(false);
    }
    fetchUsers().then().catch(captureException);
  }, []);

  return (
    <TableWrapper>
      <DataTable
        columns={columnsData}
        data={users}
        title=""
        isLoading={isLoading}
        options={{
          grouping: false,
          exportAllData: false,
          sorting: false,
          paging: false,
        }}
        components={{
          Toolbar: () => null,
        }}
      />
    </TableWrapper>
  );
};

export default UsersList;
