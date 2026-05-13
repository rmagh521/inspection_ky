import { getKYProducts, getKYCapabilities, getKYProposalSpecs, getProducts } from "@/lib/xlsx-data";
import { KYAnalysisClient } from "./ky-analysis-client";

export default async function KYAnalysisPage() {
  const kyProducts = await getKYProducts();
  const capabilities = await getKYCapabilities();
  const proposalSpecs = await getKYProposalSpecs();
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">KY Analysis</h2>
      <KYAnalysisClient
        kyProducts={kyProducts}
        capabilities={capabilities}
        proposalSpecs={proposalSpecs}
        products={products}
      />
    </div>
  );
}
