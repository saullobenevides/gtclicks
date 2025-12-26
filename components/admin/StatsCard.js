export default function StatsCard({ title, value, change, icon: Icon }) {
  const isPositive = change >= 0;
  
  return (
    <div className="glass-panel p-6 hover:bg-white/5 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
        {Icon && (
          <div className="p-2 bg-white/5 rounded-lg">
            <Icon className="w-5 h-5 text-zinc-400" />
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-white">{value}</p>
        
        {change !== undefined && (
          <div className="flex items-center gap-1">
            <span className={`text-sm font-medium ${
              isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              {isPositive ? '↑' : '↓'} {Math.abs(change)}%
            </span>
          </div>
        )}
      </div>
      
      {change !== undefined && (
        <p className="text-xs text-zinc-500 mt-2">vs. mês anterior</p>
      )}
    </div>
  );
}
