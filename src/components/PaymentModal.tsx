import React, { useState } from 'react';
import {
  CreditCard,
  X,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Copy,
  DollarSign,
  ShieldCheck,
  Send,
  PhoneCall,
  User,
  Sparkles
} from 'lucide-react';
import { PaymentTransaction, UserProfile } from '../types';
import { useToast } from './Toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  payments: PaymentTransaction[];
  users: UserProfile[];
  onAddPayment: (payment: Omit<PaymentTransaction, 'id' | 'created_at'>) => Promise<void>;
  onUpdatePaymentStatus: (paymentId: string, status: 'verified' | 'rejected') => Promise<void>;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  payments,
  users,
  onAddPayment,
  onUpdatePaymentStatus
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');

  // Form State
  const [formData, setFormData] = useState({
    student_name: '',
    student_phone: '',
    student_email: '',
    payment_method: 'bKash' as 'bKash' | 'Nagad' | 'Rocket' | 'Bank' | 'Cash',
    transaction_id: '',
    amount: 999,
    plan_name: '৬ মাস মাস্টার ব্যাচ (৳৯৯৯)',
    notes: ''
  });

  if (!isOpen) return null;

  const filteredPayments = payments.filter((p) => {
    const term = search.toLowerCase();
    const matchesSearch =
      p.student_name.toLowerCase().includes(term) ||
      p.student_phone.includes(term) ||
      p.student_email.toLowerCase().includes(term) ||
      p.transaction_id.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalVerifiedRevenue = payments
    .filter((p) => p.status === 'verified')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingCount = payments.filter((p) => p.status === 'pending').length;

  const handleQuickSelectUser = (email: string) => {
    const found = users.find((u) => u.email === email);
    if (found) {
      setFormData((prev) => ({
        ...prev,
        student_name: found.full_name || found.name,
        student_phone: found.phone || '',
        student_email: found.email
      }));
    }
  };

  const handleSubmitNewPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.student_name.trim() || !formData.transaction_id.trim()) {
      showToast('Error', 'শিক্ষার্থীর নাম ও ট্রানজেকশন আইডি (TrxID) দিন', 'error');
      return;
    }

    try {
      await onAddPayment({
        ...formData,
        status: 'verified' // Manual addition by admin auto-verifies
      });
      showToast('Payment Recorded', 'ম্যানুয়াল পেমেন্ট সফলভাবে সংরক্ষিত এবং অনুমোদিত হয়েছে।', 'success');
      setFormData({
        student_name: '',
        student_phone: '',
        student_email: '',
        payment_method: 'bKash',
        transaction_id: '',
        amount: 999,
        plan_name: '৬ মাস মাস্টার ব্যাচ (৳৯৯৯)',
        notes: ''
      });
      setActiveTab('list');
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleStatusChange = async (p: PaymentTransaction, newStatus: 'verified' | 'rejected') => {
    try {
      await onUpdatePaymentStatus(p.id, newStatus);
      showToast(
        newStatus === 'verified' ? 'Approved & VIP Activated' : 'Payment Rejected',
        `পেমেন্ট #${p.transaction_id.slice(0, 8)} স্ট্যাটাস পরিবর্তন করা হয়েছে।`,
        newStatus === 'verified' ? 'success' : 'info'
      );
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  const copyBkashNumber = () => {
    navigator.clipboard.writeText('01700000000');
    showToast('Copied', 'বিকাশ মার্চেন্ট নম্বর কপি করা হয়েছে (01700000000)', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[92vh] flex flex-col space-y-5">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-10">
          <div>
            <h2 className="text-xl font-bold text-white font-serif flex items-center gap-2.5">
              <CreditCard className="w-6 h-6 text-emerald-400" />
              পেমেন্ট ভেরিফিকেশন ও ট্রানজেকশন হাব (Payment CMS)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              বিকাশ, নগদ ও রকেটের ম্যানুয়াল ট্রানজেকশন অনুমোদন করুন এবং ভিআইপি এক্সেস কনফিম করুন।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'list'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              ট্রানজেকশন তালিকা ({payments.length})
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'add'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন ম্যানুয়াল পেমেন্ট</span>
            </button>
          </div>
        </div>

        {/* Top Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">মোট অনুমোদিত আয়</div>
              <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">৳{totalVerifiedRevenue.toLocaleString()}</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-bold">
              ৳
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold">অপেক্ষমান ট্রানজেকশন</div>
              <div className="text-lg font-bold text-amber-300 font-mono mt-0.5">{pendingCount}টি পেন্ডিং</div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-950 text-amber-400 border border-amber-800 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">বিকাশ/নগদ মার্চেন্ট</div>
              <div className="text-xs font-bold text-slate-200 font-mono mt-1 flex items-center gap-1.5">
                <span>01700000000</span>
                <button onClick={copyBkashNumber} className="text-emerald-400 hover:text-emerald-300">
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 border border-slate-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab 1: Transaction List */}
        {activeTab === 'list' && (
          <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="নাম, ফোন নম্বর বা TrxID দিয়ে খুঁজুন..."
                  className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl pl-9 pr-4 py-2 border border-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-slate-950 text-slate-200 text-xs rounded-xl px-3 py-2 border border-slate-800 focus:border-emerald-500 focus:outline-none"
              >
                <option value="all">সব স্ট্যাটাস (All Status)</option>
                <option value="pending">অপেক্ষমান (Pending)</option>
                <option value="verified">অনুমোদিত (Verified)</option>
                <option value="rejected">বাতিল (Rejected)</option>
              </select>
            </div>

            {/* Table Area */}
            <div className="flex-1 overflow-y-auto border border-slate-800 rounded-2xl bg-slate-950/60 scrollbar-thin scrollbar-thumb-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3">শিক্ষার্থী &amp; যোগাযোগ</th>
                    <th className="px-4 py-3">পেমেন্ট মেথড &amp; TrxID</th>
                    <th className="px-4 py-3">প্ল্যান &amp; পরিমাণ</th>
                    <th className="px-4 py-3">স্ট্যাটাস</th>
                    <th className="px-4 py-3 text-right">অ্যাকশন (Approve)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-white text-sm">{p.student_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{p.student_phone} • {p.student_email}</div>
                      </td>

                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.payment_method === 'bKash' ? 'bg-pink-950 text-pink-300 border border-pink-800' :
                          p.payment_method === 'Nagad' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                          'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {p.payment_method}
                        </span>
                        <div className="text-xs font-mono text-emerald-300 font-semibold mt-1">
                          TrxID: {p.transaction_id}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-xs text-slate-200 font-medium">{p.plan_name}</div>
                        <div className="text-sm font-bold text-emerald-400 font-mono">৳{p.amount}</div>
                      </td>

                      <td className="px-4 py-3">
                        {p.status === 'verified' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            অনুমোদিত (VIP)
                          </span>
                        )}
                        {p.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[11px] font-semibold">
                            <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                            পেন্ডিং যাঁচাই
                          </span>
                        )}
                        {p.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[11px] font-semibold">
                            <XCircle className="w-3.5 h-3.5 text-rose-400" />
                            বাতিল করা হয়েছে
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {p.status !== 'verified' && (
                          <button
                            onClick={() => handleStatusChange(p, 'verified')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-sm active:scale-95 mr-1"
                          >
                            অনুমোদন &amp; VIP অ্যাক্টিভ
                          </button>
                        )}
                        {p.status === 'pending' && (
                          <button
                            onClick={() => handleStatusChange(p, 'rejected')}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-rose-300 hover:border hover:border-rose-800 font-medium text-xs transition-colors"
                          >
                            বাতিল
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPayments.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs">
                  কোনো পেমেন্ট রেকর্ডিং পাওয়া যায়নি।
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Manual Payment Form */}
        {activeTab === 'add' && (
          <form onSubmit={handleSubmitNewPayment} className="space-y-4 text-xs overflow-y-auto pr-1">
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <label className="block text-slate-300 font-medium">দ্রুত শিক্ষার্থী নির্বাচন করুন (Quick Select Registered Student)</label>
              <div className="flex flex-wrap gap-2">
                {users.slice(0, 6).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickSelectUser(u.email)}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-[11px] flex items-center gap-1.5"
                  >
                    <User className="w-3 h-3 text-emerald-400" />
                    <span>{u.full_name} ({u.phone || 'মোবাইল নেই'})</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">শিক্ষার্থীর নাম *</label>
                <input
                  type="text"
                  value={formData.student_name}
                  onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                  placeholder="যেমন: মাও. জোবায়ের হোসাইন"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">মোবাইল নম্বর *</label>
                <input
                  type="text"
                  value={formData.student_phone}
                  onChange={(e) => setFormData({ ...formData, student_phone: e.target.value })}
                  placeholder="017xxxxxxxx"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ইমেইল ঠিকানা</label>
                <input
                  type="email"
                  value={formData.student_email}
                  onChange={(e) => setFormData({ ...formData, student_email: e.target.value })}
                  placeholder="student@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">পেমেন্ট মেথড</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none font-semibold"
                >
                  <option value="bKash">bKash (বিকাশ মার্চেন্ট)</option>
                  <option value="Nagad">Nagad (নগদ)</option>
                  <option value="Rocket">Rocket (রকেট)</option>
                  <option value="Bank">Bank Transfer</option>
                  <option value="Cash">ক্যাশ / সরাসরি পেমেন্ট</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">ট্রানজেকশন আইডি (TrxID) *</label>
                <input
                  type="text"
                  value={formData.transaction_id}
                  onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                  placeholder="যেমন: BK202688991X"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-emerald-300 font-mono focus:border-emerald-500 focus:outline-none font-bold uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">পেমেন্ট পরিমাণ (৳) *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">সাবস্ক্রিপশন প্ল্যান / কোর্স সিলেক্ট করুন</label>
                <select
                  value={formData.plan_name}
                  onChange={(e) => setFormData({ ...formData, plan_name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="১ মাস প্রাইমারি প্যাক (৳২৯৯)">১ মাস প্রাইমারি প্যাক (৳২৯৯)</option>
                  <option value="৬ মাস মাস্টার ব্যাচ (৳৯৯৯)">৬ মাস মাস্টার ব্যাচ (৳৯৯৯)</option>
                  <option value="১ বছর ফুল স্পেশাল VIP (৳১৪৯৯)">১ বছর ফুল স্পেশাল VIP (৳১৪৯৯)</option>
                  <option value="ম্যানুয়াল কাস্টম প্যাক">ম্যানুয়াল কাস্টম প্যাক</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">নোট / বিশেষ নির্দেশনা (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="যেমন: সরাসরি বিকাশ পার্সোনাল থেকে ৯৯৯ টাকা ক্যাশ-ইন করা হয়েছে"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                পেমেন্ট সেভ ও VIP অ্যাক্টিভ করুন
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
