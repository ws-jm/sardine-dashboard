import { RuleExpression } from "sardine-dashboard-typescript-definitions";
import { SortableElement, SortableHandle } from "react-sortable-hoc";
import styled from "styled-components";
import { StyledTr, Title } from "./styles";

const DragHandle = SortableHandle(() => (
  <Title className="rule-drag-handle" id="rule_drag_handle" style={{ marginTop: 10, textAlign: "center" }}>
    ::
  </Title>
));

export const Cell = styled.td`
  vertical-align: middle;
  min-height: 25px;
  padding: 8px 8px;
  font-family: IBM Plex Sans;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: 18px;
  letter-spacing: 0em;
  text-align: left;
`;

export const RuleName = styled(Cell)`
  color: #2173ff;
  text-decoration: underline;
  font-weight: 500;
`;

const Row = ({
  ruleExpression,
  onClick,
  isSorting,
}: {
  ruleExpression: RuleExpression;
  onClick: () => void;
  isSorting: boolean;
}) => {
  const { action, id, name, condition, env } = ruleExpression;
  const actions = (action || []).tags || [];
  const nameLoDashSpace = name.replace(/\s/g, "_");
  const ruleIdId = `rule_id_${nameLoDashSpace}`;
  const ruleNameId = `rule_name_${nameLoDashSpace}`;
  const ruleConditionId = `rule_condition_${nameLoDashSpace}`;
  const ruleActionId = `rule_action_${nameLoDashSpace}`;
  const ruleEnvId = `rule_env_${nameLoDashSpace}`;
  return (
    <StyledTr>
      <RuleName className="rule-id" id={ruleIdId} data-tid={ruleIdId} key={ruleIdId} onClick={onClick}>
        {id}
      </RuleName>
      <RuleName className="rule-name" id={ruleNameId} data-tid={ruleNameId} key={ruleNameId} onClick={onClick}>
        {name}
      </RuleName>
      <Cell
        className="rule-condition"
        id={ruleConditionId}
        data-tid={ruleConditionId}
        key={ruleConditionId}
        style={{ lineBreak: "anywhere" }}
      >
        {condition}
      </Cell>
      <Cell className="rule-action" id={ruleActionId} key={ruleActionId} data-tid={ruleActionId}>
        {actions.map((a) => (
          <div key={`${ruleActionId}_${a.key}_${a.value}_${a.actionType}`}>
            {a.key}={a.value}
          </div>
        ))}
      </Cell>
      <Cell className="rule-env" id={ruleEnvId} data-tid={ruleEnvId}>
        {env}
      </Cell>
      {isSorting ? <DragHandle /> : null}
    </StyledTr>
  );
};

export const SortableItem = SortableElement(({ ruleExpression }: { ruleExpression: RuleExpression }) => (
  <Row ruleExpression={ruleExpression} onClick={() => {}} isSorting />
));

export const RuleItem = (props: { ruleExpression: RuleExpression; onClick: () => void }) => {
  const { ruleExpression, onClick } = props;
  return <Row ruleExpression={ruleExpression} onClick={onClick} isSorting={false} />;
};
