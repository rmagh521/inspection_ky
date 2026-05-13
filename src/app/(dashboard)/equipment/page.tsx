import { getEquipmentMakers, getEquipmentModels } from "@/lib/xlsx-data";
import { EquipmentClient } from "./equipment-client";

export default async function EquipmentPage() {
  const makers = await getEquipmentMakers();
  const models = await getEquipmentModels();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">장비 비교 매트릭스</h2>
      <EquipmentClient makers={makers} models={models} />
    </div>
  );
}
