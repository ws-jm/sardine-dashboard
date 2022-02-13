import React, { memo } from "react";
import { Card, Badge, Tooltip, OverlayTrigger } from "react-bootstrap";
import { Position, Handle, FlowElement } from "react-flow-renderer";
import { UserProfilePic, UserCard } from "../styles";
import imgUser from "../../../utils/logo/user.png";

export const UserNode = memo((node: FlowElement) => {
  const name = node.data.value;
  const { index } = node.data;

  return (
    <>
      <UserCard>
        <UserProfilePic>
          <img alt="" src={imgUser} style={{ width: "90%" }} />
        </UserProfilePic>
        <div style={{ margin: 10, fontWeight: "bold", textAlign: "center" }}>User Id Hash</div>
        <div style={{ margin: 10, width: "-webkit-fill-available", textAlign: "center" }}>{name}</div>
      </UserCard>
      <Handle
        type="source"
        position={index === -1 ? Position.Right : Position.Left}
        id="a"
        style={{ top: 50, background: "#555" }}
      />
    </>
  );
});

export const ParentNode = memo((node: FlowElement) => {
  const name = node.data.label;
  const val = node.data.value;
  const { count } = node.data;

  return (
    <>
      <Handle type="source" position={Position.Left} id="a" style={{ top: 50, background: "#555" }} />
      <UserCard>
        <Card.Header
          style={{
            width: "100%",
            display: "flex",
            color: "var(--dark-14)",
            justifyContent: "center",
            alignItems: "center",
            textTransform: ["os", "ip"].includes(name) ? "uppercase" : "capitalize",
          }}
        >
          <Card.Text style={{ fontWeight: "bold", textAlign: "center", marginTop: 15, marginRight: 10 }}>{name}</Card.Text>
          <Badge pill bg="danger">
            {count}
          </Badge>
        </Card.Header>
        {val.length > 0 ? <Card.Text style={{ margin: 10, textAlign: "center" }}>{val}</Card.Text> : null}
      </UserCard>
      <Handle type="source" position={Position.Right} id="a" style={{ top: 50, background: "#555" }} />
    </>
  );
});

export const ChildNode = memo((node: FlowElement) => {
  const name = node.data.label;
  const val = node.data.value;

  return (
    <>
      <Handle type="source" position={Position.Left} id="a" style={{ top: 20, background: "#555" }} />
      <OverlayTrigger key="top" placement="top" overlay={<Tooltip id="tooltip-top">Value: {val}</Tooltip>}>
        <UserCard>
          <Card.Text style={{ margin: 10, textAlign: "center" }}>{name}</Card.Text>
        </UserCard>
      </OverlayTrigger>
    </>
  );
});
