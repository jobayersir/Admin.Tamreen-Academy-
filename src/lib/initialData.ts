import { Question, ModelTest, Course, UserProfile, WrittenQuestion, GlossaryTerm, ResourceFile } from '../types';

export const INITIAL_QUESTIONS: Question[] = [];

export const INITIAL_MODEL_TESTS: ModelTest[] = [
  {
    id: 'mt-201',
    title: 'NTRCA ১৮তম প্রভাষক (আরবি) স্পেশাল মডেল টেস্ট - ০১',
    subtitle: 'বালাগাত, মানতিক ও হাদিস বিশেষ প্রস্তুতি ব্যাচ',
    subject: 'বালাগাত ও মানতিক',
    cadre_tier: 'প্রভাষক (আরবি)',
    duration_minutes: 60,
    total_marks: 100,
    pass_mark: 50,
    negative_marking: true,
    is_premium: true,
    is_published: true,
    question_ids: [],
    created_at: '2026-08-02T12:00:00Z'
  },
  {
    id: 'mt-202',
    title: 'NTRCA সহকারী শিক্ষক (আরবি) ফ্রি গ্র্যান্ড মডেল টেস্ট',
    subtitle: 'কুরআন, তাজবীদ ও ফিকহ্ মৌলিক যাচাই',
    subject: 'আল-কুরআন',
    cadre_tier: 'সহকারী শিক্ষক (আরবি)',
    duration_minutes: 45,
    total_marks: 50,
    pass_mark: 25,
    negative_marking: true,
    is_premium: false,
    is_published: true,
    question_ids: [],
    created_at: '2026-08-05T10:00:00Z'
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'c-301',
    title: 'NTRCA প্রভাষক (আরবি) মাস্টার ব্যাচ ২০২৬',
    description: 'বালাগাত-মানতিক, ফিকহ্-উসুল ও হাদিস শাস্ত্রের গভীর বিশ্লেষণধর্মী পূর্ণাঙ্গ ভিডিও ক্লাস, পিডিএফ লেকচার শিট ও অধ্যায়ভিত্তিক মডেল টেস্ট।',
    subject: 'বালাগাত ও মানতিক',
    cadre_tier: 'প্রভাষক (আরবি)',
    price_monthly: 299,
    price_6month: 999,
    price_annual: 1499,
    image_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=800',
    is_published: true,
    enrolled_count: 342,
    modules: [
      {
        id: 'm-1',
        title: 'মডিউল ১: বালাগাত (علم المعاني والمعاني والبيان)',
        lessons: [
          { id: 'l-1', title: 'লেকচার ০১: বালাগাতের সূচনা ও আল-ফাসাহাহ (الفصاحة)', video_url: 'https://youtube.com/watch?v=sample1', is_free_preview: true },
          { id: 'l-2', title: 'লেকচার ০২: আল-ইস্তিয়ারা (الاستعارة) ও এর প্রকারভেদ', pdf_url: 'https://example.com/balaghat-02.pdf' }
        ]
      },
      {
        id: 'm-2',
        title: 'মডিউল ২: ইলমুল মানতিক (علم المنطق)',
        lessons: [
          { id: 'l-3', title: 'লেকচার ০১: মানতিকের পরিচয় ও তাছাওয়ুর-তাছদীক', video_url: 'https://youtube.com/watch?v=sample2' }
        ]
      }
    ],
    created_at: '2026-07-15T10:00:00Z'
  },
  {
    id: 'c-302',
    title: 'সহকারী শিক্ষক (আরবি) প্রিলিমিনারি ও লিখিত প্রস্তুতি',
    description: 'কুরআন মাযীদ, তাজবীদ, হাদিস, ফিকহ্ এবং বাংলা ব্যাকরণের ১০০% সিলেবাস কাভারেজ।',
    subject: 'ফিকহ্ ও উসুল',
    cadre_tier: 'সহকারী শিক্ষক (আরবি)',
    price_monthly: 249,
    price_6month: 799,
    price_annual: 1199,
    image_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800',
    is_published: true,
    enrolled_count: 512,
    modules: [
      {
        id: 'm-201',
        title: 'মডিউল ১: ফিকহ্ ও উসুলুল ফিকহ্',
        lessons: [
          { id: 'l-201', title: 'লেকচার ০১: আহকামে শরিয়াহ (ফরজ, ওয়াজিব, সুন্নাত)', is_free_preview: true }
        ]
      }
    ],
    created_at: '2026-07-20T11:00:00Z'
  }
];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'u-401',
    name: 'হাফেজ আবদুল্লাহ আল-মামুন',
    phone: '01711223344',
    email: 'mamun.arabic@gmail.com',
    role: 'student',
    is_vip: true,
    cadre_target: 'প্রভাষক (আরবি)',
    subscription_expires_at: '2027-02-01T00:00:00Z',
    created_at: '2026-06-10T12:00:00Z'
  },
  {
    id: 'u-402',
    name: 'মুহাম্মদ জোবায়ের হোসেন',
    phone: '01899887766',
    email: 'jobayersir10@gmail.com',
    role: 'admin',
    is_vip: true,
    cadre_target: 'প্রভাষক (আরবি)',
    subscription_expires_at: '2030-01-01T00:00:00Z',
    created_at: '2026-05-01T10:00:00Z'
  },
  {
    id: 'u-403',
    name: 'আবু বকর সিদ্দিক',
    phone: '01522334455',
    email: 'abubakar@yahoo.com',
    role: 'student',
    is_vip: false,
    cadre_target: 'সহকারী শিক্ষক (আরবি)',
    created_at: '2026-08-01T14:30:00Z'
  }
];

export const INITIAL_WRITTEN_QUESTIONS: WrittenQuestion[] = [
  {
    id: 'wq-501',
    title: 'বালাগাত: ইস্তিয়ারা তাছরিহিয়্যা ও মাকনিয়্যার পার্থক্য আলোচনা করুন।',
    subject: 'বালাগাত ও মানতিক',
    marks: 10,
    question_bn: 'উদাহরণসহ ইস্তিয়ারা তাছরিহিয়্যা (الاستعارة التصريحية) ও ইস্তিয়ারা মাকনিয়্যা (الاستعارة المكنية) এর সংজ্ঞা ও পার্থক্য লিখুন।',
    question_ar: 'عرّف الاستعارة التصريحية والمكنية مع ذكر الأمثلة والفرق بينهما.',
    model_answer_bn: '১. ইস্তিয়ারা তাছরিহিয়্যা: যে ইস্তিয়ারায় মূল রূপক শব্দ (المستعار منه বা المشبه به) স্পষ্ট ভাষায় উল্লেখ থাকে। যেমন: رأيت أسداً يرمي (আমি একটি সিংহকে তীর নিক্ষেপ করতে দেখেছি)। এখানে বীর পুরুষকে সিংহের সাথে তুলনা করে সিংহ শব্দ স্পষ্ট করা হয়েছে।\n২. ইস্তিয়ারা মাকনিয়্যা: যেখানে মুসাব্বাহ বিহ উহ্য থাকে এবং তার কোনো বিশিষ্ট আলামত উল্লেখ থাকে। যেমন: ولما سكت عن موسى الغضب।',
    model_answer_ar: 'الاستعارة التصريحية: هي ما صُرِّح فيها بلفظ المشبه به. مثال: "رأيت أسداً في المعركة".\nالاستعارة المكنية: هي ما حُذف فيها المشبه به ورُمز له بشيء من لوازمه.',
    rubric: 'সংজ্ঞা (৩ নম্বর), আরবি উদাহরণ (৩ নম্বর), সঠিক পার্থক্য ও বালাগাতী সূক্ষ্মতা (৪ নম্বর)',
    created_at: '2026-08-01T09:00:00Z'
  }
];

export const INITIAL_GLOSSARY: GlossaryTerm[] = [
  {
    id: 'g-601',
    term_ar: 'المشبه به',
    root_word: 'ش ب هـ',
    meaning_bn: 'যার সাথে তুলনা করা হয় (উপমান)',
    example_usage: 'في قولنا "زيد كالأشد"، فإن الأسد هو المشبه به.',
    subject: 'বালাগাত ও মানতিক',
    created_at: '2026-08-01T10:00:00Z'
  },
  {
    id: 'g-602',
    term_ar: 'مصطلح الحديث',
    root_word: 'ص ط ل ح',
    meaning_bn: 'হাদিসের রাবী ও মতনের অবস্থা নিরূপণের শাস্ত্র (হাদিস বিজ্ঞান)',
    example_usage: 'علم مصطلح الحديث يعرف به حال الراوي والمروي من حيث القبول والرد.',
    subject: 'হাদিস',
    created_at: '2026-08-02T11:00:00Z'
  }
];

export const INITIAL_RESOURCES: ResourceFile[] = [
  {
    id: 'rf-701',
    title: 'বালাগাত ও মানতিক স্পেশাল হ্যান্ডনোট - NTRCA প্রভাষক ক্যাডার',
    category: 'বালাগাত ও মানতিক',
    file_type: 'pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    size_mb: 4.8,
    is_vip_only: true,
    download_count: 184,
    created_at: '2026-08-01T08:00:00Z'
  },
  {
    id: 'rf-702',
    title: 'ফিকহ্ ও উসুলুল ফিকহ্ সংক্ষেপিত সিলেবাস গাইড ২০২৬',
    category: 'ফিকহ্ ও উসুল',
    file_type: 'pdf',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    size_mb: 2.1,
    is_vip_only: false,
    download_count: 412,
    created_at: '2026-08-03T14:00:00Z'
  }
];
