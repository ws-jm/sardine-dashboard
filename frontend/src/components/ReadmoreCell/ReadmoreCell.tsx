import ShowMoreText from "react-show-more-text";

interface ReadmoreCellProps {
  text: string;
}

export const ReadmoreCell = ({ text }: ReadmoreCellProps) => <ShowMoreText lines={2}>{text}</ShowMoreText>;
