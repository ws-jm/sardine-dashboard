import React, { useState, useEffect } from "react";
import ReactFlow, { Elements, Position, OnLoadParams } from "react-flow-renderer";
import { AnyTodo } from "sardine-dashboard-typescript-definitions";
import { replaceAllUnderscoresWithSpaces } from "utils/stringUtils";
import { UserNode, ParentNode, ChildNode } from "./CustomNodes";
import { fetchUserAggregations } from "../../../utils/api";
import { captureException } from "../../../utils/errorUtils";

const onLoad = (reactFlowInstance: OnLoadParams) => reactFlowInstance.fitView();
const maxWidth = 210;

const defaultStyle = {
  width: maxWidth,
  fontFamily: "IBM Plex Sans",
  fontSize: 15,
};

interface IProps {
  clientId: string;
  organisation: string;
  userId: string;
}

interface INodeProps {
  id: string;
  title: string;
  value: string;
  items: INodeProps[];
}

let chartData: INodeProps[] = [];

const nodeTypes = {
  selectorNode: UserNode,
  parentNode: ParentNode,
  childNode: ChildNode,
};

const features = ["referrer_set", "device_id_set", "os_set", "ip_address_set"];

const UserNetwork = (p: IProps): JSX.Element => {
  const animationDuration = 1000;
  const [elements, setElements] = useState<Elements>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(p.userId);

  let flowData: Elements = [
    {
      id: "user_data",
      sourcePosition: Position.Right,
      type: "selectorNode",
      className: "dark-node",
      data: { value: userId, index: -1 },
      position: { x: 0, y: 0 },
      style: defaultStyle,
    },
  ];

  useEffect(() => {
    async function startLoading() {
      if (userId.length > 0) {
        const { organisation, clientId } = p;
        setIsLoading(true);
        const { result } = await fetchUserAggregations({
          clientId,
          organisation,
          userId,
        });

        setIsLoading(false);

        if (result) {
          if (Object.entries(result).length > 0) {
            chartData = [];
            Object.entries(result).forEach((d) => {
              if (features.includes(d[0])) {
                chartData.push({
                  id: d[0],
                  title: replaceAllUnderscoresWithSpaces(d[0]),
                  value: Array.isArray(d[1]) ? "" : `${d[1]}`,
                  items: Array.isArray(d[1])
                    ? Object.entries(d[1] as AnyTodo)
                        .map((val) => ({
                          id: val[0],
                          title: `${val[1]}`,
                          value: Array.isArray(val[1]) ? `${JSON.stringify(val[1])}` : `${val[1]}`,
                          items: Array.isArray(val[1])
                            ? Object.entries(val[1] as AnyTodo)
                                .map((sval) => ({
                                  id: sval[0],
                                  title: `${sval[1]}`,
                                  value: Array.isArray(sval[1])
                                    ? Object.entries(sval[1] as AnyTodo)
                                        .map((e) => e[0])
                                        .join(",")
                                    : `${sval[1]}`,
                                  items: [],
                                }))
                                .filter((i) => i.id.length > 0)
                            : [],
                        }))
                        .filter((i) => i.id.length > 0)
                    : [],
                });
              }
            });

            chartData = chartData.filter((i) => i.id.length > 0 && i.items.length > 0);
            chartData.sort((a, b) => a.id.localeCompare(b.id));
          }
        }

        setElements(flowData);
        if (chartData.length > 0) {
          loadParentNodes(0);
        }
      }
    }

    if (!isLoaded) {
      startLoading().catch(captureException);
      setIsLoaded(true);
    }
  }, [isLoaded]);

  const loadParentNodes = (index: number) => {
    const r = chartData[index];

    if (r.items.length === 0) {
      if (chartData.length > index + 1) {
        loadParentNodes(index + 1);
      }
      return;
    }

    let ind = index;
    if (index > 0) {
      chartData.forEach((d, i) => {
        if (i < index) {
          ind += d.items.length;
        }
      });
    }

    flowData = [
      ...flowData,
      {
        id: r.id,
        sourcePosition: Position.Left,
        targetPosition: Position.Right,
        type: "parentNode",
        data: { label: r.title, index, value: r.value, count: r.items.length },
        position: { x: 300, y: ind * 80 },
        style: defaultStyle,
      },
      {
        id: `horizontal-${r.id}`,
        source: "user_data",
        type: "smoothstep",
        target: r.id,
        data: {},
        animated: true,
      },
    ];

    setTimeout(() => {
      setElements(flowData);
      if (chartData.length > index) {
        loadChildNodes(index, 0);
      }
    }, animationDuration / chartData.length);
  };

  const loadChildNodes = (pIndex: number, index: number) => {
    if (chartData[pIndex].items.length === 0) {
      if (chartData.length > pIndex + 1) {
        loadParentNodes(pIndex + 1);
      }
      return;
    }

    const r = chartData[pIndex];
    const sr = r.items[index];

    let ind = index + pIndex;
    if (pIndex > 0) {
      chartData.forEach((d, i) => {
        if (i < pIndex) {
          ind += d.items.length;
        }
      });
    }

    flowData = [
      ...flowData,
      {
        id: `${r.id}-${sr.id}`,
        sourcePosition: Position.Left,
        targetPosition: Position.Right,
        type: "childNode",
        data: { label: sr.title, parent: r.title, value: sr.value },
        position: { x: 800, y: ind * 80 },
        style: { ...defaultStyle, borderColor: "lightgrey" },
      },
      {
        id: `${r.id}-${sr.id}-${pIndex}-${index}`,
        source: r.id,
        type: "smoothstep",
        target: `${r.id}-${sr.id}`,
        data: {},
        animated: true,
      },
    ];

    setTimeout(() => {
      setElements(flowData);
      if (sr.items.length > 0) {
        loadSubChildNodes(pIndex, index, 0);
      } else if (r.items.length > index + 1) {
        loadChildNodes(pIndex, index + 1);
      } else if (chartData.length > pIndex + 1) {
        loadParentNodes(pIndex + 1);
      }
    }, animationDuration / r.items.length);
  };

  const loadSubChildNodes = (pIndex: number, cIndex: number, index: number) => {
    if (chartData[pIndex].items[cIndex].items.length === 0) {
      if (chartData[pIndex].items.length > cIndex + 1) {
        loadChildNodes(pIndex, cIndex + 1);
      }
      return;
    }

    const par = chartData[pIndex];
    const r = par.items[cIndex];
    const sr = r.items[index];

    let ind = index + cIndex + pIndex;
    if (cIndex > 0) {
      chartData[pIndex].items.forEach((d, i) => {
        if (i < cIndex) {
          ind += d.items.length;
        }
      });
    }
    const handleSelect = () => {
      setUserId(sr.value);
      setTimeout(() => {
        setIsLoaded(false);
      }, 100);
    };

    flowData = [
      ...flowData,
      {
        id: `${r.id}-sub${sr.id}`,
        sourcePosition: Position.Left,
        targetPosition: Position.Right,
        type: "selectorNode",
        data: {
          label: sr.title,
          parent: r.title,
          value: (
            <div
              style={{ color: "#2173FF", textDecoration: "underline" }}
              onKeyPress={handleSelect}
              role="button"
              tabIndex={0}
              onClick={handleSelect}
            >
              {sr.value}
            </div>
          ),
          index,
        },
        position: { x: 1200, y: ind * 80 },
        style: { ...defaultStyle, borderColor: "lightgrey" },
      },
      {
        id: `${r.id}-${sr.id}-${pIndex}-${cIndex}-${index}`,
        source: `${par.id}-${r.id}`,
        type: "smoothstep",
        target: `${r.id}-sub${sr.id}`,
        data: {},
        animated: true,
      },
    ];

    setTimeout(() => {
      setElements(flowData);
      if (r.items.length > index + 1) {
        loadSubChildNodes(pIndex, cIndex, index + 1);
      } else if (chartData[pIndex].items.length > cIndex + 1) {
        loadChildNodes(pIndex, cIndex + 1);
      } else if (chartData.length > pIndex + 1) {
        loadParentNodes(pIndex + 1);
      }
    }, animationDuration / sr.items.length);
  };

  return isLoading ? (
    <div style={{ marginTop: 50, textAlign: "center", fontSize: 20 }}>Loading...</div>
  ) : isLoaded && elements.length < 2 ? (
    <div style={{ marginTop: 50, textAlign: "center" }}>No data found!</div>
  ) : (
    <ReactFlow
      elements={elements}
      onLoad={onLoad}
      selectNodesOnDrag={false}
      nodesConnectable={false}
      nodesDraggable={false}
      nodeTypes={nodeTypes}
      defaultZoom={0.7}
    />
  );
};

export default UserNetwork;
