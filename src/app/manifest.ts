import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "우리동네 밥친구",
    short_name: "든든이",
    description: "근처 가맹점·편의점 지도와 편의점 상품 영양 안내",
    start_url: "/",
    display: "standalone",
    background_color: "#fdf8ef",
    theme_color: "#fdf8ef",
    icons: [
      { src: "/icons/pwa-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/pwa-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/pwa-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
