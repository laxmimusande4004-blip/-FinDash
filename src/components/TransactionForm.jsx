import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useFinance } from '../context/FinanceContext';
import { PlusCircle, Save, X } from 'lucide-react';

const schema = yup.object({
  title: yup.string().required('Title is required').max(50, 'Max 50 characters'),
  amount: yup.number().typeError('Must be a number').positive('Amount must be positive').required('Amount is required'),
  category: yup.string().required('Category is required'),
  date: yup.date().typeError('Invalid Date').required('Date is required'),
  type: yup.string().oneOf(['Income', 'Expense']).required('Type is required'),
  notes: yup.string().max(200, 'Max 200 characters'),
  isRecurring: yup.boolean()
}).required();

const EXPENSE_CATEGORIES = ['Food', 'Travel', 'Rent', 'Shopping', 'Entertainment', 'Health', 'Utilities', 'Subscriptions', 'Other'];
const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investments', 'Other'];

export default function TransactionForm({ existingTransaction, onClose }) {
  const { addTransaction, editTransaction } = useFinance();
  
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: existingTransaction ? {
      ...existingTransaction,
      date: new Date(existingTransaction.date).toISOString().split('T')[0]
    } : {
      type: 'Expense',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false
    }
  });

  const transactionType = watch('type');
  const categories = transactionType === 'Expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const onSubmit = (data) => {
    // Ensure data is saved uniformly
    const payload = {
      ...data,
      date: data.date.toISOString(),
      amount: Number(data.amount)
    };

    if (existingTransaction) {
      editTransaction(existingTransaction.id, payload);
    } else {
      addTransaction(payload);
    }
    
    reset();
    if (onClose) onClose();
  };

  return (
    <div className="glass-panel" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 className="h2" style={{ margin: 0 }}>
          {existingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
        </h2>
        {onClose && (
          <button type="button" onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label>Title</label>
            <input {...register('title')} placeholder="e.g., Netflix Subscription" />
            <span className="text-danger" style={{ fontSize: '0.8rem' }}>{errors.title?.message}</span>
          </div>
          <div>
            <label>Amount (₹)</label>
            <input type="number" step="0.01" {...register('amount')} placeholder="0.00" />
            <span className="text-danger" style={{ fontSize: '0.8rem' }}>{errors.amount?.message}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label>Type</label>
            <select {...register('type')}>
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
            <span className="text-danger" style={{ fontSize: '0.8rem' }}>{errors.type?.message}</span>
          </div>
          <div>
            <label>Category</label>
            <select {...register('category')}>
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <span className="text-danger" style={{ fontSize: '0.8rem' }}>{errors.category?.message}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
          <div>
            <label>Date</label>
            <input type="date" {...register('date')} />
            <span className="text-danger" style={{ fontSize: '0.8rem' }}>{errors.date?.message}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            <input type="checkbox" {...register('isRecurring')} style={{ width: 'auto' }} id="recurring" />
            <label htmlFor="recurring" style={{ margin: 0, cursor: 'pointer' }}>Mark as Recurring</label>
          </div>
        </div>

        <div>
          <label>Notes</label>
          <textarea {...register('notes')} placeholder="Optional notes..."></textarea>
          <span className="text-danger" style={{ fontSize: '0.8rem' }}>{errors.notes?.message}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
          {onClose && (
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary">
            {existingTransaction ? <><Save size={18} /> Update</> : <><PlusCircle size={18} /> Add</>}
          </button>
        </div>
      </form>
    </div>
  );
}
