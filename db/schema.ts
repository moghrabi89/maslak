import { pgTable, text, timestamp, integer, boolean, jsonb, primaryKey, unique, index } from "drizzle-orm/pg-core";

// 1. المستخدمين والملفات الشخصية (مربوط بـ Clerk)
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    avatarUrl: text("avatar_url"),
    role: text("role").$type<"admin" | "reviewer" | "student">().default("student").notNull(), // الأدوار الثلاثة المعتمدة
    xp: integer("xp").default(0).notNull(),
    gems: integer("gems").default(100).notNull(),
    streak: integer("streak").default(0).notNull(),
    lastActive: timestamp("last_active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    emailUnique: unique().on(table.email),
    userEmailIdx: index("user_email_idx").on(table.email),
    userRoleIdx: index("user_role_idx").on(table.role),
  })
);

// 2. مستويات المسار الفقهي
export const levels = pgTable("levels", {
  id: integer("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 3. الكتب الدراسية
export const books = pgTable(
  "books",
  {
    id: text("id").primaryKey(),
    levelId: integer("level_id").references(() => levels.id).notNull(),
    title: text("title").notNull(),
    author: text("author").notNull(),
    description: text("description"),
    order: integer("order").notNull(),
    status: text("status").$type<"draft" | "reviewed" | "approved" | "published" | "archived">().default("draft").notNull(), // دورة حياة النشر
    createdBy: text("created_by").references(() => users.id),
    updatedBy: text("updated_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    bookLevelTitleUnique: unique().on(table.levelId, table.title),
    bookLevelStatusIdx: index("book_level_status_idx").on(table.levelId, table.status),
  })
);

// 4. الوحدات الدراسية
export const units = pgTable(
  "units",
  {
    id: text("id").primaryKey(),
    bookId: text("book_id").references(() => books.id).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    order: integer("order").notNull(),
    status: text("status").$type<"draft" | "reviewed" | "approved" | "published" | "archived">().default("draft").notNull(),
    createdBy: text("created_by").references(() => users.id),
    updatedBy: text("updated_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    unitBookTitleUnique: unique().on(table.bookId, table.title),
    unitBookStatusIdx: index("unit_book_status_idx").on(table.bookId, table.status),
  })
);

// 5. العقد والمهارات (Skills/Nodes)
export const skills = pgTable(
  "skills",
  {
    id: text("id").primaryKey(),
    unitId: text("unit_id").references(() => units.id).notNull(),
    title: text("title").notNull(),
    order: integer("order").notNull(),
    status: text("status").$type<"draft" | "reviewed" | "approved" | "published" | "archived">().default("draft").notNull(),
    createdBy: text("created_by").references(() => users.id),
    updatedBy: text("updated_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    skillUnitTitleUnique: unique().on(table.unitId, table.title),
    skillUnitStatusIdx: index("skill_unit_status_idx").on(table.unitId, table.status),
  })
);

// 6. شروط فتح العقد والمهارات (Prerequisites)
export const skillPrerequisites = pgTable(
  "skill_prerequisites",
  {
    skillId: text("skill_id").references(() => skills.id).notNull(),
    requiredSkillId: text("required_skill_id").references(() => skills.id).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.skillId, table.requiredSkillId] }),
  })
);

// 7. الدروس التفصيلية داخل كل مهارة
export const lessons = pgTable(
  "lessons",
  {
    id: text("id").primaryKey(),
    skillId: text("skill_id").references(() => skills.id).notNull(),
    title: text("title").notNull(),
    content: text("content").notNull(), // المتن والشرح الأصلي المقرن بالتفسير
    order: integer("order").notNull(),
    xpReward: integer("xp_reward").default(10).notNull(),
    status: text("status").$type<"draft" | "reviewed" | "approved" | "published" | "archived">().default("draft").notNull(),
    createdBy: text("created_by").references(() => users.id),
    updatedBy: text("updated_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    lessonSkillOrderUnique: unique().on(table.skillId, table.order),
    lessonSkillStatusIdx: index("lesson_skill_status_idx").on(table.skillId, table.status),
  })
);

// 8. جدول المصادر والتوثيق الفقهي (Fiqh References)
export const fiqhReferences = pgTable("fiqh_references", {
  id: text("id").primaryKey(),
  sourceBook: text("source_book").notNull(), // اسم الكتاب (مثل: سفينة النجاة)
  sourceSection: text("source_section").notNull(), // الباب أو الفصل
  sourceText: text("source_text").notNull(), // النص الأصلي للمتن الفقهي
  explanation: text("explanation"), // الشرح المعتمد المرفق
  pageNumber: text("page_number"), // رقم الصفحة
  edition: text("edition"), // الطبعة المعتمدة للتخريج
  verifiedBy: text("verified_by").references(() => users.id), // مراجع التخريج
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 9. بنك المفاهيم الفقهية المهيكلة (Concept Bank)
export const conceptBank = pgTable(
  "concept_bank",
  {
    id: text("id").primaryKey(),
    lessonId: text("lesson_id").references(() => lessons.id).notNull(),
    referenceId: text("reference_id").references(() => fiqhReferences.id), // ربط التوثيق الفقهي
    conceptName: text("concept_name").notNull(), // اسم المفهوم فقهياً
    category: text("category").notNull(), // تصنيف العبادة
    data: jsonb("data").notNull(), // مصفوفات: pillars, conditions, invalidators
    rulingLevel: text("ruling_level").$type<"beginner" | "standard" | "advanced">().default("beginner").notNull(), // مستويات الفروع الفقهية
    madhhabPosition: text("madhhab_position").$type<"mutamad" | "alternative_view" | "disputed">().default("mutamad").notNull(), // معتمد المذهب (ترميز ASCII آمن)
    notesForAdvancedStudents: text("notes_for_advanced_students"), // تنبيهات الخلاف الفقهي
    version: integer("version").default(1).notNull(), // رقم النسخة الفقهية للمفهوم
    scientificConfidence: integer("scientific_confidence").default(0).notNull(), // نسبة الثقة والاعتماد الفقهي (تبدأ بـ 0% افتراضياً)
    reviewerNotes: text("reviewer_notes"), // ملاحظات المراجع العلمي
    approvedBy: text("approved_by").references(() => users.id), // معتمد المفهوم
    reviewDate: timestamp("review_date"), // تاريخ الاعتماد العلمي
    status: text("status").$type<"draft" | "reviewed" | "approved" | "published" | "archived">().default("draft").notNull(),
    createdBy: text("created_by").references(() => users.id),
    updatedBy: text("updated_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    conceptLessonStatusIdx: index("concept_lesson_status_idx").on(table.lessonId, table.status),
  })
);

// 10. جدول دورة المراجعة الفقهية المستقلة (Content Reviews)
export const contentReviews = pgTable(
  "content_reviews",
  {
    id: text("id").primaryKey(),
    entityType: text("entity_type").notNull(), // 'lesson' | 'concept' | 'question_template'
    entityId: text("entity_id").notNull(),
    reviewerId: text("reviewer_id").references(() => users.id).notNull(),
    status: text("status").$type<"approved" | "needs_changes" | "rejected">().notNull(),
    notes: text("notes"),
    reviewedAt: timestamp("reviewed_at").defaultNow().notNull(),
  },
  (table) => ({
    reviewReviewerIdx: index("review_reviewer_idx").on(table.reviewerId),
    reviewEntityIdx: index("review_entity_idx").on(table.entityType, table.entityId),
  })
);

// 11. جلسات محاولات التحديات للطلاب
export const challengeSessions = pgTable(
  "challenge_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id).notNull(),
    lessonId: text("lesson_id").references(() => lessons.id).notNull(),
    status: text("status").$type<"started" | "completed" | "failed" | "abandoned">().notNull(),
    xpGained: integer("xp_gained").default(0).notNull(),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    sessionUserLessonIdx: index("session_user_lesson_idx").on(table.userId, table.lessonId, table.status),
  })
);

// 12. تفاصيل الإجابات الفردية ومحركات تفسير الأسئلة
export const challengeAnswers = pgTable("challenge_answers", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").references(() => challengeSessions.id).notNull(),
  conceptId: text("concept_id").references(() => conceptBank.id),
  questionPrompt: text("question_prompt").notNull(),
  userAnswer: text("user_answer").notNull(),
  correctAnswer: text("correct_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  explanation: text("explanation").notNull(), // التفسير الفقهي المعروض للطالب فور الخطأ أو الصواب
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 13. طابور المراجعة المتباعدة الذكي (Spaced Repetition Queue)
export const reviewQueue = pgTable(
  "review_queue",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id).notNull(),
    conceptId: text("concept_id").references(() => conceptBank.id).notNull(),
    strength: integer("strength").default(1).notNull(), // درجة التمكن الفقهي (1-5) لتحديد فترات التكرار
    nextReviewAt: timestamp("next_review_at").notNull(), // موعد المراجعة القادم (بعد يوم، 3 أيام، أسبوع، شهر)
    lastReviewedAt: timestamp("last_reviewed_at"),
    mistakeCount: integer("mistake_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    reviewUserNextIdx: index("review_user_next_idx").on(table.userId, table.nextReviewAt),
    userConceptUnique: unique().on(table.userId, table.conceptId), // يمنع تكرار المفهوم للطالب في طابور المراجعة
  })
);

// 14. سجل تقدم المستخدم في المهارات الفردية للتحكم بالفتح
export const userProgress = pgTable(
  "user_progress",
  {
    userId: text("user_id").references(() => users.id).notNull(),
    lessonId: text("lesson_id").references(() => lessons.id).notNull(),
    completed: boolean("completed").default(false).notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.lessonId] }),
    userProgressIdx: index("user_progress_idx").on(table.userId),
  })
);

// 15. الشارات الفقهية والعلمية المتاحة (Badges)
export const badges = pgTable("badges", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  iconUrl: text("icon_url").notNull(),
  xpRequirement: integer("xp_requirement").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 16. الشارات التي حصل عليها الطلاب (User Badges)
export const userBadges = pgTable(
  "user_badges",
  {
    userId: text("user_id").references(() => users.id).notNull(),
    badgeId: text("badge_id").references(() => badges.id).notNull(),
    unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.badgeId] }),
  })
);

// 17. قوالب الأسئلة المعتمدة والمراجعة علمياً (Question Templates)
export const questionTemplates = pgTable("question_templates", {
  id: text("id").primaryKey(),
  type: text("type").$type<"recall" | "distinguish" | "apply" | "synthesis">().notNull(), // 'recall' | 'distinguish' | 'apply' | 'synthesis'
  difficulty: text("difficulty").$type<"easy" | "medium" | "hard">().notNull(), // 'easy' | 'medium' | 'hard'
  templateText: text("template_text").notNull(), // نص قالب السؤال
  explanationTemplate: text("explanation_template").notNull(), // نص قالب التفسير المرفق
  status: text("status").$type<"draft" | "reviewed" | "approved" | "published" | "archived">().default("draft").notNull(),
  approvedBy: text("approved_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
