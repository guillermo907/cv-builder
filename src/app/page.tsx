import { getSiteContent } from "@/lib/content";
import { HomePage } from "@/components/home/home-page";

export const dynamic = "force-dynamic";

export default async function Page() {
  const content = await getSiteContent();
  return <HomePage content={content} />;
}
