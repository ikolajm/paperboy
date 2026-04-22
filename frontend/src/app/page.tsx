import { getDigest, getLatestDigest, getDigestDates } from "@/lib/digest";
import { DigestShell } from "@/components/digest/DigestShell";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { date } = await searchParams;
  const dates = await getDigestDates();

  const digest =
    typeof date === "string" ? await getDigest(date) : await getLatestDigest();

  return <DigestShell digest={digest} dates={dates} />;
}
