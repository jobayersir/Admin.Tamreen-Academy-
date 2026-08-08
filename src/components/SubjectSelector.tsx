import React, { useState } from 'react';
import { Plus, Check, X, FolderPlus } from 'lucide-react';
import { DEFAULT_SUBJECTS } from '../types';

interface SubjectSelectorProps {
  selectedSubject: string;
  onChangeSubject: (subject: string) => void;
  customSubjects: string[];
  onAddCustomSubject: (subject: string) => void;
  label?: string;
  className?: string;
}

export const SubjectSelector: React.FC<SubjectSelectorProps> = ({
  selectedSubject,
  onChangeSubject,
  customSubjects = [],
  onAddCustomSubject,
  label = 'বিষয় (Subject)',
  className = ''
}) => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');

  // Combine default subjects with unique custom subjects
  const allSubjects = Array.from(new Set([...DEFAULT_SUBJECTS, ...customSubjects]));

  const handleAddNewSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSubjectName.trim();
    if (!trimmed) return;

    if (!allSubjects.includes(trimmed)) {
      onAddCustomSubject(trimmed);
    }
    onChangeSubject(trimmed);
    setNewSubjectName('');
    setIsAddingNew(false);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between">
        {label && <label className="block text-slate-300 font-medium text-xs mb-0.5">{label}</label>}
        {!isAddingNew && (
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5 hover:underline"
          >
            <Plus className="w-3 h-3" />
            <span>নতুন বিষয় যোগ</span>
          </button>
        )}
      </div>

      {!isAddingNew ? (
        <select
          value={selectedSubject}
          onChange={(e) => onChangeSubject(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 text-xs focus:border-emerald-500 focus:outline-none"
        >
          {allSubjects.map((s) => (
            <option key={s} value={s}>
              {s} {DEFAULT_SUBJECTS.includes(s) ? '' : ' (কাস্টম)'}
            </option>
          ))}
        </select>
      ) : (
        <form onSubmit={handleAddNewSubjectSubmit} className="flex items-center gap-1.5 animate-in fade-in">
          <input
            type="text"
            value={newSubjectName}
            onChange={(e) => setNewSubjectName(e.target.value)}
            placeholder="নতুন বিষয়ের নাম লিখুন..."
            className="flex-1 bg-slate-950 border border-emerald-500 rounded-xl px-2.5 py-1.5 text-slate-100 text-xs focus:outline-none font-medium"
            autoFocus
            required
          />
          <button
            type="submit"
            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            title="সেভ করুন"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsAddingNew(false)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="বাতিল"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      )}
    </div>
  );
};
