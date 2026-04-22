import { getLatestDigest, getDigestDates } from "@/lib/digest";
import { DigestShell } from "@/components/digest/DigestShell";

export default async function Home() {
  const [digest, dates] = await Promise.all([
    getLatestDigest(),
    getDigestDates(),
  ]);

  return <DigestShell digest={digest} dates={dates} />;
}
