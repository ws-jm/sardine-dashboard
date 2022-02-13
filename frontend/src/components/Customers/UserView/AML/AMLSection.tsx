import { AmlSource } from "sardine-dashboard-typescript-definitions";

export interface SectionsAttribute {
  key: string;
  value: string | JSX.Element[] | JSX.Element;
  description: string;
}

export interface Sections {
  name: string;
  key: number | string;
  level?: string;
  sources?: AmlSource[];
  attributes?: SectionsAttribute[];
}
