import { Footer } from "@/components/Footer";
import GlobalNavbar from "@/components/GlobalNavbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <GlobalNavbar />
      {children}
      <Footer />
    </>
  );
}
