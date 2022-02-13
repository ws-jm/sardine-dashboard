import { useEffect, useState } from "react";
import { selectIsSuperAdmin, useUserStore } from "store/user";
import Layout from "../Layout/Main";
import { getMetabaseTokenForRelayDashboard } from "../../utils/api";
import { captureException } from "../../utils/errorUtils";

const RelayDashboard: React.FC = () => {
  const [metabaseURL, setMetabaseURL] = useState(null);
  const { organisation, isSuperAdmin } = useUserStore((state) => {
    const { organisation } = state;
    return {
      organisation: organisation || "all",
      isSuperAdmin: selectIsSuperAdmin(state),
    };
  });

  useEffect(() => {
    if (!metabaseURL) {
      getMetabaseTokenForRelayDashboard()
        .then(({ url }) => setMetabaseURL(url))
        .catch((e) => captureException(e));
    }
  }, [organisation, metabaseURL, isSuperAdmin]);

  if (!isSuperAdmin && organisation !== "relayfi") {
    return null;
  }

  if (!metabaseURL) {
    return null;
  }

  return (
    <Layout>
      <iframe src={metabaseURL} frameBorder="0" width="800" height="600" allowTransparency title="metabase" />
    </Layout>
  );
};

export default RelayDashboard;
