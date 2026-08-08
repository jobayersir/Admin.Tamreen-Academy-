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
  Sparkles,
  BookOpen,
  Clock,
  Award,
  Layers,
  Database,
  CheckCircle2,
  ListPlus
} from 'lucide-react';
import {
  Course,
  CourseModule,
  CourseLesson,
  CourseModuleQuestion,
  Question,
  CadreTier,
  Difficulty
} from '../../types';
import { SubjectSelector } from '../SubjectSelector';
import { useToast } from '../Toast';

interface Props {
  courses: Course[];
  masterQuestions?: Question[];
  customSubjects: string[];
  onAddCustomSubject: (subject: string) => void;
  onSaveCourse: (course: Omit<Course, 'id' | 'created_at'> & { id?: string }) => Promise<void>;
}

export const CoursesTab: React.FC<Props> = ({
  courses,
  masterQuestions = [],
  customSubjects,
  onAddCustomSubject,
  onSaveCourse
}) => {
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Active Module Question Modal state
  const [activeQuestionModule, setActiveQuestionModule] = useState<{
    courseId?: string;
    moduleIndex: number;
    moduleTitle: string;
  } | null>(null);

  // Question Creator inside Module state
  const [isModuleQuestionFormOpen, setIsModuleQuestionFormOpen] = useState(false);
  const [moduleQuestionForm, setModuleQuestionForm] = useState<CourseModuleQuestion>({
    id: '',
    question_bn: '',
    question_ar: '',
    options: ['', '', '', ''],
    correct_option: 0,
    explanation: '',
    subject: 'বালাগাত ও মানতিক',
    topic: 'সাধারণ',
    time_limit_seconds: 60,
    marks: 1,
    cadre_tier: 'প্রভাষক (আরবি)',
    difficulty: 'মাঝারি'
  });

  // Course Form State
  const [formData, setFormData] = useState<Omit<Course, 'id' | 'created_at' | 'enrolled_count'> & { id?: string }>({
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
    modules: []
  });

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
          title: 'মডিউল ১: মৌলিক প্রস্তুতি ও বিষয়ভিত্তিক সিলেবাস',
          description: 'প্রাথমিক গাইডলাইন ও ব্যাখ্যামূলক প্রশ্নমালা',
          subject: 'বালাগাত ও মানতিক',
          topic: 'মূল সিলেবাস বিশ্লেষণ',
          time_limit_minutes: 30,
          total_marks: 20,
          lessons: [
            { id: 'l-1', title: 'লেকচার ০১: পরিচিতি ও প্রশ্নের ধরন বিশ্লেষণ', video_url: 'https://youtube.com', is_free_preview: true }
          ],
          questions: []
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
      title: `মডিউল ${formData.modules.length + 1}: নতুন অধ্যায় ও সিলেবাস`,
      description: 'অধ্যায়ের বিস্তারিত পাঠসূচি',
      subject: formData.subject,
      topic: 'সাধারণ আলোচনা',
      time_limit_minutes: 45,
      total_marks: 25,
      lessons: [],
      questions: []
    };
    setFormData({ ...formData, modules: [...formData.modules, newMod] });
  };

  const handleRemoveModule = (mIdx: number) => {
    if (confirm('আপনি কি নিশ্চিত যে এই মডিউলটি মুছে ফেলতে চান?')) {
      const updated = formData.modules.filter((_, idx) => idx !== mIdx);
      setFormData({ ...formData, modules: updated });
    }
  };

  const handleAddLesson = (moduleIdx: number) => {
    const updated = [...formData.modules];
    const newLesson: CourseLesson = {
      id: 'l-' + Date.now(),
      title: 'নতুন লেকচার শিরোনাম',
      video_url: '',
      pdf_url: '',
      is_free_preview: false,
      duration_minutes: 30
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

  // Open Question Manager for a specific module
  const handleOpenModuleQuestionManager = (mIdx: number) => {
    setActiveQuestionModule({
      moduleIndex: mIdx,
      moduleTitle: formData.modules[mIdx].title
    });
    setIsModuleQuestionFormOpen(false);
  };

  // Save new Question to active module
  const handleAddQuestionToActiveModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuestionModule) return;
    if (!moduleQuestionForm.question_bn.trim()) {
      showToast('Error', 'প্রশ্ন বাংলা টেক্সট লিখুন', 'error');
      return;
    }

    const mIdx = activeQuestionModule.moduleIndex;
    const updatedModules = [...formData.modules];
    const existingQuestions = updatedModules[mIdx].questions || [];

    const newQuestion: CourseModuleQuestion = {
      ...moduleQuestionForm,
      id: 'mq-' + Date.now()
    };

    updatedModules[mIdx].questions = [...existingQuestions, newQuestion];
    setFormData({ ...formData, modules: updatedModules });

    showToast('Question Added', `"${moduleQuestionForm.question_bn.slice(0, 30)}..." মডিউলে যুক্ত হয়েছে।`, 'success');
    
    // Reset question form
    setModuleQuestionForm({
      id: '',
      question_bn: '',
      question_ar: '',
      options: ['', '', '', ''],
      correct_option: 0,
      explanation: '',
      subject: formData.modules[mIdx].subject || formData.subject,
      topic: formData.modules[mIdx].topic || 'সাধারণ',
      time_limit_seconds: 60,
      marks: 1,
      cadre_tier: formData.cadre_tier,
      difficulty: 'মাঝারি'
    });
    setIsModuleQuestionFormOpen(false);
  };

  const handleImportMasterQuestion = (q: Question) => {
    if (!activeQuestionModule) return;
    const mIdx = activeQuestionModule.moduleIndex;
    const updatedModules = [...formData.modules];
    const existingQuestions = updatedModules[mIdx].questions || [];

    const newQuestion: CourseModuleQuestion = {
      id: 'mq-' + Date.now(),
      question_bn: q.question_bn,
      question_ar: q.question_ar,
      options: [...q.options] as [string, string, string, string],
      correct_option: q.correct_option,
      explanation: q.explanation,
      subject: q.subject,
      topic: q.topic || 'সাধারণ',
      time_limit_seconds: q.time_limit_seconds || 60,
      marks: q.marks || 1,
      cadre_tier: q.cadre_tier,
      difficulty: q.difficulty
    };

    updatedModules[mIdx].questions = [...existingQuestions, newQuestion];
    setFormData({ ...formData, modules: updatedModules });
    showToast('Imported', 'প্রশ্নটি মাস্টার প্রশ্ন ব্যাংক থেকে মডিউলে যোগ করা হয়েছে।', 'success');
  };

  const handleRemoveModuleQuestion = (qId: string) => {
    if (!activeQuestionModule) return;
    const mIdx = activeQuestionModule.moduleIndex;
    const updatedModules = [...formData.modules];
    updatedModules[mIdx].questions = (updatedModules[mIdx].questions || []).filter(q => q.id !== qId);
    setFormData({ ...formData, modules: updatedModules });
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-md">
        <div>
          <h2 className="text-xl font-bold text-white font-serif flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-400" />
            কোর্স, মডিউল ও লাইভ ব্যাচ ম্যানেজার
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            কোর্স মডিউল তৈরি করুন, মডিউলভিত্তিক প্রশ্ন ও সময়সূচি এড করুন এবং সাবস্ক্রিপশন ফি কনফিগার করুন।
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

              <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
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
                  {course.enrolled_count || 0} জন শিক্ষার্থী
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-950/80 text-slate-300 border border-slate-700">
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

              {/* Modules Summary */}
              {course.modules && course.modules.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    <span>কোর্স মডিউলসমূহ:</span>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    {course.modules.slice(0, 3).map((mod) => (
                      <div
                        key={mod.id}
                        className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-[11px] flex items-center justify-between"
                      >
                        <span className="text-slate-200 font-medium truncate">{mod.title}</span>
                        <span className="text-[10px] font-mono text-emerald-400 shrink-0 ml-2">
                          {mod.questions?.length || 0}টি প্রশ্ন
                        </span>
                      </div>
                    ))}
                    {course.modules.length > 3 && (
                      <div className="text-[10px] text-slate-400 text-center">
                        + আরো {course.modules.length - 3}টি মডিউল...
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  মডিউল ও প্রশ্ন এডিট করুন
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN CREATE / EDIT COURSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto space-y-5">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-white font-serif flex items-center gap-2.5">
              <GraduationCap className="w-6 h-6 text-emerald-400" />
              {editingCourse ? 'কোর্স, মডিউল ও প্রশ্ন এডিটর' : 'নতুন কোর্স তৈরি ও লঞ্চ করুন'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Basic Details */}
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
                {/* Subject Selector with Custom Subject option */}
                <SubjectSelector
                  selectedSubject={formData.subject}
                  onChangeSubject={(s) => setFormData({ ...formData, subject: s })}
                  customSubjects={customSubjects}
                  onAddCustomSubject={onAddCustomSubject}
                  label="প্রধান বিষয় (Subject)"
                />

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
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="font-semibold text-white flex items-center gap-1.5 text-sm">
                  <Tag className="w-4 h-4 text-emerald-400" />
                  সাবস্ক্রিপশন ফি কনফিগারেশন (Subscription Pricing)
                </h4>
                <div className="grid grid-cols-3 gap-3 font-mono">
                  <div>
                    <label className="block text-[11px] text-slate-400">মাসিক ফি (৳)</label>
                    <input
                      type="number"
                      value={formData.price_monthly}
                      onChange={(e) => setFormData({ ...formData, price_monthly: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400">৬-মাসের ফি (৳)</label>
                    <input
                      type="number"
                      value={formData.price_6month}
                      onChange={(e) => setFormData({ ...formData, price_6month: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-emerald-400 font-bold"
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

              {/* MODULE HIERARCHY & QUESTIONS EDITOR */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      কোর্স মডিউল ও প্রশ্নাবলি সমাহার ({formData.modules.length}টি মডিউল)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      মডিউলে ক্লিক করে লেকচার ভিডিও এবং বিষয়ভিত্তিক প্রশ্নাবলী যুক্ত করুন।
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddModule}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    নতুন মডিউল যোগ
                  </button>
                </div>

                {/* Modules List */}
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
                  {formData.modules.map((mod, mIdx) => (
                    <div key={mod.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 shadow-md">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                        <input
                          type="text"
                          value={mod.title}
                          onChange={(e) => {
                            const updated = [...formData.modules];
                            updated[mIdx].title = e.target.value;
                            setFormData({ ...formData, modules: updated });
                          }}
                          className="bg-slate-900 border border-slate-800 text-slate-100 text-xs font-bold rounded-xl px-3 py-1.5 w-full max-w-md focus:outline-none focus:border-emerald-500"
                        />

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenModuleQuestionManager(mIdx)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/80 text-[11px] font-bold transition-all"
                          >
                            <ListPlus className="w-3.5 h-3.5 text-emerald-400" />
                            <span>মডিউল প্রশ্ন ({mod.questions?.length || 0}টি)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAddLesson(mIdx)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-medium"
                          >
                            + লেকচার যোগ
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveModule(mIdx)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                            title="মডিউল ডিলিট"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Module Metadata: Subject, Topic, Time & Marks */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <div>
                          <label className="text-slate-400 block mb-0.5">মডিউল বিষয়</label>
                          <input
                            type="text"
                            value={mod.subject || formData.subject}
                            onChange={(e) => {
                              const updated = [...formData.modules];
                              updated[mIdx].subject = e.target.value;
                              setFormData({ ...formData, modules: updated });
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200"
                          />
                        </div>

                        <div>
                          <label className="text-slate-400 block mb-0.5">টপিক (Topic)</label>
                          <input
                            type="text"
                            value={mod.topic || ''}
                            onChange={(e) => {
                              const updated = [...formData.modules];
                              updated[mIdx].topic = e.target.value;
                              setFormData({ ...formData, modules: updated });
                            }}
                            placeholder="যেমন: ইলমুল বয়ান"
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-200"
                          />
                        </div>

                        <div>
                          <label className="text-slate-400 block mb-0.5">সময়সীমা (মিনিট)</label>
                          <input
                            type="number"
                            value={mod.time_limit_minutes || 30}
                            onChange={(e) => {
                              const updated = [...formData.modules];
                              updated[mIdx].time_limit_minutes = Number(e.target.value);
                              setFormData({ ...formData, modules: updated });
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-emerald-400 font-mono font-bold"
                          />
                        </div>

                        <div>
                          <label className="text-slate-400 block mb-0.5">মোট নম্বর (Marks)</label>
                          <input
                            type="number"
                            value={mod.total_marks || 20}
                            onChange={(e) => {
                              const updated = [...formData.modules];
                              updated[mIdx].total_marks = Number(e.target.value);
                              setFormData({ ...formData, modules: updated });
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-amber-300 font-mono font-bold"
                          />
                        </div>
                      </div>

                      {/* Lessons List */}
                      <div className="space-y-1.5 pl-2 border-l-2 border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">ভিডিও লেকচার ও পিডিএফ নোটস:</div>
                        {mod.lessons.map((les, lIdx) => (
                          <div key={les.id} className="p-2 bg-slate-900/80 rounded-xl border border-slate-800/80 space-y-1">
                            <input
                              type="text"
                              value={les.title}
                              onChange={(e) => handleUpdateLesson(mIdx, lIdx, 'title', e.target.value)}
                              placeholder="লেকচার শিরোনাম..."
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 text-[11px]"
                            />
                            <div className="grid grid-cols-2 gap-2 text-[10px]">
                              <input
                                type="text"
                                value={les.video_url || ''}
                                onChange={(e) => handleUpdateLesson(mIdx, lIdx, 'video_url', e.target.value)}
                                placeholder="ভিডিও লিংক (YouTube/Vimeo)"
                                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 font-mono"
                              />
                              <input
                                type="text"
                                value={les.pdf_url || ''}
                                onChange={(e) => handleUpdateLesson(mIdx, lIdx, 'pdf_url', e.target.value)}
                                placeholder="পিডিএফ লেকচার নোট লিংক"
                                className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 font-mono"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Attached Questions Preview inside Module Card */}
                      {mod.questions && mod.questions.length > 0 && (
                        <div className="pt-1 text-[11px] bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80">
                          <div className="font-bold text-emerald-400 flex items-center justify-between mb-1">
                            <span>যুক্তকৃত প্রশ্নসমূহ ({mod.questions.length}টি):</span>
                            <span className="text-[10px] font-mono text-slate-400">
                              মোট সময়: {mod.questions.reduce((sum, q) => sum + (q.time_limit_seconds || 60), 0)} সেকেন্ড
                            </span>
                          </div>
                          <div className="space-y-1">
                            {mod.questions.map((q, qIdx) => (
                              <div key={q.id} className="flex items-center justify-between text-slate-300 text-[10px]">
                                <span className="truncate max-w-md">#{qIdx + 1}. {q.question_bn}</span>
                                <span className="font-mono text-emerald-300">{q.time_limit_seconds || 60}সে | {q.marks || 1}মার্ক</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
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
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md"
                >
                  কোর্স সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODULE QUESTION MANAGER MODAL (Opened when clicking "মডিউল প্রশ্ন") */}
      {activeQuestionModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-3xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setActiveQuestionModule(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-800 pb-3">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">মডিউল প্রশ্ন ম্যানেজার</span>
              <h3 className="text-lg font-bold text-white font-serif mt-0.5">
                {activeQuestionModule.moduleTitle}
              </h3>
            </div>

            {/* Questions Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-300 font-semibold">
                যুক্তকৃত প্রশ্ন: {formData.modules[activeQuestionModule.moduleIndex]?.questions?.length || 0}টি
              </span>

              <button
                onClick={() => setIsModuleQuestionFormOpen(!isModuleQuestionFormOpen)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>নতুন প্রশ্ন এড করুন</span>
              </button>
            </div>

            {/* Add New Question Form inside Module */}
            {isModuleQuestionFormOpen && (
              <form onSubmit={handleAddQuestionToActiveModule} className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/50 space-y-3 text-xs animate-in fade-in">
                <h4 className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  মডিউলে নতুন প্রশ্ন যুক্ত করুন
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <SubjectSelector
                    selectedSubject={moduleQuestionForm.subject}
                    onChangeSubject={(s) => setModuleQuestionForm({ ...moduleQuestionForm, subject: s })}
                    customSubjects={customSubjects}
                    onAddCustomSubject={onAddCustomSubject}
                    label="বিষয় (Subject)"
                  />

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">টপিক (Topic)</label>
                    <input
                      type="text"
                      value={moduleQuestionForm.topic || ''}
                      onChange={(e) => setModuleQuestionForm({ ...moduleQuestionForm, topic: e.target.value })}
                      placeholder="যেমন: ইলমুল বয়ান"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-100 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">সময়সীমা (সেকেন্ড) *</label>
                    <input
                      type="number"
                      value={moduleQuestionForm.time_limit_seconds || 60}
                      onChange={(e) => setModuleQuestionForm({ ...moduleQuestionForm, time_limit_seconds: Number(e.target.value) })}
                      placeholder="যেমন: 60"
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-emerald-300 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">নম্বর (Marks)</label>
                    <input
                      type="number"
                      value={moduleQuestionForm.marks || 1}
                      onChange={(e) => setModuleQuestionForm({ ...moduleQuestionForm, marks: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">কঠিনতার মাত্রা</label>
                    <select
                      value={moduleQuestionForm.difficulty || 'মাঝারি'}
                      onChange={(e) => setModuleQuestionForm({ ...moduleQuestionForm, difficulty: e.target.value as Difficulty })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                    >
                      <option value="সহজ">সহজ</option>
                      <option value="মাঝারি">মাঝারি</option>
                      <option value="কঠিন">কঠিন</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">প্রশ্ন বাংলা পাঠ *</label>
                  <textarea
                    rows={2}
                    value={moduleQuestionForm.question_bn}
                    onChange={(e) => setModuleQuestionForm({ ...moduleQuestionForm, question_bn: e.target.value })}
                    placeholder="যেমন: বালাগাত শাস্ত্রে ইস্তিয়ারা শব্দের শাব্দিক অর্থ কী?"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">আরবি টেক্সট (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={moduleQuestionForm.question_ar || ''}
                    onChange={(e) => setModuleQuestionForm({ ...moduleQuestionForm, question_ar: e.target.value })}
                    placeholder="যেমন: ما هو التعريف الدقيق للاستعارة؟"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-serif text-right"
                    dir="rtl"
                  />
                </div>

                {/* Options Input */}
                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-medium">৪টি অপশন ও সঠিক উত্তর সিলেক্ট করুন *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[0, 1, 2, 3].map((oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2 p-2 bg-slate-900 rounded-xl border border-slate-800">
                        <input
                          type="radio"
                          name="mod_correct_opt"
                          checked={moduleQuestionForm.correct_option === oIdx}
                          onChange={() => setModuleQuestionForm({ ...moduleQuestionForm, correct_option: oIdx })}
                        />
                        <span className="font-bold text-slate-400">{['ক', 'খ', 'গ', 'ঘ'][oIdx]}.</span>
                        <input
                          type="text"
                          value={moduleQuestionForm.options[oIdx] || ''}
                          onChange={(e) => {
                            const opts = [...moduleQuestionForm.options] as [string, string, string, string];
                            opts[oIdx] = e.target.value;
                            setModuleQuestionForm({ ...moduleQuestionForm, options: opts });
                          }}
                          placeholder={`অপশন ${['ক', 'খ', 'গ', 'ঘ'][oIdx]}`}
                          className="w-full bg-transparent text-slate-100 text-xs focus:outline-none"
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">ব্যাখ্যা &amp; রেফারেন্স</label>
                  <input
                    type="text"
                    value={moduleQuestionForm.explanation || ''}
                    onChange={(e) => setModuleQuestionForm({ ...moduleQuestionForm, explanation: e.target.value })}
                    placeholder="প্রশ্নের উত্তর ব্যাখ্যা..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-slate-100"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModuleQuestionFormOpen(false)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 text-white font-semibold rounded-xl"
                  >
                    মডিউলে প্রশ্ন যোগ করুন
                  </button>
                </div>
              </form>
            )}

            {/* List of Module Questions */}
            <div className="space-y-2">
              <h4 className="font-semibold text-slate-300 text-xs">বর্তমান মডিউল প্রশ্নসমূহ:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {(formData.modules[activeQuestionModule.moduleIndex]?.questions || []).map((mq, mqIdx) => (
                  <div key={mq.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-400">#{mqIdx + 1}. {mq.subject} • {mq.topic || 'সাধারণ'}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-300">{mq.time_limit_seconds || 60} সে | {mq.marks || 1} মার্ক</span>
                        <button
                          onClick={() => handleRemoveModuleQuestion(mq.id)}
                          className="text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="font-semibold text-white">{mq.question_bn}</div>
                    {mq.question_ar && <div className="text-amber-300 font-serif text-right">{mq.question_ar}</div>}
                  </div>
                ))}

                {(formData.modules[activeQuestionModule.moduleIndex]?.questions || []).length === 0 && (
                  <div className="text-center py-6 text-slate-500 text-xs bg-slate-950 rounded-xl border border-slate-800">
                    এই মডিউলে এখনও কোনো প্রশ্ন যুক্ত করা হয়নি। উপরে "নতুন প্রশ্ন এড করুন" বাটনে ক্লিক করুন।
                  </div>
                )}
              </div>
            </div>

            {/* Import Questions from Master Question Bank Section */}
            {masterQuestions.length > 0 && (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <h4 className="font-semibold text-amber-300 text-xs flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  মাস্টার প্রশ্ন ব্যাংক থেকে নির্বাচন করুন:
                </h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {masterQuestions.slice(0, 5).map((mq) => (
                    <div key={mq.id} className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-xs flex items-center justify-between gap-2">
                      <div className="truncate">
                        <span className="font-bold text-slate-300">[{mq.subject}] </span>
                        <span className="text-slate-200">{mq.question_bn}</span>
                      </div>
                      <button
                        onClick={() => handleImportMasterQuestion(mq)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600 text-white text-[10px] font-bold shrink-0 transition-colors"
                      >
                        + ইমপোর্ট
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
