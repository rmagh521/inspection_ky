import { getProducts, getProcessSteps, getInspectionPoints } from "@/lib/xlsx-data";
import { ProductsClient } from "./products-client";

export default async function ProductsPage() {
  const products = await getProducts();
  const steps = await getProcessSteps();
  const inspectionPoints = await getInspectionPoints();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">제품군 목록</h2>
      <ProductsClient
        products={products}
        steps={steps}
        inspectionPoints={inspectionPoints}
      />
    </div>
  );
}
