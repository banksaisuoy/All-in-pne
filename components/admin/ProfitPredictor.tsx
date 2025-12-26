'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';

const data = [
  { time: '10:00', sales: 4000, predicted: 4200 },
  { time: '11:00', sales: 3000, predicted: 3200 },
  { time: '12:00', sales: 5000, predicted: 4800 },
  { time: '13:00', sales: 2780, predicted: 3900 },
  { time: '14:00', sales: 1890, predicted: 2400 },
  { time: '15:00', sales: 2390, predicted: 2800 },
  { time: '16:00', sales: 3490, predicted: 4300 },
];

export default function ProfitPredictor() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
           <h3 className="text-lg font-bold text-gray-800">Profit Predictor</h3>
           <p className="text-sm text-gray-500">Real-time Sales vs AI Prediction</p>
        </div>
        <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span>Actual Sales</span>
            </div>
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 border border-dashed"></div>
                <span>AI Predicted</span>
            </div>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                dy={10}
            />
            <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
            />
            <Line
                type="monotone"
                dataKey="sales"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8 }}
            />
            <Line
                type="monotone"
                dataKey="predicted"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
