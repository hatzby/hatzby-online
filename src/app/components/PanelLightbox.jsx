"use client";
import dynamic from "next/dynamic";

const Lightbox = dynamic(() => import("yet-another-react-lightbox"), { ssr: false });
import "yet-another-react-lightbox/styles.css";

export default function PanelLightbox({ slides, open, index = 0, onClose }) {
  if (!open) return null;
  return (
    <Lightbox
      open={open}
      index={index}
      close={onClose}
      slides={slides}
    />
  );
}