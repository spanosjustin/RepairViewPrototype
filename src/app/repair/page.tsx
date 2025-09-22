// src/app/repair/page.tsx
import RepairLayout from "@/components/repair/RepairLayout";
import { MOCK_COMPONENTS, MOCK_REPAIR_ROWS } from "@/lib/repair/mock";

export default function RepairPage() {
  return <RepairLayout components={MOCK_COMPONENTS} repairRows={MOCK_REPAIR_ROWS} />;
}
