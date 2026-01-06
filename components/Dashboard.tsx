
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, Clock, CheckCircle, Package, ArrowUpRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Requisition, MPRSStatus } from '../types';

const DashboardCard = ({ title, value, subValue, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        <Icon size={24} />
      </div>
      <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
        <ArrowUpRight size={14} className="mr-1" /> 12%
      </span>
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    <p className="text-xs text-slate-400 mt-1">{subValue}</p>
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState<Requisition[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('samuda_mprs_history');
    if (saved) setData(JSON.parse(saved));
  }, []);

  const stats = [
    { title: 'Total Requisitions', value: data.length, subValue: 'Last 30 days', icon: Package, color: 'bg-blue-500' },
    { title: 'Pending Approval', value: data.filter(r => r.status === MPRSStatus.PENDING).length, subValue: 'Action required', icon: Clock, color: 'bg-amber-500' },
    { title: 'Completed Orders', value: data.filter(r => r.status === MPRSStatus.ORDERED).length, subValue: 'In last quarter', icon: CheckCircle, color: 'bg-emerald-500' },
    { title: 'Urgent Items', value: '4', subValue: 'Lead time < 2 days', icon: TrendingUp, color: 'bg-red-500' },
  ];

  const chartData = [
    { name: 'Mon', count: 4 },
    { name: 'Tue', count: 7 },
    { name: 'Wed', count: 5 },
    { name: 'Thu', count: 8 },
    { name: 'Fri', count: 12 },
    { name: 'Sat', count: 3 },
    { name: 'Sun', count: 1 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Operations Overview</h1>
          <p className="text-slate-500">Welcome back, here's what's happening today.</p>
        </div>
        <Link 
          to="/new" 
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-md active:scale-95"
        >
          <Plus size={20} />
          New MPRS
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => <DashboardCard key={i} {...stat} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Weekly Activity</h3>
            <select className="bg-slate-50 border-none text-xs font-semibold text-slate-600 rounded-lg px-3 py-1.5 focus:ring-0">
              <option>Last 7 Days</option>
              <option>Last Month</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Status Breakdown</h3>
          <div className="h-72 relative">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Pending', value: 35, color: '#f59e0b' },
                    { name: 'Approved', value: 45, color: '#3b82f6' },
                    { name: 'Ordered', value: 20, color: '#10b981' },
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[0, 1, 2].map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#f59e0b', '#3b82f6', '#10b981'][index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900">100%</span>
              <span className="text-xs text-slate-500">Requisitions</span>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-slate-600">Approved</span>
              </div>
              <span className="font-semibold text-slate-900">45</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-slate-600">Pending</span>
              </div>
              <span className="font-semibold text-slate-900">35</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-slate-600">Ordered</span>
              </div>
              <span className="font-semibold text-slate-900">20</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
