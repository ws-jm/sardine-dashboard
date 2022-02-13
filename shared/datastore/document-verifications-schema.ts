export interface DocumentData {
  first_name: string;
  number: string;
  last_name: string;
  middle_name: string;
  address: string;
  gender: string;
  date_of_birth: string;
  date_of_issue: string;
  date_of_expiry: string;
  issuing_country: string;
  type: string;
}

export interface DocumentVerificationImages {
  front_image_path: string;
  back_image_path: string;
  selfie_path: string;
}

export interface ForgeryTestResults {
  subtype: string;
  type: string;
  result: string;
}

export interface DocumentVerification extends DocumentVerificationImages {
  id: string;
  session_key: string;
  client_id: string;
  document_match_level: string;
  face_match_level: string;
  forgery_level: string;
  image_quality_level: string;
  risk_level: string;
  verification_id: string;
  timestamp: string;
  document_data: DocumentData;
  customer_id: string;
  forgery_test_results: ForgeryTestResults[];
}
