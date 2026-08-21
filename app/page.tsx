import { CartDrawer } from "@/components/cart/CartDrawer";
import { MobileCartBar } from "@/components/cart/MobileCartBar";
import { CatalogSection } from "@/components/catalog/CatalogSection";
import { CustomizationHost } from "@/components/catalog/CustomizationHost";
import { DeliverySection } from "@/components/delivery/DeliverySection";
import { CustomerFormSection } from "@/components/forms/CustomerFormSection";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { OrderReviewSection } from "@/components/order/OrderReviewSection";
import { EditorialStrip } from "@/components/sections/EditorialStrip";
import { FAQSection } from "@/components/sections/FAQSection";
import { FinalCTASection } from "@/components/sections/FinalCTASection";
import { HeroSection } from "@/components/sections/HeroSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { ValuePropositionSection } from "@/components/sections/ValuePropositionSection";
import { ToastHost } from "@/components/ui/Toast";

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="contenido">
        <HeroSection />
        <ValuePropositionSection />
        <HowItWorksSection />
        <CatalogSection />
        <EditorialStrip />
        <DeliverySection />
        <CustomerFormSection />
        <OrderReviewSection />
        <FAQSection />
        <FinalCTASection />
      </main>
      <Footer />

      <MobileCartBar />
      <CartDrawer />
      <CustomizationHost />
      <ToastHost />
      {/* Espacio para que la barra móvil del pedido no tape el pie de página. */}
      <div aria-hidden className="h-20 bg-charcoal lg:hidden" />
    </>
  );
}
