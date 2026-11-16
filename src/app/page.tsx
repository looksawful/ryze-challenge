import CookieConsent from "@/features/consent/CookieConsent";
import Hero from "@/features/hero/Hero";

export default function Page() {
  return (
    <>
      <Hero>
        <CookieConsent />
      </Hero>
    </>
  );
}
