import React from "react";
import GalleryView from "@/components/GalleryView";

// For demo purposes, we'll use a hardcoded user ID
const DEMO_USER_ID = 1;

export default function Gallery() {
  return <GalleryView userId={DEMO_USER_ID} />;
}
