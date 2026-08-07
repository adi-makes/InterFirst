export default function manifest() {
  return {
    name: "InterFirst",
    short_name: "InterFirst",
    description:
      "InterFirst builds internet-first companies by designing the product, systems, and company as one connected whole.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/brand/interfirst-mark.png",
        sizes: "130x150",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
