import React, { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  PieChart, Pie, Cell, 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Award } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

export default function Dashboard() {
  const { transactions, totalIncome, totalExpenses, netBalance, topCategory } = useFinance();

  // Process data for Category Pie Chart
  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'Expense');
    const grouped = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {});
    
    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Process data for trend (Last 6 Months Income vs Expense)
  const monthlyData = useMemo(() => {
    const monthsData = {};
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthsData[monthKey] = { name: monthKey, Income: 0, Expense: 0, sortKey: d.getTime() };
    }

    transactions.forEach(t => {
      const d = new Date(t.date);
      const monthKey = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      if (monthsData[monthKey]) {
        monthsData[monthKey][t.type] += Number(t.amount);
      }
    });

    return Object.values(monthsData).sort((a, b) => a.sortKey - b.sortKey);
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--bg-secondary)', padding: '1rem', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>{label || payload[0].name}</p>
          {payload.map((entry, index) => (
            <div key={index} style={{ color: entry.color }}>
              {entry.name}: ₹{entry.value.toLocaleString()}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Summary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--success)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: '0.9rem' }}>Total Income</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{totalIncome.toLocaleString()}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--danger)' }}>
            <TrendingDown size={24} />
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: '0.9rem' }}>Total Expenses</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>₹{totalExpenses.toLocaleString()}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--info)' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: '0.9rem' }}>Net Balance</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: netBalance < 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
              ₹{netBalance.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--warning)' }}>
            <Award size={24} />
          </div>
          <div>
            <div className="text-muted" style={{ fontSize: '0.9rem' }}>Top Category</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {topCategory[0]}
            </div>
            <div className="text-danger" style={{ fontSize: '0.8rem' }}>₹{topCategory[1].toLocaleString()}</div>
          </div>
        </div>

      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '2rem' }}>
        
        {/* Income vs Expense Bar Chart */}
        <div className="glass-panel">
          <h3 className="h2" style={{ fontSize: '1.2rem' }}>Income vs Expense</h3>
          <div style={{ height: 300, width: '100%', marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" tickFormatter={(val) => `₹${val/1000}k`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Income" fill="var(--success)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="var(--danger)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses by Category Pie Chart */}
        <div className="glass-panel">
          <h3 className="h2" style={{ fontSize: '1.2rem' }}>Expenses by Category</h3>
          <div style={{ height: 300, width: '100%', marginTop: '1rem' }}>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                No expense data to display
              </div>
            )}
          </div>
        </div>

        {/* Monthly Spending Trend Line Chart */}
        <div className="glass-panel" style={{ gridColumn: '1 / -1' }}>
          <h3 className="h2" style={{ fontSize: '1.2rem' }}>Monthly Spending Trend</h3>
          <div style={{ height: 300, width: '100%', marginTop: '1rem' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" tickFormatter={(val) => `₹${val/1000}k`} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="Expense" stroke="var(--accent-primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--accent-primary)' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
