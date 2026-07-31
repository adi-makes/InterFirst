import { CareersPage } from "@/components/CareersPage.jsx";

export const metadata = {
  title: "Careers",
  description: "Apply to InterFirst as a developer, designer, or marketer.",
  alternates: { canonical: "/careers" },
  openGraph: {
    title: "Careers — InterFirst",
    description: "Apply to InterFirst as a developer, designer, or marketer.",
    url: "/careers",
  },
  twitter: {
    title: "Careers — InterFirst",
    description: "Apply to InterFirst as a developer, designer, or marketer.",
  },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export default function Page() {
  return <CareersPage />;
}
