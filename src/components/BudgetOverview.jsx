import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Target, AlertTriangle } from 'lucide-react';

export default function BudgetOverview() {
  const { transactions, budget, updateBudget } = useFinance();
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(budget);

  // Calculate only expenses for the current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyExpenses = transactions.reduce((acc, t) => {
    const tDate = new Date(t.date);
    if (t.type === 'Expense' && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
      return acc + Number(t.amount);
    }
    return acc;
  }, 0);

  const remaining = budget - monthlyExpenses;
  const percentage = budget > 0 ? Math.min((monthlyExpenses / budget) * 100, 100) : 0;

  const handleSave = () => {
    updateBudget(Number(newBudget));
    setIsEditing(false);
  };

  let progressColor = 'var(--success)';
  if (percentage > 85) progressColor = 'var(--danger)';
  else if (percentage > 70) progressColor = 'var(--warning)';

  return (
    <div className="glass-panel" style={{ height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="h2" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={24} /> Budget Tracking
        </h2>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="btn-icon" style={{ fontSize: '0.85rem' }}>
            Edit Budget
          </button>
        )}
      </div>

      {isEditing ? (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input 
            type="number" 
            value={newBudget} 
            onChange={(e) => setNewBudget(e.target.value)}
            style={{ width: '150px' }}
          />
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
          <button className="btn" onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
            ₹{budget.toLocaleString()}
          </div>
          <div className="text-muted">Monthly Budget</div>
        </div>
      )}

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
          <span>Spent: <strong>₹{monthlyExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong></span>
          <span>Remaining: <strong style={{ color: remaining < 0 ? 'var(--danger)' : 'var(--success)' }}>
            ₹{remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </strong></span>
        </div>
        
        <div style={{ height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ 
            height: '100%', 
            width: `${percentage}%`, 
            background: progressColor,
            transition: 'width 0.5s ease-out'
          }}></div>
        </div>
        
        <div style={{ textAlign: 'right', fontSize: '0.8rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>
          {percentage.toFixed(1)}% Used
        </div>

        {percentage >= 90 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', marginTop: '1rem', fontSize: '0.9rem', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px' }}>
            <AlertTriangle size={18} />
            You are nearing or have exceeded your monthly budget!
          </div>
        )}
      </div>
    </div>
  );
}
