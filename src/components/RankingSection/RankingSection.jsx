import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const RankingSection = ({
  ranking,
  totalDeliveries,
  progressPercent,
  weeklyGoal,
  periodLabel
}) => {
  const chartData = ranking.map((item, index) => ({
    name: item.name,
    deliveries: item.count,
    rank: index + 1
  }));

  return (
    <div className="p-4 bg-zinc-900 text-white space-y-6">
      <h2 className="text-lg font-bold text-center text-orange-400">
        Resultados: {periodLabel}
      </h2>

      {/* Gráfico de barras */}
      <div className="w-full h-[300px] bg-zinc-800 rounded-xl shadow-inner p-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis
              dataKey="name"
              tick={{ fill: '#AAA' }}
              tickFormatter={(value) => value.split(' ')[0]}
            />
            <YAxis tick={{ fill: '#AAA' }} />
            <Bar
              dataKey="deliveries"
              fill="#ce8d00"
              animationDuration={1500}
              label={{
                position: 'top',
                fill: '#FFF',
                fontSize: 12
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Lista de ranking */}
      <div className="space-y-2">
        {ranking.map((driver, index) => (
          <motion.div
            key={driver.name}
            className="flex items-center justify-between bg-zinc-800 px-4 py-3 rounded-lg shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="text-orange-400 font-bold text-lg">{index + 1}º</div>
            <div className="flex flex-col text-sm text-right">
              <span className="font-semibold">{driver.name}</span>
              <span className="text-zinc-300">{driver.count} entregas</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Barra de progresso */}
      <div className="bg-zinc-800 p-4 rounded-xl shadow-inner">
        <h3 className="text-center text-orange-400 font-semibold mb-2">
          Progresso da Meta Semanal
        </h3>
        <div className="w-full bg-zinc-700 rounded-full h-6 overflow-hidden mb-2">
          <motion.div
            className="h-full bg-orange-500 text-sm font-bold text-black text-center"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1 }}
          >
            {progressPercent.toFixed(0)}%
          </motion.div>
        </div>
        <p className="text-center text-sm text-zinc-300">
          {totalDeliveries} de {weeklyGoal} entregas ({Math.round(progressPercent)}%)
        </p>
      </div>
    </div>
  );
};

export default RankingSection;
