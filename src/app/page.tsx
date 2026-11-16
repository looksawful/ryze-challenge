import { HomeworkCookieNotice, HomeworkCookieSettingsButton } from "@/features/consent/HomeworkCookieNotice";
import { HeroWithNavigation } from "@/features/site-shell/HeroWithNavigation";

export default function Page() {
  return (
    <div data-theme="dusk">
      <HeroWithNavigation />
      <HomeworkCookieNotice />
      <footer className="wrapper" style={{ paddingBlock: "var(--space-4)" }}>
        <HomeworkCookieSettingsButton />
      </footer>
    </div>
  );
}