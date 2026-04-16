"use client"

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis } from "recharts"

interface Props {
    statusData: { name: string; value: number; color: string }[]
    sizeData: { name: string; value: number }[]
    weeklyData: { date: string; orders: number }[]
    weightData: { size: string; avgWeight: number }[]
}

const DashboardCharts = ({ statusData, sizeData, weeklyData, weightData }: Props) => {
    return (
        <div className="grid grid-cols-2 gap-4">

            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Order status breakdown
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                            {statusData.map((entry, index) => (
                                <Cell key={index} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, name]} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2">
                    {statusData.map((item) => (
                        <div key={item.name} className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                            <span className="text-xs text-gray-500">{item.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Orders this week
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="orders" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Delivery trend
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={2} dot={{ fill: "#10B981", r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Package size distribution
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={sizeData}>
                        <PolarGrid stroke="#f0f0f0" />
                        <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                        <Radar dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.3} />
                        <Tooltip />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

        </div>
    )
}

export default DashboardCharts