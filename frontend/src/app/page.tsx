import { getDigest, getLatestDigest, getDigestDates } from "@/lib/digest";
import { DigestShell } from "@/components/digest/shell/DigestShell";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { date, tab } = await searchParams;
  const dates = await getDigestDates();

  const digest =
    typeof date === "string" ? await getDigest(date) : await getLatestDigest();

  const initialTab = typeof tab === "string" ? tab : undefined;

  return <DigestShell digest={digest} dates={dates} initialTab={initialTab} />;
}
