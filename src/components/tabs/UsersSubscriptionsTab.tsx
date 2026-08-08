import React, { useState } from 'react';
import {
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  Crown,
  Phone,
  Mail,
  Award,
  RefreshCw,
  Plus,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { UserProfile, CadreTier } from '../../types';
import { useToast } from '../Toast';

interface Props {
  users: UserProfile[];
  onToggleVip: (userId: string, currentVip: boolean) => Promise<void>;
}

export const UsersSubscriptionsTab: React.FC<Props> = ({ users, onToggleVip }) => {
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('All');

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    const matchesSearch =
      u.full_name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.phone && u.phone.includes(term));

    const matchesTier = selectedTier === 'All' || u.target_cadre === selectedTier;

    return matchesSearch && matchesTier;
  });

  const handleToggleVipClick = async (u: UserProfile) => {
    try {
      await onToggleVip(u.id, u.is_vip);
      showToast(
        u.is_vip ? 'Downgraded' : 'Upgraded to VIP!',
        `"${u.full_name}" এর ভিআইপি সাবস্ক্রিপশন স্ট্যাটাস আপডেট হয়েছে।`,
        'success'
      );
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-white font-serif flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            শিক্ষার্থী ও ভিআইপি সাবস্ক্রিপশন গ্যালারি ({users.length} জন)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            শিক্ষার্থীদের মোবাইল নম্বর, এনটিআরসিএ ক্যাডার ক্যাটাগরি ও ভিআইপি প্রিমিয়াম সদস্যপদ পরিচালনা করুন।
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="নাম, ইমেইল বা মোবাইল নম্বর দিয়ে খুঁজুন..."
            className="w-full bg-slate-900 text-slate-100 text-xs rounded-xl pl-9 pr-4 py-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <select
          value={selectedTier}
          onChange={(e) => setSelectedTier(e.target.value)}
          className="bg-slate-900 text-slate-200 text-xs rounded-xl px-3 py-2.5 border border-slate-800 focus:border-emerald-500 focus:outline-none"
        >
          <option value="All">সব ক্যাডার ক্যাটাগরি (All Cadres)</option>
          <option value="প্রভাষক (আরবি)">প্রভাষক (আরবি)</option>
          <option value="সহকারী শিক্ষক (আরবি)">সহকারী শিক্ষক (আরবি)</option>
          <option value="সহকারী মৌলভী">সহকারী মৌলভী</option>
          <option value="ইবতেদায়ী প্রধান">ইবতেদায়ী প্রধান</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-5 py-3">শিক্ষার্থীর নাম &amp; বিবরণ</th>
                <th className="px-5 py-3">যোগাযোগ</th>
                <th className="px-5 py-3">এনটিআরসিএ ক্যাডার</th>
                <th className="px-5 py-3">ভিআইপি স্ট্যাটাস</th>
                <th className="px-5 py-3">পরীক্ষা এটেম্পট</th>
                <th className="px-5 py-3 text-right">এক্সেস পরিবর্তন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center justify-center font-bold text-sm">
                        {u.full_name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{u.full_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {u.id.slice(0, 8)}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 space-y-0.5 font-mono">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{u.email}</span>
                    </div>
                    {u.phone && (
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{u.phone}</span>
                      </div>
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-amber-300 border border-slate-700 font-medium text-[11px]">
                      {u.target_cadre}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    {u.is_vip ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-[11px]">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        VIP Active ({u.vip_expiry || 'অসীম'})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[11px]">
                        ফ্রি অ্যাকাউন্ট (Free)
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 font-mono text-slate-300">
                    <div className="font-bold">{u.total_attempts || 0}টি সম্পূর্ণ</div>
                    <div className="text-[10px] text-emerald-400">গড় স্কোার: {u.average_score || 0}%</div>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => handleToggleVipClick(u)}
                      className={`px-3 py-1.5 rounded-xl font-semibold text-xs transition-all shadow-sm active:scale-95 ${
                        u.is_vip
                          ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950'
                      }`}
                    >
                      {u.is_vip ? 'VIP বাতিল করুন' : 'VIP মেম্বারশিপ দিন'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
