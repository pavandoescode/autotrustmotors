import Header from "@/components/organisms/Header";
import Footer from "@/components/organisms/Footer";
import WhatsAppFAB from "@/components/atoms/WhatsAppFAB";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFAB />
    </>
  );
}
