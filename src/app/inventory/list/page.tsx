import InventoryMatrix from "@/components/inventory/InventoryMatrix";
import { MOCK_INVENTORY } from "@/lib/inventory/mock";

export default function InventoryListPage() {
    return (
        <div className="p-6 space-y-4">
            <div className="rounded-2xl bg-card p-4 border">
            <h1 className="text-xl font-bold">Inventory</h1>
                <div>View Flip</div>
                <InventoryMatrix items={MOCK_INVENTORY} />
            </div>
        </div>
    );
}