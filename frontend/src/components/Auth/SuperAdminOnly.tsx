import { selectIsSuperAdmin, useUserStore } from "store/user";

export const SuperAdminOnly = ({ element }: { element: JSX.Element }): JSX.Element | null => {
  const isSuperAdmin = useUserStore(selectIsSuperAdmin);

  if (!isSuperAdmin) return <div>Unauthorized</div>;
  return element;
};
