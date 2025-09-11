"use client";

import Image from "next/image";

export default function TreePage() {
    return (
        <div className="p-6 text-xl font-bold">
            <h1 className="text-xl font-bold mb-4 flex justify-center">Coming Soon</h1>
            <p className="mb-6 flex justify-center">
                This will display a tree chart of your inventory items, below is an example
            </p>
            <p className="mb-6 flex justify-center">
                You will be able to drill down on data, and select turbines, components and pieces for their various stats
            </p>
            <p className="mb-6 flex justify-center">
                (more info below the picture)
            </p>
            <figure className="flex flex-col items-center">
                <Image 
                    src="/InventoryTreeView.jpeg"
                    alt="Inventory Tree View Example"
                    width={600}
                    height={400}
                    className="rounded-lg shadow"
                    unoptimized
                    priority
                />
                <figcaption className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    <ul className="list-disc pl-5 text-left">
                        <li><span className="font-medium">Green outline</span> = In Use</li>
                        <li><span className="font-medium">Black outline</span> = In Stock</li>
                        <li><span className="font-medium">Red outline</span> = Needs Repair</li>
                        <li><span className="font-medium">Gray background</span> = Not in Use</li>
                        <li><span className="font-medium">Other backgrounds</span> = Correspond to components</li>
                    </ul>
                </figcaption>
            </figure> 
        </div>
    );
}