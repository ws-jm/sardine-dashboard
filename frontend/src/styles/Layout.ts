import styled from "styled-components";
import { StyledDropdownDiv as BaseStyledDropdownDiv } from "components/Dashboard/styles";

// TODO(nghia): reuse components, grep dupplicated styles and ref to here later
export const StyledDropdownDiv = styled(BaseStyledDropdownDiv)`
  margin-right: 50px;
`;

export const StyledMainDiv = styled.div`
  @media (min-width: 1400px) {
    width: 85vw;
    padding-left: 2%;
    padding-right: 5%;
  }
  @media only screen and (max-width: 1400px) and (min-width: 1300px) {
    width: 80vw;
    padding-left: 5%;
    padding-right: 5%;
  }
  @media only screen and (max-width: 1300px) and (min-width: 800px) {
    margin: 20px 10px;
    width: 75vw;
  }

  @media only screen and (max-width: 800px) and (min-width: 768px) {
    margin: 20px 10px;
    width: 60vw;
  }
`;
