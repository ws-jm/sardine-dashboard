/* eslint-disable react/jsx-props-no-spreading */
import React, { useState, useEffect } from "react";
import { H40Button } from "components/Button";
import * as Sentry from "@sentry/react";
import { AnyTodo } from "sardine-dashboard-typescript-definitions";
import { getWebhooks, updateWebhook, deleteWebhook } from "../../utils/api";
import { DataTable, DataColumnSimple, ToolBarWrapper } from "../Common/DataTable";
import { StyledMainDiv, TableWrapper } from "../FraudScore/styles";
import { StyledTitleName } from "../Dashboard/styles";
import { ToolbarContainer } from "./styles";
import Layout from "../Layout/Main";
import AddPopup from "./AddPopup";

interface WebhooksRow {
  id: string;
  name: string;
  client_id: string;
  type: string;
  url: string;
  secret: string;
}

const WebhooksList: React.FC = () => {
  const tableColumns: DataColumnSimple[] = [
    {
      title: "ID",
      field: "id",
      type: "numeric",
      editable: "never",
    },
    {
      title: "Name",
      field: "name",
      editable: "never",
    },
    {
      title: "Client ID",
      field: "client_id",
      editable: "never",
    },
    {
      title: "Webhook Type",
      field: "type",
      editable: "never",
    },
    {
      title: "Webhook URL",
      field: "url",
    },
    {
      title: "Secret Key",
      field: "secret",
      editable: "never",
    },
  ];

  const [data, setData] = useState<WebhooksRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [showpopup, setShowpopup] = useState(false);

  const getData = async () => {
    setLoading(true);
    setData([]);
    const res = await getWebhooks();
    setLoading(false);
    setData(res.result);
  };

  useEffect(() => {
    getData()
      .then()
      .catch((err) => Sentry.captureException(err));
  }, []);

  const OnRowUpdate = (newData: WebhooksRow, oldData: WebhooksRow) =>
    new Promise<void>((resolve, reject) => {
      updateWebhook(oldData.id, {
        organisation: newData.name,
        url: newData.url,
      })
        .then(() => {
          getData()
            .then()
            .catch((err) => Sentry.captureException(err));
          resolve();
        })
        .catch(() => {
          reject();
        });
    });

  const OnRowDelete = (oldData: WebhooksRow) =>
    new Promise<void>((resolve, reject) => {
      deleteWebhook(oldData.id.toString())
        .then(() => {
          getData()
            .then()
            .catch((err) => Sentry.captureException(err));
          resolve();
        })
        .catch(() => {
          reject();
        });
    });

  return (
    <Layout>
      <StyledMainDiv>
        <AddPopup
          show={showpopup}
          handleClose={() => setShowpopup(false)}
          handleSuccess={() => {
            getData()
              .then()
              .catch((err) => Sentry.captureException(err));
            setShowpopup(false);
          }}
        />
        <TableWrapper>
          <DataTable
            columns={tableColumns}
            data={data}
            isLoading={loading}
            title=""
            editable={{
              onRowUpdate: OnRowUpdate,
              onRowDelete: OnRowDelete,
            }}
            components={{
              Toolbar: ({ data, title }: { data: AnyTodo; title: string }) => (
                <ToolbarContainer>
                  <StyledTitleName> Webhook URLs </StyledTitleName>
                  <ToolbarContainer>
                    <ToolBarWrapper data={data} title={title} />
                    <H40Button style={{ marginLeft: 20 }} onClick={() => setShowpopup(true)}>
                      Add New
                    </H40Button>
                  </ToolbarContainer>
                </ToolbarContainer>
              ),
            }}
          />
        </TableWrapper>
      </StyledMainDiv>
    </Layout>
  );
};

export default WebhooksList;

export const WEBHOOK_PATH = "/webhooks";
