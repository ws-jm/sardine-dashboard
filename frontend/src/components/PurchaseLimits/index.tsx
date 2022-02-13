/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable react/jsx-props-no-spreading */
import { useState, useEffect } from "react";
import * as Sentry from "@sentry/react";
import { AnyTodo, SARDINE_ADMIN } from "sardine-dashboard-typescript-definitions";
import { useCookies } from "react-cookie";
import { useUserStore } from "store/user";
import { addPurchaseLimit, deletePurchaseLimit, getPurchaseLimit, updatePurchaseLimit } from "../../utils/api";
import { DataTable, DataColumnSimple, ToolBarWithTitle } from "../Common/DataTable";
import { StyledMainDiv, TableWrapper } from "../FraudScore/styles";
import { StyledDropdownDiv, StyledNavTitle, StyledStickyNav, StyledTitleName } from "../Dashboard/styles";
import OrganisationDropDown from "../Dropdown/OrganisationDropDown";
import Layout from "../Layout/Main";

interface PurchaseLimitRow {
  id: number;
  customer_risk_level: string;
  daily_limit_usd: number;
  weekly_limit_usd: number;
  monthly_limit_usd: number;
  client_id: string;
  hold_days: number;
  instant_limit_usd: number;
  min_amount: number;
  max_amount: number;
}

const PurchaseLimitList = () => {
  const [cookies] = useCookies(["organization"]);

  const { organisation, role, setUser } = useUserStore(({ organisation, role, setUser }) => ({
    organisation: cookies.organization || organisation || "all",
    role,
    setUser,
  }));

  const changeOrganisation = (organisation: string) => {
    setUser({ organisation });
  };

  const [isLoading, setLoading] = useState(false);
  const [data, setData] = useState<PurchaseLimitRow[]>([]);

  const getData = async () => {
    setLoading(true);
    setData([]);
    const res = await getPurchaseLimit(organisation);
    setLoading(false);
    setData(res.result);
  };

  useEffect(() => {
    getData().catch((err) => Sentry.captureException(err));
  }, []);

  const OnRowUpdate = (newData: PurchaseLimitRow) =>
    new Promise<void>((resolve, reject) => {
      updatePurchaseLimit(organisation, newData)
        .then(() => {
          getData()
            .then(resolve)
            .catch((err) => Sentry.captureException(err));
        })
        .catch(reject);
    });

  const OnRowDelete = (oldData: PurchaseLimitRow) =>
    new Promise<void>((resolve, reject) => {
      deletePurchaseLimit(oldData.id.toString())
        .then(() => {
          getData()
            .then(resolve)
            .catch((err) => Sentry.captureException(err));
        })
        .catch(reject);
    });

  const OnRowAdd = (newData: PurchaseLimitRow) =>
    new Promise<void>((resolve, reject) => {
      addPurchaseLimit(organisation, newData)
        .then((resolve) => {
          getData()
            .then(resolve)
            .catch((err) => Sentry.captureException(err));
        })
        .catch((r) => {
          reject();
        });
    });

  const tableColumns: DataColumnSimple[] = [
    {
      title: "ID",
      field: "id",
      type: "numeric",
      editable: "never",
    },
    {
      title: "Customer Risk Level",
      field: "customer_risk_level",
    },
    {
      title: "Daily Limit USD",
      field: "daily_limit_usd",
      type: "numeric",
    },
    {
      title: "Weekly Limit USD",
      field: "weekly_limit_usd",
      type: "numeric",
    },
    {
      title: "Monthly Limit USD",
      field: "monthly_limit_usd",
      type: "numeric",
    },
    {
      title: "Client ID",
      field: "client_id",
      editable: "never",
    },
    {
      title: "Hold Days",
      field: "hold_days",
      type: "numeric",
    },
    {
      title: "Instant Limit USD",
      field: "instant_limit_usd",
      type: "numeric",
    },
    {
      title: "Min Amount",
      field: "min_amount",
      type: "numeric",
    },
    {
      title: "Max Amount",
      field: "max_amount",
      type: "numeric",
    },
  ];

  return (
    <Layout>
      <StyledMainDiv>
        <StyledStickyNav id="device-info" style={{ width: "inherit", marginBottom: 10 }}>
          <StyledNavTitle style={{ width: "100%" }}>
            <StyledTitleName> Purchase Limit</StyledTitleName>
            <StyledDropdownDiv style={{ marginRight: "50px" }}>
              {role === SARDINE_ADMIN ? (
                <div style={{ zIndex: 20 }}>
                  <OrganisationDropDown organisation={organisation} changeOrganisation={changeOrganisation} />
                </div>
              ) : null}
            </StyledDropdownDiv>
          </StyledNavTitle>
        </StyledStickyNav>
        <TableWrapper>
          <DataTable
            columns={tableColumns}
            data={data}
            isLoading={isLoading}
            title=""
            editable={{
              onRowAdd: OnRowAdd,
              onRowUpdate: OnRowUpdate,
              onRowDelete: OnRowDelete,
            }}
            components={{
              Toolbar: ({ data: tableData }: { data: AnyTodo }) => <ToolBarWithTitle title="Purchase Limit" data={tableData} />,
            }}
          />
        </TableWrapper>
      </StyledMainDiv>
    </Layout>
  );
};

export default PurchaseLimitList;
