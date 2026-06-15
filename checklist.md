# 🧭 مسلك - قائمة تتبع وإنجاز مراحل المشروع (Checklist)

جدول تفصيلي يوضح حالة تقدّم تطوير منصة **"مسلك - درب الشافعي"** عبر مراحل التنفيذ العشرين المعتمدة، مع تحديد بوابات الاعتماد لكل مرحلة.

---

## 📊 حالة المشروع الحالية
* **المراحل المكتملة:** 11 من أصل 20 مرحلة.
* **نسبة الإنجاز الإجمالية:** 55% من خطة العمل الشاملة.
* **حالة بيئة التطوير:** مستقرة 100% (TypeScript & Turbopack Compiling Succeeded).

---

## 📌 جدول تتبع المراحل (Phases Roadmap)

| # | المرحلة الفقهية والتقنية | الحالة | التوثيق والملفات الأساسية |
| :---: | :--- | :---: | :--- |
| **1** | **تأسيس المشروع والبنية التقنية** | 🟢 مكتمل (✔️) | [walkthrough.md](file:///C:/Users/CW/.gemini/antigravity-ide/brain/b80b8879-29c3-4911-ac4b-1508f8a97361/walkthrough.md) • [globals.css](file:///e:/New%20Project/maslak/app/globals.css) |
| **2** | **بناء قاعدة البيانات والمخطط الفقهي** | 🟢 مكتمل (✔️) | [schema.ts](file:///e:/New%20Project/maslak/db/schema.ts) • [drizzle.config.ts](file:///e:/New%20Project/maslak/drizzle.config.ts) |
| **3** | **نظام المصادقة والأدوار وصلاحيات الحماية** | 🟢 مكتمل (✔️) | [auth.ts](file:///e:/New%20Project/maslak/lib/auth.ts) • [proxy.ts](file:///e:/New%20Project/maslak/proxy.ts) |
| **4** | **هيكلية مسارات الصفحات ولوحة التنقل** | 🟢 مكتمل (✔️) | [Sidebar.tsx](file:///e:/New%20Project/maslak/components/Sidebar.tsx) • [layout.tsx](file:///e:/New%20Project/maslak/app/(dashboard)/layout.tsx) |
| **5** | **نظام الهوية البصرية وتجربة القراءة الفاخرة** | 🟢 مكتمل (✔️) | [lesson/page.tsx](file:///e:/New%20Project/maslak/app/lesson/[lessonId]/page.tsx) • [globals.css](file:///e:/New%20Project/maslak/app/globals.css) |
| **6** | **تغذية خريطة مستويات المنهج الفقهي** | 🟢 مكتمل (✔️) | [seed.ts](file:///e:/New%20Project/maslak/db/seed.ts) • [content_map.md](file:///C:/Users/CW/.gemini/antigravity-ide/brain/b80b8879-29c3-4911-ac4b-1508f8a97361/content_map.md) |
| **7** | **واجهات إدارة المحتوى العلمي - CRUD** | 🟢 مكتمل (✔️) | [content/page.tsx](file:///e:/New%20Project/maslak/app/admin/content/page.tsx) • [actions/content.ts](file:///e:/New%20Project/maslak/actions/content.ts) |
| **8** | **تغذية وتوثيق باب الطهارة - MVP** | 🟢 مكتمل (✔️) | [seed.ts](file:///e:/New%20Project/maslak/db/seed.ts) (6 دروس كاملة مع المراجع والأدلة) |
| **9** | **صياغة وتغذية قوالب الأسئلة الأربعة** | 🟢 مكتمل (✔️) | [seed.ts](file:///e:/New%20Project/maslak/db/seed.ts) (قوالب مستويات الصعوبة والتفسير) |
| **10** | **محرك ومولد الأسئلة التفاعلي الآمن** | 🟢 مكتمل (✔️) | [generator.ts](file:///e:/New%20Project/maslak/lib/generator.ts) • [generator.test.ts](file:///e:/New%20Project/maslak/tests/generator.test.ts) |
| **11** | **واجهة المراجع والاعتماد الشرعي للمفاهيم** | 🟢 مكتمل (✔️) | [review/page.tsx](file:///e:/New%20Project/maslak/app/admin/review/page.tsx) • [actions/review.ts](file:///e:/New%20Project/maslak/actions/review.ts) |
| **12** | **شاشة الدرس والفتح المنهجي (Progress Lock)** | 🟢 مكتمل (✔️) | [lesson/page.tsx](file:///e:/New%20Project/maslak/app/lesson/[lessonId]/page.tsx) • [actions/lesson.ts](file:///e:/New%20Project/maslak/actions/lesson.ts) |
| **13** | **جلسات التحديات وحفظ الأجوبة والتفسير** | 🟢 مكتمل (✔️) | [lesson/page.tsx](file:///e:/New%20Project/maslak/app/lesson/[lessonId]/page.tsx) • [actions/lesson.ts](file:///e:/New%20Project/maslak/actions/lesson.ts) |
| **14** | **لوحة تحكم الطالب العريضة (Multi-column)** | 🟢 مكتمل (✔️) | [dashboard/page.tsx](file:///e:/New%20Project/maslak/app/(dashboard)/dashboard/page.tsx) |
| **15** | **مركز المراجعة المتباعدة الذكي (Spaced Repetition)** | ⏳ قيد الانتظار | معالجة خوارزمية التكرار وتحديث طابور الطالب لمنع التكرار |
| **16** | **التلعيّب العلمي ونظام الشارات والألقاب** | ⏳ قيد الانتظار | توزيع النقاط XP وجدول الشارات والألقاب التقديرية |
| **17** | **لوحة الصدارة والتنافسية المفلترة بالكتب** | ⏳ قيد الانتظار | فرز الطلاب وتصنيف التنافس الفقهي لعدالة المنافسة |
| **18** | **استكمال أبواب كتاب سفينة النجاة** | ⏳ قيد الانتظار | تغذية ونشر أبواب الصلاة والزكاة والصيام كاملة بعد استقرار الـ MVP |
| **19** | **التحليلات التعليمية وكشف ثغرات التحصيل** | ⏳ قيد الانتظار | استخراج تقارير إحصائية تكشف مواطن صعوبة المتون لدى الطلاب |
| **20** | **الاختبار الشامل للكتب والإطلاق التجريبي** | ⏳ قيد الانتظار | إعداد Unit Tests شاملة وتهيئة المنصة للاستخدام العام للجمهور |

---

## 🏛️ خريطة الاعتماد الثلاثية (Accreditation Gates)
كل مرحلة مكتملة خضعت لثلاثة مستويات تدقيق صارمة قبل اعتمادها:
1. **الاعتماد الهندسي (Engineering):** خلو الكود من أخطاء TypeScript والتحقق التام من سلامة الهيكل وبناء صفحات الويب الساكنة والديناميكية.
2. **الاعتماد المنتجي (Product):** التحقق من كفاءة رحلة المستخدم وشمولية لوحة التنقل وسلامة الأرشفة عوضاً عن الحذف الفيزيائي.
3. **الاعتماد الشرعي (Fiqh):** ضمان ربط كل معلومة فقهية بمصادرها من المتون والشروح الموثقة وتصفية عشوائية المشتتات لتكون حصرية من نفس الباب لزيادة دقة الفهم.

---
> 🧭 **مسلك - درب الشافعي:** نحو حوكمة شرعية وجمال تقني معاصر لدراسة الفقه الشافعي.
