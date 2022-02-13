import { FC } from "react";

import { GetFeedbacksResponse, Feedback } from "sardine-dashboard-typescript-definitions";
import { StyledTable, StyledTh, StyledTr } from "../../Table/styles";
import LoadingText from "../../Common/LoadingText";

const FeedbackItem: FC<{ feedback: Feedback }> = ({ feedback }) => (
  <StyledTr>
    <td>{feedback.reason}</td>
    <td>{feedback.scope}</td>
    <td>{feedback.status}</td>
    <td>{feedback.type}</td>
    <td>{feedback.time}</td>
  </StyledTr>
);

const FeedbackList: FC<{ feedbacks: GetFeedbacksResponse; isLoading: boolean }> = ({ feedbacks, isLoading }) => {
  if (isLoading) return <LoadingText />;

  if (!feedbacks.length) return <div>No data.</div>;

  return (
    <div>
      <StyledTable>
        <thead>
          <StyledTr
            style={{
              height: "36px",
              backgroundColor: "#f5f5f5",
            }}
          >
            <StyledTh>Reason</StyledTh>
            <StyledTh>Scope</StyledTh>
            <StyledTh>Status</StyledTh>
            <StyledTh>Type</StyledTh>
            <StyledTh>Time</StyledTh>
          </StyledTr>
        </thead>
        <tbody>
          {feedbacks.map((feedback) => (
            <FeedbackItem feedback={feedback} key={`feedback-${feedback.time}`} />
          ))}
        </tbody>
      </StyledTable>
    </div>
  );
};

export default FeedbackList;
