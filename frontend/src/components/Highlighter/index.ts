import { createElement } from "react";
import { findAll } from "./utils";

interface HighlighterCoreProps {
  textToHighlight: string;
  searchWords: (string | undefined)[];
  highlightedClassName?: string;
  unhighlightedClassName?: string;
  className?: string;
  activeClassName?: string;
  ignoreTextDiacritics?: boolean;
}

/**
 * Highlights all occurrences of search terms (searchText) within a string (textToHighlight).
 * This function returns an array of strings and <span>s (wrapping highlighted words).
 */
export const Highlighter = ({
  searchWords,
  textToHighlight,
  highlightedClassName,
  className,
  unhighlightedClassName,
  activeClassName,
  ignoreTextDiacritics = true,
  ...rest
}: HighlighterCoreProps): JSX.Element => {
  const chunks = findAll({
    // filter empty
    searchWords: searchWords.filter((w) => Boolean(w)) as string[],
    textToHighlight,
    ignoreTextDiacritics,
  });

  return createElement(
    "span",
    {
      className,
      ...rest,
    },
    chunks.map((chunk, index) => {
      const text = textToHighlight.substring(chunk.start, chunk.end);

      if (chunk.highlight) {
        const props = {
          children: text,
          className: highlightedClassName,
          key: index,
        };

        return createElement("mark", props);
      }
      return createElement(
        "span",
        {
          className: unhighlightedClassName,
          key: index,
        },
        text
      );
    })
  );
};
