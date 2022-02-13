import { StyleCircularBadge } from "../Customers/styles";
import riskLevelIcon from "../../utils/logo/risk_level.svg";

interface IProps {
  risk_level: string;
}

const CircularRiskLevel: React.FC<IProps> = ({ risk_level }) => {
  return (
    <StyleCircularBadge>
      <img src={riskLevelIcon} />
      <div>
        <div id="session_level">{risk_level}</div>
        <div id="session_level_label">Risk Level</div>
      </div>
    </StyleCircularBadge>
  );
};

export default CircularRiskLevel;
