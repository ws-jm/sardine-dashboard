import { Card } from "react-bootstrap";
import { ImageContainer, ImageLink } from "../styles";

interface CapturedDocumentsSectionProps {
  images: {
    src: string;
    alt: string;
  }[];
}

export const CapturedDocumentsSection = ({ images }: CapturedDocumentsSectionProps) => {
  const hasImage = images.length > 0;
  if (!hasImage) return null;

  return (
    <Card className="mt-5">
      <Card.Header className="font-weight-bold" style={{ color: "var(--dark-14)" }}>
        Captured ID documents
      </Card.Header>
      <ImageContainer>
        {images.map((image) => (
          <ImageLink href={image.src}>
            <img src={image.src} alt={image.alt} />
          </ImageLink>
        ))}
      </ImageContainer>
    </Card>
  );
};
