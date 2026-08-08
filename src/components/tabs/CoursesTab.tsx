import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  Video,
  FileText,
  HelpCircle,
  Users,
  Tag,
  Check,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles
} from 'lucide-react';
import { Course, CourseModule, CourseLesson, Subject, CadreTier } from '../../types';
import { useToast } from '../Toast';

interface Props {
  courses: Course[];
  onSaveCourse: (course: Omit<Course, 'id' | 'created_at'> & { id?: string }) => Promise<void>;
}

export const CoursesTab: React.FC<Props> = ({ courses, onSaveCourse }) => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Course, 'id' | 'created_at' | 'enrolled_count'> & { id?: string }>({
    id: undefined,
    title: '',
    description: '',
    subject: 'বালাগাত ও মানতিক' as Subject,
    cadre_tier: 'প্রভাষক (আরবি)' as CadreTier,
    price_monthly: 299,
    price_6month: 999,
    price_annual: 1499,
    image_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800',
    is_published: true,
    modules: []
  });

  const subjectsList: Subject[] = [
    'বালাগাত ও মানতিক',
    'আল-কুরআন',
    'হাদিস',
    'ফিকহ্ ও উসুল',
    'বাংলা',
    'ইংরেজি',
    'আইসিটি ও সাধারণ জ্ঞান'
  ];

  const cadreTiersList: CadreTier[] = [
    'প্রভাষক (আরবি)',
    'সহকারী শিক্ষক (আরবি)',
    'সহকারী মৌলভী',
    'ইবতেদায়ী প্রধান'
  ];

  const handleOpenCreate = () => {
    setFormData({
      id: undefined,
      title: '',
      description: '',
      subject: 'বালাগাত ও মানতিক',
      cadre_tier: 'প্রভাষক (আরবি)',
      price_monthly: 299,
      price_6month: 999,
      price_annual: 1499,
      image_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800',
      is_published: true,
      modules: [
        {
          id: 'm-' + Date.now(),
          title: 'মডিউল ১: মৌলিক প্রস্তুতি ও সিলেবাস আলোচনা',
          lessons: [
            { id: 'l-1', title: 'লেকচার ০১: পরিচিতি ও প্রশ্নের ধরন বিশ্লেষণ', video_url: 'https://youtube.com', is_free_preview: true }
          ]
        }
      ]
    });
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (course: Course) => {
    setFormData({
      id: course.id,
      title: course.title,
      description: course.description,
      subject: course.subject,
      cadre_tier: course.cadre_tier,
      price_monthly: course.price_monthly,
      price_6month: course.price_6month,
      price_annual: course.price_annual,
      image_url: course.image_url,
      is_published: course.is_published,
      modules: course.modules || []
    });
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const handleAddModule = () => {
    const newMod: CourseModule = {
      id: 'm-' + Date.now(),
      title: `মডিউল ${formData.modules.length + 1}: নতুন অধ্যায়`,
      lessons: []
    };
    setFormData({ ...formData, modules: [...formData.modules, newMod] });
  };

  const handleAddLesson = (moduleIdx: number) => {
    const updated = [...formData.modules];
    const newLesson: CourseLesson = {
      id: 'l-' + Date.now(),
      title: 'নতুন লেকচার শিরোনাম',
      video_url: '',
      pdf_url: '',
      is_free_preview: false
    };
    updated[moduleIdx].lessons.push(newLesson);
    setFormData({ ...formData, modules: updated });
  };

  const handleUpdateLesson = (moduleIdx: number, lessonIdx: number, field: keyof CourseLesson, value: any) => {
    const updated = [...formData.modules];
    updated[moduleIdx].lessons[lessonIdx] = {
      ...updated[moduleIdx].lessons[lessonIdx],
      [field]: value
    };
    setFormData({ ...formData, modules: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Error', 'কোর্সের শিরোনাম টাইপ করুন', 'error');
      return;
    }

    try {
      await onSaveCourse({
        ...formData,
        enrolled_count: editingCourse ? editingCourse.enrolled_count : 0
      });
      showToast('Course Saved', `"${formData.title}" সফলভাবে সেভ করা হয়েছে।`, 'success');
      setIsModalOpen(false);
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
            <GraduationCap className="w-6 h-6 text-emerald-400" />
            কোর্স, লাইভ ব্যাচ ও সাবস্ক্রিপশন প্ল্যান
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            মডিউল, লেকচার ভিডিও, পিডিএফ লেকচার শিট ও মান্থলি/বার্ষিক প্রাইসিং কনফিগার করুন।
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন কোর্স লঞ্চ করুন</span>
        </button>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all group"
          >
            {/* Banner Image & Overlay */}
            <div className="relative h-44 overflow-hidden bg-slate-950">
              <img
                src={course.image_url}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/30 font-semibold">
                  {course.subject}
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-500/30 font-semibold">
                  {course.cadre_tier}
                </span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                <span className="flex items-center gap-1 font-medium text-emerald-400">
                  <Users className="w-3.5 h-3.5" />
                  {course.enrolled_count || 0} জন শিক্ষার্থী এনরোল্ড
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950/80 text-slate-300">
                  {course.modules?.length || 0}টি মডিউল
                </span>
              </div>
            </div>

            {/* Course Content Body */}
            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white font-serif leading-snug group-hover:text-emerald-300 transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {course.description}
                </p>
              </div>

              {/* Pricing Cards */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-center font-mono">
                <div>
                  <div className="text-[10px] text-slate-400">মাসিক (Monthly)</div>
                  <div className="text-sm font-bold text-white">৳{course.price_monthly}</div>
                </div>
                <div className="border-x border-slate-800">
                  <div className="text-[10px] text-slate-400">৬-মাস (6-Month)</div>
                  <div className="text-sm font-bold text-emerald-400">৳{course.price_6month}</div>
                </div>
                <div>
                  <div className="text-[10px] text-amber-400 font-semibold">বার্ষিক VIP</div>
                  <div className="text-sm font-bold text-amber-300">৳{course.price_annual}</div>
                </div>
              </div>

              {/* Course Action Row */}
              <div className="flex items-center justify-between pt-2">
                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full border ${
                    course.is_published
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {course.is_published ? 'লাইভ অ্যাক্টিভ' : 'ড্রাফট'}
                </span>

                <button
                  onClick={() => handleOpenEdit(course)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  মডিউল ও ফি এডিট
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT COURSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white font-serif flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-400" />
              {editingCourse ? 'কোর্স ও লেকচার এডিটর' : 'নতুন কোর্স তৈরি করুন'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">কোর্স শিরোনাম *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="যেমন: NTRCA প্রভাষক (আরবি) মাস্টার ব্যাচ ২০২৬"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">কভার ইমেজ ইউআরএল</label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">কোর্স বিবরণী</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="কোর্সের মূল আকর্ষণ ও সুবিধা সংক্ষেপে লিখুন..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">বিষয় (Subject)</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value as Subject })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    {subjectsList.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">ক্যাডার টার্গেট</label>
                  <select
                    value={formData.cadre_tier}
                    onChange={(e) => setFormData({ ...formData, cadre_tier: e.target.value as CadreTier })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    {cadreTiersList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing Plan Editor */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-emerald-400" />
                  সাবস্ক্রিপশন ফি ম্যানেজার (Subscription Pricing)
                </h4>
                <div className="grid grid-cols-3 gap-3 font-mono">
                  <div>
                    <label className="block text-[11px] text-slate-400">মাসিক ফি (৳)</label>
                    <input
                      type="number"
                      value={formData.price_monthly}
                      onChange={(e) => setFormData({ ...formData, price_monthly: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400">৬-মাসের ফি (৳)</label>
                    <input
                      type="number"
                      value={formData.price_6month}
                      onChange={(e) => setFormData({ ...formData, price_6month: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-emerald-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-amber-400">বার্ষিক VIP ফি (৳)</label>
                    <input
                      type="number"
                      value={formData.price_annual}
                      onChange={(e) => setFormData({ ...formData, price_annual: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-amber-300 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* MODULE & LESSON HIERARCHY EDITOR */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white">কোর্স মডিউল ও লেকচার সমাহার</h4>
                  <button
                    type="button"
                    onClick={handleAddModule}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    নতুন মডিউল যোগ
                  </button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                  {formData.modules.map((mod, mIdx) => (
                    <div key={mod.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={mod.title}
                          onChange={(e) => {
                            const updated = [...formData.modules];
                            updated[mIdx].title = e.target.value;
                            setFormData({ ...formData, modules: updated });
                          }}
                          className="bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-lg px-2.5 py-1.5 font-bold w-full max-w-md focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddLesson(mIdx)}
                          className="text-[10px] text-emerald-400 hover:underline font-medium"
                        >
                          + লেকচার যোগ করুন
                        </button>
                      </div>

                      {/* Lessons List */}
                      <div className="space-y-2 pl-3 border-l-2 border-slate-800">
                        {mod.lessons.map((les, lIdx) => (
                          <div key={les.id} className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80 space-y-1.5">
                            <input
                              type="text"
                              value={les.title}
                              onChange={(e) => handleUpdateLesson(mIdx, lIdx, 'title', e.target.value)}
                              placeholder="লেকচার শিরোনাম..."
                              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-[11px]"
                            />
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <input
                                type="text"
                                value={les.video_url || ''}
                                onChange={(e) => handleUpdateLesson(mIdx, lIdx, 'video_url', e.target.value)}
                                placeholder="ভিডিও লিংক (YouTube/Vimeo)"
                                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 font-mono"
                              />
                              <input
                                type="text"
                                value={les.pdf_url || ''}
                                onChange={(e) => handleUpdateLesson(mIdx, lIdx, 'pdf_url', e.target.value)}
                                placeholder="পিডিএফ নোট লিংক"
                                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-300 font-mono"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md"
                >
                  কোর্স সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
