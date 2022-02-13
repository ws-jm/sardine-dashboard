import { DocumentVerification } from "sardine-dashboard-typescript-definitions";

type HeaderField = {
  key: keyof DocumentVerification;
  highFirstOrder?: boolean;
};

export const headerFields: HeaderField[] = [
  { key: "risk_level", highFirstOrder: false },
  { key: "forgery_level", highFirstOrder: false },
  { key: "document_match_level", highFirstOrder: true },
  { key: "image_quality_level", highFirstOrder: true },
  { key: "face_match_level", highFirstOrder: true },
  { key: "timestamp" },
  { key: "customer_id" },
  { key: "session_key" },
  { key: "verification_id" },
];

export const imageFields: (keyof DocumentVerification)[] = ["front_image_path", "back_image_path", "selfie_path"];
