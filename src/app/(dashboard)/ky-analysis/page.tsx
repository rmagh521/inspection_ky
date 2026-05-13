import { getKYProducts, getKYCapabilities } from "@/lib/xlsx-data";
import { KYAnalysisClient } from "./ky-analysis-client";

export default async function KYAnalysisPage() {
  const kyProducts = await getKYProducts();
  const capabilities = await getKYCapabilities();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">KY Analysis</h2>
      <KYAnalysisClient kyProducts={kyProducts} capabilities={capabilities} />
    </div>
  );
}
