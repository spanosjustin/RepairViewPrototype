import TurbineList from "@/components/matrix/TurbineList";
import { MOCK_TURBINES } from "@/lib/matrix/mock";

export default function MatrixPage() {
  return (
    <div className="p-6 space-y-4">
      <TurbineList turbines={MOCK_TURBINES} />
    </div>
  );
}
