import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Receipt, 
  Image as ImageIcon, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  History,
  DollarSign,
  Tag,
  Sticker,
  Wallet,
  Store,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { dbService } from '../lib/database.service';
import { Database } from '../types/database';

type Expense = Database['public']['Tables']['expenses']['Row'];

interface ExpenseManagerProps {
  employeeId: string;
}

export default function ExpenseManager({ employeeId }: ExpenseManagerProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [category, setCategory] = useState('Travel');
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [merchant, setMerchant] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchExpenses();
  }, [employeeId]);

  const fetchExpenses = async () => {
    try {
      const data = await dbService.getExpenseHistory(employeeId);
      setExpenses(data);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !purpose || !merchant) return;

    setIsSubmitting(true);
    try {
      let screenshot_url = null;
      if (screenshot) {
        screenshot_url = await dbService.uploadExpenseScreenshot(screenshot);
      }

      const now = new Date();
      await dbService.createExpense({
        employee_id: employeeId,
        category,
        amount: parseFloat(amount),
        purpose,
        merchant_name: merchant,
        payment_mode: paymentMode,
        screenshot_url,
        expense_date: now.toISOString().split('T')[0],
        expense_time: now.toLocaleTimeString(),
        status: 'pending'
      });

      // Reset form
      setAmount('');
      setPurpose('');
      setMerchant('');
      setScreenshot(null);
      setPreviewUrl(null);
      setIsAdding(false);
      
      // Refresh list
      fetchExpenses();
    } catch (error) {
      console.error('Failed to submit expense:', error);
      alert('Failed to submit expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: Expense['status']) => {
    switch (status) {
      case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'refunded': return 'bg-sky-100 text-sky-700 border-sky-300';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-retro font-black uppercase tracking-tight text-gray-900">Expenses</h2>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Submit & Track Claims</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
            isAdding ? 'bg-black text-white rotate-45' : 'bg-[#EAFF00] text-black hover:scale-105 active:scale-95'
          }`}
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="overflow-hidden bg-gray-50/50 rounded-3xl border border-gray-200 p-6 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-retro font-black uppercase text-gray-400 ml-1">Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-12 bg-white rounded-xl border border-gray-200 px-4 text-xs font-bold focus:ring-2 focus:ring-[#EAFF00] transition-all outline-none"
                >
                  <option>Travel</option>
                  <option>Food</option>
                  <option>Office Supplies</option>
                  <option>Internet</option>
                  <option>Hardware</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-retro font-black uppercase text-gray-400 ml-1">Amount (₹)</label>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-12 bg-white rounded-xl border border-gray-200 px-4 text-xs font-bold focus:ring-2 focus:ring-[#EAFF00] transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-retro font-black uppercase text-gray-400 ml-1">Merchant / Vendor</label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="e.g. Starbucks, Uber"
                  className="w-full h-12 bg-white rounded-xl border border-gray-200 pl-11 pr-4 text-xs font-bold focus:ring-2 focus:ring-[#EAFF00] transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-retro font-black uppercase text-gray-400 ml-1">Purpose / Note</label>
              <textarea 
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Briefly describe the expense..."
                className="w-full min-h-[80px] bg-white rounded-xl border border-gray-200 p-4 text-xs font-bold focus:ring-2 focus:ring-[#EAFF00] transition-all outline-none resize-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-retro font-black uppercase text-gray-400 ml-1">Payment Mode</label>
              <div className="flex gap-2">
                {['UPI', 'Card', 'Cash'].map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`flex-1 h-10 rounded-xl text-[10px] font-retro font-black uppercase tracking-wider border transition-all ${
                      paymentMode === mode 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-retro font-black uppercase text-gray-400 ml-1">Screenshot / Receipt</label>
              <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className={`h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                  previewUrl ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200 group-hover:border-[#EAFF00] group-hover:bg-[#EAFF00]/5'
                }`}>
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="h-full w-full object-contain rounded-xl p-2" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-300 mb-2" />
                      <span className="text-[10px] font-retro font-black uppercase text-gray-400">Click to Upload Image</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 bg-black text-white rounded-2xl font-retro font-black uppercase tracking-[0.2em] shadow-xl hover:bg-gray-900 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
              <span>{isSubmitting ? 'Submitting...' : 'Submit Claim'}</span>
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-retro font-black uppercase text-gray-400 tracking-widest px-1">
          <History className="w-3 h-3" />
          <span>Recent Activity</span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <span className="text-xs font-bold uppercase tracking-widest">Retrieving ledger...</span>
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200 grayscale opacity-50">
            <Receipt className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-xs font-retro font-black uppercase tracking-tight text-gray-400">No claims filed yet</p>
          </div>
        ) : (
          expenses.map((expense) => (
            <motion.div
              key={expense.id}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                    <DollarSign className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-900 leading-tight">{expense.merchant_name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-retro font-black uppercase text-gray-400">{expense.category}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-200" />
                      <span className="text-[10px] font-mono text-gray-400">{expense.expense_date}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">₹{expense.amount.toFixed(2)}</p>
                  <div className={`mt-1 text-[9px] font-retro font-black uppercase tracking-widest border rounded-full px-2 py-0.5 ${getStatusColor(expense.status)}`}>
                    {expense.status}
                  </div>
                </div>
              </div>
              
              <p className="mt-3 text-xs text-gray-500 font-medium line-clamp-2 px-1">
                {expense.purpose}
              </p>

              {expense.screenshot_url && (
                <div className="mt-3 flex items-center gap-2 text-[10px] font-retro font-black uppercase text-[#EAFF00] bg-black/90 p-2 rounded-xl border border-black cursor-pointer hover:bg-black group transition-all">
                  <ImageIcon className="w-3 h-3" />
                  <span>View Proof of Transaction</span>
                  <ChevronRight className="w-3 h-3 ml-auto opacity-50 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
