import { SiteHeader } from "@/components/common/site-header";
import { SiteFooter } from "@/components/common/site-footer";
import { PageLoader } from "@/components/common/page-loader";
import { SmoothScroll } from "@/components/common/smooth-scroll";
import { BackToTop } from "@/components/common/back-to-top";
import { SocialRail } from "@/components/common/social-rail";
import { VoiceAssistant } from "@/components/voice/voice-assistant";

const VOICE_ENABLED = process.env.NEXT_PUBLIC_VOICE_ASSISTANT_ENABLED !== "false";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SmoothScroll />
      <PageLoader />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <SocialRail />
      <BackToTop />
      {VOICE_ENABLED && <VoiceAssistant />}
    </>
  );
}
