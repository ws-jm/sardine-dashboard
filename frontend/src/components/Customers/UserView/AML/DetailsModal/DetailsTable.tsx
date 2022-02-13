import { ReadmoreCell } from "components/ReadmoreCell";
import { Cell, StyledTable, BaseStyledTr } from "../../../styles";
import { Link } from "../../../../Common/Links";
import { StyledTh } from "../styles";
import { Sections } from "../AMLSection";

const tableHeaders = ["Name", "Description"].map((ele, index) => (
  <StyledTh index={index} key={ele}>
    {ele}
  </StyledTh>
));

export const Table = ({ sources }: Pick<Sections, "sources">): JSX.Element | null => {
  if (!sources) {
    return null;
  }

  return (
    <StyledTable className="mt-4">
      <thead>
        <tr>{tableHeaders}</tr>
      </thead>
      <tbody>
        {sources.map(({ description, name, url, category, sub_category }) => (
          <BaseStyledTr key={`${category}_${sub_category}_${name}_${description}_${url}`}>
            <Cell>
              <Link href={url}>{name}</Link>
            </Cell>
            <Cell style={{ maxWidth: "1px" }}>
              <ReadmoreCell text={description} />
            </Cell>
          </BaseStyledTr>
        ))}
      </tbody>
    </StyledTable>
  );
};
