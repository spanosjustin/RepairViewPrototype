export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-12">
            <div className="w-full max-w-6xl space-y-8">
                {/* A, B, C, D squares */}
                <div className="flex gap-6">
                    <div className="flex-1 h-32 bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-2xl font-bold text-blue-600 rounded-lg shadow-sm">
                        A
                    </div>
                    <div className="flex-1 h-32 bg-green-50 border-2 border-green-200 flex items-center justify-center text-2xl font-bold text-green-600 rounded-lg shadow-sm">
                        B
                    </div>
                    <div className="flex-1 h-32 bg-yellow-50 border-2 border-yellow-200 flex items-center justify-center text-2xl font-bold text-yellow-600 rounded-lg shadow-sm">
                        C
                    </div>
                    <div className="flex-1 h-32 bg-purple-50 border-2 border-purple-200 flex items-center justify-center text-2xl font-bold text-purple-600 rounded-lg shadow-sm">
                        D
                    </div>
                </div>

                {/* Status Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg">
                    {/* Table Header */}
                    <div className="bg-slate-600 text-white grid grid-cols-5 gap-8 p-4">
                        <div className="font-semibold">Status</div>
                        <div className="font-semibold">Hours</div>
                        <div className="font-semibold">Trips</div>
                        <div className="font-semibold">Starts</div>
                        <div className="font-semibold">Color ID</div>
                    </div>

                    {/* Table Rows */}
                    <div className="divide-y divide-gray-200">
                        {/* Good */}
                        <div className="grid grid-cols-5 gap-8 p-4 items-center hover:bg-gray-50">
                            <div className="bg-green-500 text-white px-3 py-2 rounded text-sm font-medium">Good</div>
                            <div className="flex gap-2">
                                <input type="number" placeholder="From" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <input type="number" placeholder="To" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div className="flex gap-2">
                                <input type="number" placeholder="From" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <input type="number" placeholder="To" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div className="flex gap-2">
                                <input type="number" placeholder="From" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <input type="number" placeholder="To" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div className="w-6 h-6 bg-green-400 rounded-full border-2 border-green-500"></div>
                        </div>

                        {/* Monitor */}
                        <div className="grid grid-cols-5 gap-8 p-4 items-center hover:bg-gray-50">
                            <div className="bg-yellow-500 text-white px-3 py-2 rounded text-sm font-medium">Monitor</div>
                            <div className="flex gap-2">
                                <input type="number" placeholder="From" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <input type="number" placeholder="To" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div className="flex gap-2">
                                <input type="number" placeholder="From" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <input type="number" placeholder="To" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div className="flex gap-2">
                                <input type="number" placeholder="From" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <input type="number" placeholder="To" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div className="w-6 h-6 bg-yellow-400 rounded-full border-2 border-yellow-500"></div>
                        </div>

                        {/* Replace Soon */}
                        <div className="grid grid-cols-5 gap-8 p-4 items-center hover:bg-gray-50">
                            <div className="bg-orange-500 text-white px-3 py-2 rounded text-sm font-medium">Replace Soon</div>
                            <div className="flex gap-2">
                                <input type="number" placeholder="From" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <input type="number" placeholder="To" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div className="flex gap-2">
                                <input type="number" placeholder="From" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <input type="number" placeholder="To" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div className="flex gap-2">
                                <input type="number" placeholder="From" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <input type="number" placeholder="To" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div className="w-6 h-6 bg-orange-400 rounded-full border-2 border-orange-500"></div>
                        </div>

                        {/* Replace Now */}
                        <div className="grid grid-cols-5 gap-8 p-4 items-center hover:bg-gray-50">
                            <div className="bg-red-500 text-white px-3 py-2 rounded text-sm font-medium">Replace Now</div>
                            <div className="flex gap-2">
                                <input type="number" placeholder="From" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <input type="number" placeholder="To" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div className="flex gap-2">
                                <input type="number" placeholder="From" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <input type="number" placeholder="To" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div className="flex gap-2">
                                <input type="number" placeholder="From" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                                <input type="number" placeholder="To" className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div className="w-6 h-6 bg-red-400 rounded-full border-2 border-red-500"></div>
                        </div>

                        {/* Separator line */}
                        <div className="border-t-2 border-gray-400"></div>

                        {/* Spare */}
                        <div className="grid grid-cols-5 gap-8 p-4 items-center hover:bg-gray-50">
                            <div className="bg-slate-500 text-white px-3 py-2 rounded text-sm font-medium">Spare</div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div className="w-6 h-6 bg-slate-300 rounded-full border-2 border-slate-400"></div>
                        </div>

                        {/* Degraded */}
                        <div className="grid grid-cols-5 gap-8 p-4 items-center hover:bg-gray-50">
                            <div className="bg-gray-500 text-white px-3 py-2 rounded text-sm font-medium">Degraded</div>
                            <div></div>
                            <div></div>
                            <div></div>
                            <div className="w-6 h-6 bg-gray-300 rounded-full border-2 border-gray-400"></div>
                        </div>
                    </div>
                </div>

                {/* Excel File Button */}
                <div className="flex justify-center">
                    <button className="bg-slate-600 hover:bg-slate-700 text-white px-8 py-4 rounded-lg shadow-lg transition-colors font-medium">
                        Select Excel File to save entire project to
                    </button>
                </div>
            </div>
        </div>
    );
}