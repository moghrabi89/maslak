# وثيقة التشغيل والإطلاق

## أوامر الاعتماد

قبل أي إطلاق تجريبي:

```bash
npm run test
npx tsc --noEmit
npm run build
npm run lint
```

## متغيرات البيئة

يجب ضبط المتغيرات الآتية في بيئة الإنتاج:

| المتغير | المصدر | إلزامي |
|---------|--------|--------|
| `DATABASE_URL` | Neon PostgreSQL | ✅ |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard | ✅ |
| `CLERK_SECRET_KEY` | Clerk Dashboard | ✅ |
| `UPLOADTHING_TOKEN` | UploadThing Dashboard | ✅ |
| `UPLOADTHING_SECRET` | UploadThing Dashboard | ✅ |
| `CLERK_SIGN_IN_URL` | `/sign-in` | ❌ (افتراضي) |
| `CLERK_SIGN_UP_URL` | `/sign-up` | ❌ (افتراضي) |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` | ❌ (افتراضي) |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` | ❌ (افتراضي) |

## التوزيع (Vercel)

المشروع مهيأ للنشر على Vercel مع `vercel.json`. خطوات النشر:

1. ارفع المشروع إلى GitHub.
2. أنشئ مشروع Vercel جديد واربط المستودع.
3. أضف جميع متغيرات البيئة أعلاه في Vercel Dashboard.
4. استخدم Vercel CLI أو dashboard للنشر.
5. تأكد من تفعيل Automatic Deployment من `main` branch.

### النشر المحلي

```bash
npm run build
npm run start
```

## النسخ الاحتياطي

- نسخة يومية من قاعدة البيانات في فترة الإطلاق التجريبي.
- نسخة قبل أي seed كبير أو migration.
- اختبار استعادة شهري على بيئة منفصلة.

## مراقبة الأخطاء

- تسجيل أخطاء Server Actions الحساسة برسائل آمنة لا تكشف بيانات الطالب.
- مراقبة فشل التحديات غير المعتاد عبر `/admin/analytics`.
- مراجعة تنبيهات المفاهيم كثيرة الأخطاء أسبوعياً.
- استخدام Vercel Dashboard logs لمراقبة Serverless Functions.

## سجل التغييرات

كل إصدار يجب أن يحتوي:

- نطاق الميزة.
- migrations إن وجدت.
- أوامر التحقق التي نجحت.
- أي مخاطر متبقية.
- حالة المحتوى المنشور.

## إطلاق تجريبي مغلق

لا يبدأ الإطلاق التجريبي إلا إذا:

- البناء ناجح (`npm run build`).
- TypeScript بلا أخطاء (`tsc --noEmit`).
- محتوى MVP المنشور معتمد بالكامل.
- مسار الطالب من الدخول إلى إكمال درس يعمل.
- المراجع يستطيع اعتماد المحتوى.
- المدير يستطيع إدارة المحتوى دون حذف منشور له بيانات طلابية.
- جميع الاختبارات ناجحة (`npm test`).

## قائمة التحقق النهائية للإطلاق

- [ ] `npm run build` ينجح
- [ ] `npx tsc --noEmit` 0 أخطاء
- [ ] `npx eslint .` 0 أخطاء
- [ ] `npm test` 48/48 نجاح
- [ ] جميع متغيرات البيئة منشأة في Vercel
- [ ] PDF تحفة المحتاج مرفوع يدوياً عبر UploadThing Dashboard
- [ ] محتوى باب الطهارة منشور ومعتمد
- [ ] باب الصلاة في انتظار المراجعة
- [ ] التنقل بين dashboard → lesson → challenge → review يعمل
- [ ] المراجع يستطيع الدخول إلى `/admin/review`
- [ ] المدير يستطيع الدخول إلى `/admin/content`
