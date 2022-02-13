import { AmlKind, AmlPostalAddress } from "sardine-dashboard-typescript-definitions";

export interface Entity {
  originalEntity: Omit<AmlKind, "entities">;
  aliases: string[];
  dobs: string[];
  addresses: AmlPostalAddress[];
  entityName: string;
  riskScore: number;
  matchScore: number;
  signals: {
    name: string;
    level: string;
  }[];
}
