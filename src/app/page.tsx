import CookieConsent from "@/features/consent/CookieConsent";
import { HeroWithNavigation } from "@/features/site-shell/HeroWithNavigation";

export default function Page() {
  return (
    <>
      <CookieConsent />
      <HeroWithNavigation />
    </>
  );
}
