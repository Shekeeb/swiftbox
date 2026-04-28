"use client"

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

interface Props {
    statusData: { name: string; value: number; color: string }[]
}

const AdminCharts = ({ statusData }: Props) => {
    return (
        <div className="grid grid-cols-2 gap-4">

            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Orders by status
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                        <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" >
                            {statusData.map((entry, index) => (
                                <Cell key={index} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2 flex-wrap">
                    {statusData.map((item) => (
                        <div key={item.name} className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                            <span className="text-xs text-gray-500">
                                {item.name} ({item.value})
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Order volume by status
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={statusData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {statusData.map((entry, index) => (
                                <Cell key={index} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}

export default AdminCharts