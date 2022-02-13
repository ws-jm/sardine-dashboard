import React from "react";
import ReactJson, { ReactJsonViewProps } from "react-json-view";
import { get } from "lodash-es";
import { AnyTodo } from "sardine-dashboard-typescript-definitions";
import { JSONViewerContainer } from "./jsonViewerStyles";

const JSONViewer: React.ComponentType<ReactJsonViewProps> = (props) => (
  <JSONViewerContainer>
    <ReactJson displayObjectSize={false} name={null} collapsed={false} displayDataTypes={false} {...props} />
  </JSONViewerContainer>
);

export const createJSONCell = (field: string) =>
  function (rowData: AnyTodo) {
    const data = get(rowData, field);

    if (Array.isArray(data)) {
      return <JSONViewer src={data} />;
    }

    if (typeof data === "string") {
      try {
        const parsedData = JSON.parse(data);

        return <JSONViewer src={parsedData} />;
      } catch (error) {
        console.error({
          message: "cant parse json string",
          error,
          field,
          data,
          rowData,
        });
      }
    }
  };
