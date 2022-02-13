// TODO(NGHIA): REMOVE POLYFILL
export const replaceAll = (text: string, before: string, after: string): string => text.replaceAll(before, after);

export const replaceAllUnderscoresWithSpaces = (text: string): string => replaceAll(text, "_", " ");
export const replaceAllSpacesWithUnderscores = (text: string): string => replaceAll(text, " ", "_").toLowerCase();
