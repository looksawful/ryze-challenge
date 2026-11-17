import { HomeworkCookieNotice } from "@/features/consent/HomeworkCookieNotice";
import { HeroWithNavigation } from "@/features/site-shell/HeroWithNavigation";

export default function Page() {
  return (
    <div data-theme="dusk">
      <HeroWithNavigation />
      <HomeworkCookieNotice />
    </div>
  );
}