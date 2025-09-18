import StatsMatrix from "@/components/matrix/StatsMatrix";
import { MOCK_TURBINES } from "@/lib/matrix/mock";

export default function MatrixPage() {
  const first = MOCK_TURBINES[0];

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Matrix Demo</h1>

      {/* First pixels: render only the Stats matrix for Turbine 0 */}
      <div className="rounded-2xl bg-card p-4 border">
        <div className="mb-3 text-sm text-muted-foreground">
          Showing <span className="font-medium">{first.name}</span> — Stats
        </div>
        <StatsMatrix rows={first.stats} />
      </div>
    </div>
  );
}
