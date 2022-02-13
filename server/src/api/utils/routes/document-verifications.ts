import { DocumentVerification, AnyTodo } from "sardine-dashboard-typescript-definitions";
import { DOCUMENT_IMAGE_BUCKET_NAME, generateSignedUrl } from "../../../commons/storage";

export const generateSignedDocumentVerificationImages = async (
  documentVerification: DocumentVerification | Record<string, AnyTodo>,
  documentVerificationImageKeys: (keyof DocumentVerification)[]
) => {
  const result: Partial<Record<keyof DocumentVerification, string>> = {};

  const images = await Promise.all(
    documentVerificationImageKeys.map((imageKey) => {
      const asyncFn = async () => {
        const path = documentVerification[imageKey];
        if (!path) {
          return { url: "", key: imageKey };
        }
        const url = await generateSignedUrl(path, DOCUMENT_IMAGE_BUCKET_NAME);
        return { url, key: imageKey };
      };

      return asyncFn();
    })
  );

  images.forEach((image) => {
    result[image.key] = image.url;
  });

  return result;
};
