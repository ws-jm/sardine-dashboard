// Forked from https://raw.githubusercontent.com/bvaughn/highlight-words-core/master/src/utils.js

export type Chunk = {
  highlight: boolean;
  start: number;
  end: number;
};

// nghĩa -> nghia
export const stripTextDiacritics = (text: string) => text.normalize("NFD").replace(/\p{Diacritic}/gu, "");

/**
 * Creates an array of chunk objects representing both higlightable and non highlightable pieces of text that match each search word.
 * @return Array of "chunks" (where a Chunk is { start:number, end:number, highlight:boolean })
 */
export const findAll = ({
  searchWords,
  textToHighlight,
  ignoreTextDiacritics,
}: {
  searchWords: Array<string>;
  textToHighlight: string;
  ignoreTextDiacritics?: boolean;
}): Array<Chunk> =>
  // [start,end] -> [start,end,highlight:true] + gap betwen [start,end,highlight:false]
  fillInChunks({
    // [start,end] -> combine/remove overlap -> [start/end]
    chunksToHighlight: combineChunks({
      // text -> [start,endi]
      chunks: findChunks({
        searchWords,
        textToHighlight,
        ignoreTextDiacritics,
      }),
    }),
    totalLength: textToHighlight ? textToHighlight.length : 0,
  });

/**
 * Takes an array of {start:number, end:number} objects and combines chunks that overlap into single chunks.
 * @return {start:number, end:number}[]
 */
export const combineChunks = ({ chunks }: { chunks: Array<Chunk> }): Array<Chunk> => {
  chunks = chunks
    .sort((first, second) => first.start - second.start)
    .reduce<Chunk[]>((processedChunks: Chunk[], nextChunk) => {
      // First chunk just goes straight in the array...
      if (processedChunks.length === 0) {
        return [nextChunk];
      }
      // ... subsequent chunks get checked to see if they overlap...
      const prevChunk = processedChunks.pop();
      if (!prevChunk) return processedChunks;

      if (nextChunk.start <= prevChunk.end) {
        // It may be the case that prevChunk completely surrounds nextChunk, so take the
        // largest of the end indeces.
        const endIndex = Math.max(prevChunk.end, nextChunk.end);
        processedChunks.push({ highlight: false, start: prevChunk.start, end: endIndex });
      } else {
        processedChunks.push(prevChunk, nextChunk);
      }
      return processedChunks;
    }, []);

  return chunks;
};

function escapeRegExpFn(string: string): string {
  return string.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

/**
 * Examine text for any matches.
 * If we find matches, add them to the returned array as a "chunk" object ({start:number, end:number}).
 * @return {start:number, end:number}[]
 */
const findChunks = ({
  searchWords,
  textToHighlight,
  ignoreTextDiacritics,
}: {
  searchWords: Array<string>;
  textToHighlight: string;
  ignoreTextDiacritics?: boolean;
}): Array<Chunk> => {
  textToHighlight = sanitize(textToHighlight);

  return searchWords
    .filter((searchWord) => searchWord) // Remove empty words
    .reduce<Chunk[]>((chunks, searchWord) => {
      searchWord = sanitize(searchWord);

      const stripedSearchWord = ignoreTextDiacritics ? stripTextDiacritics(searchWord) : searchWord;
      const stripedTextToHighlight = ignoreTextDiacritics ? stripTextDiacritics(textToHighlight) : textToHighlight;

      const regex = new RegExp(escapeRegExpFn(stripedSearchWord), "g");

      let match;
      while ((match = regex.exec(stripedTextToHighlight))) {
        const start = match.index;
        const end = regex.lastIndex;
        // We do not return zero-length matches
        if (end > start) {
          chunks.push({ highlight: false, start, end });
        }

        // Prevent browsers like Firefox from getting stuck in an infinite loop
        // See http://www.regexguru.com/2008/04/watch-out-for-zero-length-matches/
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }
      }

      return chunks;
    }, []);
};

/**
 * Given a set of chunks to highlight, create an additional set of chunks
 * to represent the bits of text between the highlighted text.
 * @param chunksToHighlight {start:number, end:number}[]
 * @param totalLength number
 * @return {start:number, end:number, highlight:boolean}[]
 */
export const fillInChunks = ({
  chunksToHighlight,
  totalLength,
}: {
  chunksToHighlight: Array<Chunk>;
  totalLength: number;
}): Array<Chunk> => {
  const allChunks: Chunk[] = [];
  const append = (start: number, end: number, highlight: boolean) => {
    if (end - start > 0) {
      allChunks.push({
        start,
        end,
        highlight,
      });
    }
  };

  if (chunksToHighlight.length === 0) {
    append(0, totalLength, false);
  } else {
    let lastIndex = 0;
    chunksToHighlight.forEach((chunk) => {
      append(lastIndex, chunk.start, false);
      append(chunk.start, chunk.end, true);
      lastIndex = chunk.end;
    });
    append(lastIndex, totalLength, false);
  }
  return allChunks;
};

function sanitize(string: string): string {
  return string;
}
