import data from "@/data/ranked.json";
import Screener from "./Screener";

export default function Page() {
  const slim = data.map(({ rawText, ...r }) => r);
  return <Screener initial={slim} />;
}
