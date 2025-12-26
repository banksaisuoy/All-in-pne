import ProfitPredictor from '@/components/admin/ProfitPredictor';
import RealTimeMap from '@/components/admin/RealTimeMap';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            God Mode <span className="text-orange-500">Admin</span>
        </h1>
        <p className="text-gray-500 mt-2">Oversee your empire in real-time.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RealTimeMap />
        <ProfitPredictor />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['Total Sales', 'Active Users', 'Conversion Rate'].map((metric, i) => (
             <div key={metric} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <span className="text-gray-500 text-sm font-medium">{metric}</span>
                <span className="text-3xl font-bold text-gray-900 mt-2">
                    {i === 0 ? '$45,231' : i === 1 ? '1,204' : '3.2%'}
                </span>
                <span className="text-green-500 text-xs font-bold mt-2 flex items-center gap-1">
                    ↑ 12% <span className="text-gray-400 font-normal">vs last hour</span>
                </span>
             </div>
        ))}
      </div>
    </div>
  );
}
