import "dotenv/config";
import { db } from "./index";
import { eq } from "drizzle-orm";
import { 
  levels, 
  books, 
  units, 
  skills, 
  lessons, 
  fiqhReferences, 
  conceptBank, 
  questionTemplates,
  badges,
  contentReviews
} from "./schema";
import { BADGE_CATALOG } from "../data/badges";

async function main() {
  console.log("⏳ Start seeding database...");

  // 1. Clear existing seed data in correct dependency order
  console.log("🧹 Clearing old database entries...");
  await db.delete(questionTemplates);
  await db.delete(conceptBank);
  await db.delete(fiqhReferences);
  await db.delete(lessons);
  await db.delete(skills);
  await db.delete(units);
  await db.delete(books);
  await db.delete(levels);

  // 2. Seed Levels
  console.log("🌱 Seeding Levels...");
  const levelData = [
    { id: 0, title: "المستوى التمهيدي: تأسيس الطالب", description: "مدخل للمبتدئين لدراسة أساسيات العقيدة والعبادات" },
    { id: 1, title: "المستوى الأول: المختصرات المنهجية", description: "دراسة شاملة لجميع أبواب الفقه عبر المتون الجامعة" },
    { id: 2, title: "المستوى المتوسط: الضبط والتوسعة", description: "تعميق الفهم والاستدلال وضبط الفتاوى المعتمدة" },
    { id: 3, title: "المستوى المتقدم: كتب الاعتماد والتحرير", description: "دراسة المسائل الدقيقة ومسارات التحرير والخلاف الفعلي" },
    { id: 4, title: "مستوى البحث والتخصص العالي", description: "دراسة أمهات كتب الفقه الشافعي وموسوعات الاستدلال" }
  ];
  await db.insert(levels).values(levelData);

  // 3. Seed Books
  console.log("🌱 Seeding Books...");
  const bookData = [
    // Level 0
    { id: "safina", levelId: 0, title: "سفينة النجاة", author: "الشيخ سالم بن سمير الحضرمي", description: "متن مختصر عظيم النفع للمبتدئين في أصول الدين والفقه", type: "matn" as const, order: 1, status: "published" as const },
    { id: "yaqut", levelId: 0, title: "الياقوت النفيس", author: "السيد أحمد بن عمر الشاطري", description: "متن فقهي مميز بعبارته العصرية ووضوح تبويبه", type: "matn" as const, order: 2, status: "draft" as const },
    { id: "muqaddimah_hadramiyyah", levelId: 0, title: "المقدمة الحضرمية", author: "الشيخ عبد الله بن عبد الرحمن بافضل", description: "شرح واسع التفصيل في ربع العبادات لضبط فروع الطهارة والصلاة", type: "commentary" as const, order: 3, status: "draft" as const },
    
    // Level 1
    { id: "abi_shuja", levelId: 1, title: "متن أبي شجاع", author: "القاضي أبو شجاع", description: "عمدة المتون المختصرة الشاملة لجميع أبواب الفقه", type: "matn" as const, order: 1, status: "draft" as const },
    { id: "fath_alqareeb", levelId: 1, title: "فتح القريب المجيب", author: "ابن قاسم الغزي", description: "شرح مباشر وسهل لفك عبارات متن الغاية والتقريب", type: "commentary" as const, order: 2, status: "draft" as const },
    { id: "kifayat_alakhyar", levelId: 1, title: "كفاية الأخيار", author: "الشيخ تقي الدين الحصني", description: "شرح متوسع يذكر الأدلة الفقهية والتعليلات الشرعية للمسائل", type: "commentary" as const, order: 3, status: "draft" as const },
    
    // Level 2
    { id: "umdat_assalik", levelId: 2, title: "عمدة السالك وعدة الناسك", author: "ابن النقيب المصري", description: "متن دقيق ومنظم وأوسع مسائل من متن أبي شجاع", type: "matn" as const, order: 1, status: "draft" as const },
    { id: "manhaj_alqawim", levelId: 2, title: "المنهج القويم", author: "ابن حجر الهيتمي", description: "شرح مميز على المقدمة الحضرمية يُعد من ركائز الفتوى في العبادات", type: "commentary" as const, order: 2, status: "draft" as const },
    { id: "fath_almuin", levelId: 2, title: "فتح المعين بشرح قرة العين", author: "الشيخ زين الدين المليباري", description: "شرح دقيق يعتمد عليه متأخرو الشافعية في الفتوى والقضاء", type: "commentary" as const, order: 3, status: "draft" as const },
    { id: "ianat_attalibin", levelId: 2, title: "إعانة الطالبين", author: "السيد البكري الدمياطي", description: "حاشية موسعة على فتح المعين تفيد في تفريعات المسائل الحادثة", type: "commentary" as const, order: 4, status: "draft" as const },

    // Level 3
    { id: "minhaj_attalibin", levelId: 3, title: "منهاج الطالبين", author: "الإمام النووي", description: "عمدة التحقيق والفتوى في المذهب الشافعي بألفاظه المحررة", type: "matn" as const, order: 1, status: "draft" as const },
    { id: "mughni_almuhtaj", levelId: 3, title: "مغني المحتاج", author: "الخطيب الشربيني", description: "شرح واضح العبارة وسهل التقريب لمسائل المنهاج", type: "commentary" as const, order: 2, status: "draft" as const },
    { id: "nihayat_almuhtaj", levelId: 3, title: "نهاية المحتاج", author: "الإمام شمس الدين الرملي", description: "ركيزة الفتوى المعتمدة لدى المحققين من متأخري الشافعية", type: "commentary" as const, order: 3, status: "draft" as const },
    { id: "tuhfat_almuhtaj", levelId: 3, title: "تحفة المحتاج", author: "الإمام ابن حجر الهيتمي", description: "أعلى مصنفات التحرير الفقهي والفتوى المعتمدة في المذهب", type: "commentary" as const, order: 4, status: "draft" as const },
    { id: "hawashi_shirwani", levelId: 3, title: "حواشي الشرواني والعبادي", author: "الشيخ الشرواني والعبادي", description: "حاشية دقيقة تفصل تحقيقات تحفة المحتاج الفقهية", type: "commentary" as const, order: 5, status: "draft" as const },

    // Level 4
    { id: "muhazzab", levelId: 4, title: "المهذب في فقه الشافعي", author: "الإمام الشيرازي", description: "شرح عمدة لضبط الأدلة العقلية والنقلية ومسائل فقه العراقيين", type: "reference" as const, order: 1, status: "draft" as const },
    { id: "majmu", levelId: 4, title: "المجموع شرح المهذب", author: "الإمام النووي", description: "الموسوعة الأعظم للفقه المقارن والأدلة والاستدلال المذهبي", type: "reference" as const, order: 2, status: "draft" as const },
    { id: "rawdat_attalibin", levelId: 4, title: "روضة الطالبين", author: "الإمام النووي", description: "مرجع واسع لتحقيق الفتاوى وتحرير المسائل قبل المنهاج", type: "reference" as const, order: 3, status: "draft" as const },
    { id: "umm", levelId: 4, title: "الأم", author: "الإمام محمد بن إدريس الشافعي", description: "المصدر الأم والمنبع الأول لفقه المذهب من كلام الشافعي مباشرة", type: "reference" as const, order: 4, status: "draft" as const }
  ];
  await db.insert(books).values(bookData);
 
  // 4. Seed Units for Safinat al-Naja
  console.log("🌱 Seeding Units for Safina...");
  await db.insert(units).values([
    {
      id: "safina_taharah",
      bookId: "safina",
      title: "باب الطهارة",
      description: "دراسة شاملة لأحكام الطهارة، الوضوء، الغسل، وإزالة النجاسات من متن سفينة النجاة",
      order: 1,
      status: "published"
    },
    {
      id: "safina_salat",
      bookId: "safina",
      title: "باب الصلاة",
      description: "دراسة شاملة لأحكام الصلاة: شروطها، أركانها، سننها، مبطلاتها، وسجود السهو من متن سفينة النجاة",
      order: 2,
      status: "published"
    }
  ]);
 
  // 5. Seed Skills
  console.log("🌱 Seeding Skills...");
  const skillData = [
    // Taharah skills
    { id: "skill_puberty", unitId: "safina_taharah", title: "علامات البلوغ", order: 1, status: "published" as const },
    { id: "skill_istinja", unitId: "safina_taharah", title: "الاستنجاء بالحجر", order: 2, status: "published" as const },
    { id: "skill_wudu_pillars", unitId: "safina_taharah", title: "فروض الوضوء", order: 3, status: "published" as const },
    { id: "skill_wudu_conds", unitId: "safina_taharah", title: "شروط الوضوء", order: 4, status: "published" as const },
    { id: "skill_wudu_invals", unitId: "safina_taharah", title: "نواقض الوضوء", order: 5, status: "published" as const },
    { id: "skill_ghusl", unitId: "safina_taharah", title: "موجبات وفروض الغسل", order: 6, status: "published" as const },
    // Prayer skills
    { id: "skill_salat_conds", unitId: "safina_salat", title: "شروط الصلاة", order: 1, status: "draft" as const },
    { id: "skill_salat_pillars", unitId: "safina_salat", title: "أركان الصلاة", order: 2, status: "draft" as const },
    { id: "skill_salat_sunnahs", unitId: "safina_salat", title: "سنن الصلاة", order: 3, status: "draft" as const },
    { id: "skill_salat_invals", unitId: "safina_salat", title: "مبطلات الصلاة", order: 4, status: "draft" as const },
    { id: "skill_sujud_sahw", unitId: "safina_salat", title: "سجود السهو", order: 5, status: "draft" as const }
  ];
  await db.insert(skills).values(skillData);

  // 6. Seed Fiqh References
  console.log("🌱 Seeding Fiqh References...");
  const referenceData = [
    {
      id: "ref_puberty",
      sourceBook: "سفينة النجاة",
      sourceSection: "فصل علامات البلوغ",
      sourceText: "علامات البلوغ ثلاث: تمام خمس عشرة سنة في الذكر والأنثى، والاحتلام في الذكر والأنثى لتسع سنين، والحيض في الأنثى لتسع سنين.",
      explanation: "علامة البلوغ الأولى هي بلوغ خمس عشرة سنة قمرية كاملة، والثانية الاحتلام للذكر والأنثى بعد تمام تسع سنين قمرية، والثالثة الحيض للأنثى بعد تمام تسع سنين قمرية.",
      pageNumber: "12",
      edition: "طبعة دار المنهاج المعتمدة"
    },
    {
      id: "ref_istinja",
      sourceBook: "سفينة النجاة",
      sourceSection: "فصل شروط إجزاء الحجر",
      sourceText: "شروط إجزاء الحجر ثمانية: أن يكون بثلاثة أحجار، وأن ينقي المحل، وأن لا يجف الخارج، ولا ينتقل، ولا يطرأ عليه غيره، ولا يجاوز صفحته وحشفته، ولا يصيبه ماء، وأن تكون الأحجار طاهرة.",
      explanation: "شروط الاستنجاء بالحجر ثمانية وهي: استعمال ثلاثة أحجار منقيه، وتنظيف المخرج تماماً، وعدم جفاف الغائط أو البول، وعدم انتقاله عن موضعه، وعدم طروء أجنبي عليه، وعدم مجاوزة الصفحة والحشفة، وعدم إصابة المخرج بالماء قبل الاستنجاء، وطهارة الأحجار.",
      pageNumber: "15",
      edition: "طبعة دار المنهاج المعتمدة"
    },
    {
      id: "ref_wudu_pillars",
      sourceBook: "سفينة النجاة",
      sourceSection: "فصل فروض الوضوء",
      sourceText: "فروض الوضوء ستة: الأول: النية عند غسل الوجه، الثاني: غسل الوجه، الثالث: غسل اليدين مع المرفقين، الرابع: مسح شيء من الرأس، الخامس: غسل الرجلين مع الكعبين، السادس: الترتيب.",
      explanation: "فروض الوضوء ستة: النية عند أول غسل الوجه، غسل كامل الوجه، غسل اليدين مع المرفقين، مسح بعض الرأس أو شعر في حده، غسل القدمين مع الكعبين، والترتيب.",
      pageNumber: "18",
      edition: "طبعة دار المنهاج المعتمدة"
    },
    {
      id: "ref_wudu_conds",
      sourceBook: "سفينة النجاة",
      sourceSection: "فصل شروط الوضوء",
      sourceText: "شروط الوضوء عشرة: الإسلام، والتمييز، والطهارة عن الحيض والنفاس، وعما يمنع وصول الماء إلى البشرة، وأن لا يكون على العضو ما يغير الماء، والعلم بفرضيته، وأن لا يعتقد فرضاً من فروضه سنة، والماء الطهور، ودخول الوقت، والموالاة لدائم الحدث.",
      explanation: "شروط صحة الوضوء عشرة: الإسلام، التمييز، الخلو من الحيض والنفاس، عدم وجود حائل يمنع وصول الماء للبشرة، عدم وجود مغير للماء على الأعضاء، معرفة كونه فرضاً، عدم اعتقاد ركن منه سنة، طهارة الماء ومطهريته، دخول وقت الصلاة لدائم الحدث، وموالاة دائم الحدث.",
      pageNumber: "21",
      edition: "طبعة دار المنهاج المعتمدة"
    },
    {
      id: "ref_wudu_invals",
      sourceBook: "سفينة النجاة",
      sourceSection: "فصل نواقض الوضوء",
      sourceText: "نواقض الوضوء أربعة أشياء: الأول: الخارج من أحد السبيلين من قبل أو دبر ريح أو غيره إلا المني، الثاني: زوال العقل بنوم أو غيره إلا نوم قاعد ممكن مقعده من الأرض، الثالث: التقاء بشرتي ذكر وأنثى كبيرين أجنبيين من غير حائل، الرابع: مس قبل الآدمي أو حلقة دبره ببطن الراحة أو بطون الأصابع.",
      explanation: "نواقض الوضوء أربعة: 1) الخارج من القبل أو الدبر ريحاً أو غيره إلا المني فإنه يوجب الغسل ولا ينقض الوضوء، 2) زوال العقل بسكر أو جنون أو نوم إلا نوم قاعد متمكن بمقعدته، 3) تلامس بشرة رجل وامرأة كبيرين أجنبيين بلا حائل، 4) مس القبل أو حلقة الدبر من الآدمي ببطن الكف أو الأصابع بلا حائل.",
      pageNumber: "25",
      edition: "طبعة دار المنهاج المعتمدة"
    },
    {
      id: "ref_ghusl",
      sourceBook: "سفينة النجاة",
      sourceSection: "فصل موجبات الغسل وفروضه",
      sourceText: "موجبات الغسل ستة: إيلاج الحشفة في الفرج، وخروج المني، والموت، والحيض، والنفاس، والولادة. وفروضه اثنان: النية، وتعميم البدن بالماء.",
      explanation: "موجبات الغسل ستة: جماع، خروج مني، موت، حيض، نفاس، ولادة. وفروض الغسل اثنان: نية رفع الحدث الأكبر، وتعميم الماء على كامل الجسد بشراً وشعراً.",
      pageNumber: "29",
      edition: "طبعة دار المنهاج المعتمدة"
    },
    // Prayer references
    {
      id: "ref_salat_conds",
      sourceBook: "سفينة النجاة",
      sourceSection: "فصل شروط الصلاة",
      sourceText: "شروط الصلاة خمسة عشر قبل دخولها: الإسلام، والتمييز، والطهارة من الحدثين، وإزالة النجاسة عن الثوب والبدن والمكان، وستر العورة، واستقبال القبلة، والنية، ودخول الوقت، والعلم بفرضيتها، وأن لا يعتقد فرضاً منها سنة، واجتناب ما يبطلها، والموالاة بين أفعالها، والترتيب بين فروضها، والمشي إليها إذا خاف فوات الوقت، وأن لا يكون عليه دين صلاة.",
      explanation: "شروط الصلاة التي يجب توفرها قبل الدخول فيها خمسة عشر شرطاً: الإسلام، العقل والتمييز، الطهارة من الحدث الأصغر والأكبر، إزالة النجاسة الحقيقية عن الثوب والبدن والمكان، ستر العورة بشروطها، استقبال القبلة مع العلم، النية المقترنة بتكبيرة الإحرام، دخول وقت الصلاة، العلم بأن الصلاة فرض، عدم اعتقاد ركن منها سنة، اجتناب كل ما يبطل الصلاة، الموالاة بين أفعالها، الترتيب بين فروضها، المشي إليها لخشية فوات الوقت، وعدم اشتغال ذمته بصلاة فائتة.",
      pageNumber: "31",
      edition: "طبعة دار المنهاج المعتمدة"
    },
    {
      id: "ref_salat_pillars",
      sourceBook: "سفينة النجاة",
      sourceSection: "فصل أركان الصلاة",
      sourceText: "أركان الصلاة ثمانية عشر: النية، وتكبيرة الإحرام، والقيام للقادر، وقراءة الفاتحة، والركوع، والاطمئنان فيه، والرفع من الركوع، والاعتدال قائماً، والسجود، والاطمئنان فيه، والجلوس بين السجدتين، والاطمئنان فيه، والجلوس للتشهد الأخير، والتشهد الأخير، والصلاة على النبي، والتسليمة الأولى، وترتيب الأركان، والنية للخروج من الصلاة.",
      explanation: "أركان الصلاة ثمانية عشر ركناً: النية مقارنة لتكبيرة الإحرام، تكبيرة الإحرام (الله أكبر)، الوقوف للقادر على القيام، قراءة سورة الفاتحة، الركوع بانحناء بحيث تنال الراحتان الركبتين، الطمأنينة في الركوع بحيث تستقر الأعضاء، الرفع من الركوع، الوقوف معتدلاً بعد الرفع، السجود على الأعضاء السبعة، الطمأنينة في السجود، الجلوس بين السجدتين، الطمأنينة فيه، الجلوس للتشهد الأخير، قراءة التشهد الأخير، الصلاة على النبي صلى الله عليه وسلم بعد التشهد، التسليمة الأولى (السلام)، ترتيب الأركان كما ذكرت، والنية للخروج من الصلاة.",
      pageNumber: "35",
      edition: "طبعة دار المنهاج المعتمدة"
    },
    {
      id: "ref_salat_sunnahs",
      sourceBook: "سفينة النجاة",
      sourceSection: "فصل سنن الصلاة",
      sourceText: "سنن الصلاة: رفع اليدين عند تكبيرة الإحرام وعند الركوع والرفع منه، ووضع اليمين على الشمال تحت السرة، ودعاء الافتتاح، والتعوذ، والتأمين، وقراءة سورة بعد الفاتحة، والجهر والإسرار في مواضعهما، والتسبيح في الركوع والسجود، ووضع الرأس بين الكفين في السجود حاذياً منكبيه، والافتراش في الجلوس بين السجدتين والتشهد الأول، والتورك في الجلوس للتشهد الأخير، والتسليمة الثانية، والصلاة على الآل، ودعاء القنوت في الصبح.",
      explanation: "سنن الصلاة: رفع اليدين حذو المنكبين في أربعة مواضع (تكبيرة الإحرام، الركوع، الرفع منه، القيام من التشهد الأول)، وضع اليد اليمنى على اليسرى تحت السرة، دعاء الاستفتاح، الاستعاذة بالله من الشيطان، قول آمين بعد الفاتحة، قراءة سورة أو آيات بعد الفاتحة في الركعتين الأوليين، الجهر في الصبح والمغرب والعشاء والإسرار في الظهر والعصر، قول سبحان ربي العظيم في الركوع وسبحان ربي الأعلى في السجود، وضع الرأس بين الكفين في السجود محاذياً للمنكبين، الافتراش في الجلوس بين السجدتين والتشهد الأول، التورك في التشهد الأخير، التسليمة الثانية، والصلاة على الآل والأصحاب، ودعاء القنوت في صلاة الصبح.",
      pageNumber: "39",
      edition: "طبعة دار المنهاج المعتمدة"
    },
    {
      id: "ref_salat_invals",
      sourceBook: "سفينة النجاة",
      sourceSection: "فصل مبطلات الصلاة",
      sourceText: "مبطلات الصلاة: الكلام العمد، والأكل، والشرب، والقهقهة، وزيادة ركن فعلي عمداً، ونقص ركن، والحركة الكثيرة المتوالية لغير ضرورة، والشك في النية، وقطر البول أو الغائط، وانكشاف العورة، واستدبار القبلة، والحدث، ووجود النجاسة، وزوال العقل جنوناً أو إغماء، وردة عن الإسلام.",
      explanation: "مبطلات الصلاة خمسة عشر: التكلم عمداً بحرفين فأكثر غير القرآن والذكر والدعاء، الأكل والشرب عمداً ولو قليلاً، الضحك المشتمل على صوت (القهقهة)، زيادة ركن فعلي كركوع زائد عمداً، نقص ركن من أركان الصلاة، الحركة الكثيرة المتفرقة غير الضرورية، الشك في النية كأن تردد هل صلى ركعتين أو ثلاثاً، خروج البول أو الغائط لعذر، انكشاف العورة بلا عذر، استدبار القبلة بكل البدن، حدوث حدث أصغر أو أكبر، بقاء نجاسة على البدن أو الثوب مع العلم والذكر، زوال العقل بجنون أو إغماء، والردة عن الإسلام.",
      pageNumber: "43",
      edition: "طبعة دار المنهاج المعتمدة"
    },
    {
      id: "ref_sujud_sahw",
      sourceBook: "سفينة النجاة",
      sourceSection: "فصل سجود السهو",
      sourceText: "سجود السهو سببه ثلاثة أشياء: نقصان جزء من أجزاء الصلاة، وزيادة فعل فيها، وشك في عدد الركعات. ويسجد سجدتين قبل السلام في الأكثر، وبعده في الأقل. ويشترط فيه ما يشترط في سجود الصلاة.",
      explanation: "أسباب سجود السهو ثلاثة: النقص (كترك التشهد الأول أو القنوت)، والزيادة (كزيادة ركعة أو سجدة)، والشك (كالتردد بين ثلاث وأربع فيأخذ بالأكثر). الأصل أن سجود السهو يسجد له قبل السلام في أكثر صوره، وبعد السلام في صور قليلة. وتشترط فيه طهارة واستقبال قبلة وستر عورة كما في الصلاة.",
      pageNumber: "47",
      edition: "طبعة دار المنهاج المعتمدة"
    }
  ];
  await db.insert(fiqhReferences).values(referenceData);

  // 7. Seed Lessons
  console.log("🌱 Seeding Lessons...");
  const lessonData = [
    {
      id: "lesson_puberty",
      skillId: "skill_puberty",
      title: "علامات البلوغ",
      content: "عَلَامَاتُ الْبُلُوغِ ثَلَاثٌ: تَمَامُ خَمْسَ عَشْرَةَ سَنَةً فِي الذَّكَرِ وَالْأُنْثَى، وَالِاحْتِلَامُ فِي الذَّكَرِ وَالْأُنْثَى لِتِسْعِ سِنِينَ، وَالْحَيْضُ فِي الْأُنْثَى لِتِسْعِ سِنِينَ.",
      order: 1,
      xpReward: 15,
      status: "draft" as const
    },
    {
      id: "lesson_istinja",
      skillId: "skill_istinja",
      title: "شروط الاستنجاء بالحجر",
      content: "شُرُوطُ إِجْزَاءِ الْحَجَرِ ثَمَانِيَةٌ: أَنْ يَكُونَ بِثَلَاثَةِ أَحْجَارٍ، وَأَنْ يُنْقِيَ الْمَحَلَّ، وَأَنْ لَا يَجِفَّ الْخَارِجُ، وَلَا يَنْتَقِلَ، وَلَا يَطْرَأَ عَلَيْهِ غَيْرُهُ، وَلَا يُجَاوِزَ صَفْحَتَهُ وَحَشَفَتَهُ، وَلَا يُصِيبَهُ مَاءٌ، وَأَنْ تَكُونَ الْأَحْجَارُ طَاهِرَةً.",
      order: 2,
      xpReward: 15,
      status: "draft" as const
    },
    {
      id: "lesson_wudu_pillars",
      skillId: "skill_wudu_pillars",
      title: "فروض الوضوء وأحكام النية",
      content: "فُرُوضُ الْوُضُوءِ سِتَّةٌ: الْأَوَّلُ: النِّيَّةُ عِنْدَ غَسْلِ الْوَجْهِ، الثَّانِي: غَسْلُ الْوَجْهِ، الثَّالِثُ: غَسْلُ الْيَدَيْنِ مَعَ الْمِرْفَقَيْنِ، الرَّابِعُ: مَسْحُ شَيْءٍ مِنَ الرَّأْسِّ، الْخَامِسُ: غَسْلُ الرِّجْلَيْنِ مَعَ الْكَعْبَيْنِ، السَّادِسُ: التَّرْتِيبُ.",
      order: 3,
      xpReward: 15,
      status: "draft" as const
    },
    {
      id: "lesson_wudu_conds",
      skillId: "skill_wudu_conds",
      title: "شروط الوضوء",
      content: "شُرُوطُ الْوُضُوءِ عَشَرَةٌ: الْإِسْلَامُ، وَالتَّمْيِيزُ، وَالطَّهَارَةُ عَنِ الْحَيْضِ وَالنِّفَاسِ، وَعَمَّا يَمْنَعُ وُصُولَ الْمَاءِ إِلَى الْبَشَرَةِ، وَأَنْ لَا يَكُونَ عَلَى الْعُضْوِ مَا يُغَيِّرُ الْمَاءَ، وَالْعِلْمُ بِفَرْضِيَّتِهِ، وَأَنْ لَا يَعْتَقِدَ فَرْضاً مِنْ فُرُوضِهِ سُنَّةً، وَالْمَاءُ الطَّهُورُ، وَدُخُولُ الْوَقْتِ، وَالْمُوَالَاةُ لِدَائِمِ الْحَدَثِ.",
      order: 4,
      xpReward: 15,
      status: "draft" as const
    },
    {
      id: "lesson_wudu_invals",
      skillId: "skill_wudu_invals",
      title: "نواقض الوضوء",
      content: "نَوَاقِضُ الْوُضُوءِ أَرْبَعَةُ أَشْيَاءَ: الْأَوَّلُ: الْخَارِجُ مِنْ أَحَدِ السَّبِيلَيْنِ مِنْ قُبُلٍ أَوْ دُبُرٍ رِيحٌ أَوْ غَيْرُهُ إِلَّا الْمَنِيَّ، الثَّانِي: زَوَالُ الْعَقْلِ بِنَوْمٍ أَوْ غَيْرِهِ إِلَّا نَوْمَ قَاعِدٍ مُمَكِّنٍ مَقْعَدَهُ مِنَ الْأَرْضِ، الثَّالِثُ: الْتِقَاءُ بَشَرَتَيْ ذَكَرٍ وَأُنْثَى كَبِيرَيْنِ أَجْنَبِيَّيْنِ مِنْ غَيْرِ حَائِلٍ، الرَّابِعُ: مَسُّ قُبُلِ الْآدَمِيِّ أَوْ حَلْقَةِ دُبُرِهِ بِبَطْنِ الرَّاحَةِ أَوْ بُطُونِ الْأَصَابِعِ.",
      order: 5,
      xpReward: 15,
      status: "draft" as const
    },
    {
      id: "lesson_ghusl",
      skillId: "skill_ghusl",
      title: "موجبات الغسل وفروضه",
      content: "مُوجِبَاتُ الْغُسْلِ سِتَّةٌ: إِيلَاجُ الْحَشَفَةِ فِي الْفَرْجِ، وَخُرُوجُ الْمَنِيِّ، وَالْمَوْتُ، وَالْحَيْضُ، وَالنِّفَاسُ، وَالْوِلَادَةُ. وَفُرُوضُهُ اثْنَانِ: النِّيَّةُ، وَتَعْمِيمُ الْبَدَنِ بِالْمَاءِ.",
      order: 6,
      xpReward: 15,
      status: "draft" as const
    },
    // Prayer lessons
    {
      id: "lesson_salat_conds",
      skillId: "skill_salat_conds",
      title: "شروط الصلاة",
      content: "شُرُوطُ الصَّلَاةِ خَمْسَةَ عَشَرَ قَبْلَ دُخُولِهَا: الْإِسْلَامُ، وَالتَّمْيِيزُ، وَالطَّهَارَةُ مِنَ الْحَدَثَيْنِ، وَإِزَالَةُ النَّجَاسَةِ عَنِ الثَّوْبِ وَالْبَدَنِ وَالْمَكَانِ، وَسَتْرُ الْعَوْرَةِ، وَاسْتِقْبَالُ الْقِبْلَةِ، وَالنِّيَّةُ، وَدُخُولُ الْوَقْتِ، وَالْعِلْمُ بِفَرْضِيَّتِهَا، وَأَنْ لَا يَعْتَقِدَ فَرْضاً مِنْهَا سُنَّةً، وَاجْتِنَابُ مَا يُبْطِلُهَا، وَالْمُوَالَاةُ بَيْنَ أَفْعَالِهَا، وَالتَّرْتِيبُ بَيْنَ فُرُوضِهَا، وَالْمَشْيُ إِلَيْهَا إِذَا خَافَ فَوَاتَ الْوَقْتِ، وَأَنْ لَا يَكُونَ عَلَيْهِ دَيْنُ صَلَاةٍ.",
      order: 1,
      xpReward: 20,
      status: "draft" as const
    },
    {
      id: "lesson_salat_pillars",
      skillId: "skill_salat_pillars",
      title: "أركان الصلاة",
      content: "أَرْكَانُ الصَّلَاةِ ثَمَانِيَةَ عَشَرَ: النِّيَّةُ، وَتَكْبِيرَةُ الْإِحْرَامِ، وَالْقِيَامُ لِلْقَادِرِ، وَقِرَاءَةُ الْفَاتِحَةِ، وَالرُّكُوعُ، وَالِاطْمِئْنَانُ فِيهِ، وَالرَّفْعُ مِنَ الرُّكُوعِ، وَالِاعْتِدَالُ قَائِماً، وَالسُّجُودُ، وَالِاطْمِئْنَانُ فِيهِ، وَالْجُلُوسُ بَيْنَ السَّجْدَتَيْنِ، وَالِاطْمِئْنَانُ فِيهِ، وَالْجُلُوسُ لِلتَّشَهُّدِ الْأَخِيرِ، وَالتَّشَهُّدُ الْأَخِيرُ، وَالصَّلَاةُ عَلَى النَّبِيِّ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ، وَالتَّسْلِيمَةُ الْأُولَى، وَتَرْتِيبُ الْأَرْكَانِ، وَالنِّيَّةُ لِلْخُرُوجِ مِنَ الصَّلَاةِ.",
      order: 2,
      xpReward: 20,
      status: "draft" as const
    },
    {
      id: "lesson_salat_sunnahs",
      skillId: "skill_salat_sunnahs",
      title: "سنن الصلاة",
      content: "سُنَنُ الصَّلَاةِ: رَفْعُ الْيَدَيْنِ عِنْدَ تَكْبِيرَةِ الْإِحْرَامِ وَعِنْدَ الرُّكُوعِ وَالرَّفْعِ مِنْهُ، وَوَضْعُ الْيَمِينِ عَلَى الشِّمَالِ تَحْتَ السُّرَّةِ، وَدُعَاءُ الِافْتِتَاحِ، وَالتَّعَوُّذُ، وَالتَّأْمِينُ، وَقِرَاءَةُ سُورَةٍ بَعْدَ الْفَاتِحَةِ، وَالْجَهْرُ وَالْإِسْرَارُ فِي مَوَاضِعِهِمَا، وَالتَّسْبِيحُ فِي الرُّكُوعِ وَالسُّجُودِ، وَوَضْعُ الرَّأْسِ بَيْنَ الْكَفَّيْنِ فِي السُّجُودِ حَاذِياً مَنْكِبَيْهِ، وَالِافْتِرَاشُ فِي الْجُلُوسِ بَيْنَ السَّجْدَتَيْنِ وَالتَّشَهُّدِ الْأَوَّلِ، وَالتَّوَرُّكُ فِي الْجُلُوسِ لِلتَّشَهُّدِ الْأَخِيرِ، وَالتَّسْلِيمَةُ الثَّانِيَةُ، وَالصَّلَاةُ عَلَى الْآلِ، وَدُعَاءُ الْقُنُوتِ فِي الصُّبْحِ.",
      order: 3,
      xpReward: 15,
      status: "draft" as const
    },
    {
      id: "lesson_salat_invals",
      skillId: "skill_salat_invals",
      title: "مبطلات الصلاة",
      content: "مُبْطِلَاتُ الصَّلَاةِ: الْكَلَامُ الْعَمْدُ، وَالْأَكْلُ، وَالشُّرْبُ، وَالْقَهْقَهَةُ، وَزِيَادَةُ رُكْنٍ فِعْلِيٍّ عَمْداً، وَنَقْصُ رُكْنٍ، وَالْحَرَكَةُ الْكَثِيرَةُ الْمُتَوَالِيَةُ لِغَيْرِ ضَرُورَةٍ، وَالشَّكُّ فِي النِّيَّةِ، وَقَطْرُ الْبَوْلِ أَوِ الْغَائِطِ، وَانْكِشَافُ الْعَوْرَةِ، وَاسْتِدْبَارُ الْقِبْلَةِ، وَالْحَدَثُ، وَوُجُودُ النَّجَاسَةِ، وَزَوَالُ الْعَقْلِ جُنُوناً أَوْ إِغْمَاءً، وَرِدَّةٌ عَنِ الْإِسْلَامِ.",
      order: 4,
      xpReward: 20,
      status: "draft" as const
    },
    {
      id: "lesson_sujud_sahw",
      skillId: "skill_sujud_sahw",
      title: "سجود السهو",
      content: "سَجُودُ السَّهْوِ سَبَبُهُ ثَلَاثَةُ أَشْيَاءَ: نُقْصَانُ جُزْءٍ مِنْ أَجْزَاءِ الصَّلَاةِ، وَزِيَادَةُ فِعْلٍ فِيهَا، وَشَكٌّ فِي عَدَدِ الرَّكَعَاتِ. وَيُسْجَدُ سَجْدَتَيْنِ قَبْلَ السَّلَامِ فِي الْأَكْثَرِ، وَبَعْدَهُ فِي الْأَقَلِّ. وَيُشْتَرَطُ فِيهِ مَا يُشْتَرَطُ فِي سُجُودِ الصَّلَاةِ مِنْ طَهَارَةٍ وَسَتْرِ عَوْرَةٍ وَاسْتِقْبَالِ قِبْلَةٍ.",
      order: 5,
      xpReward: 15,
      status: "draft" as const
    }
  ];
  await db.insert(lessons).values(lessonData);

  // 8. Seed Concept Bank
  console.log("🌱 Seeding Concept Bank...");
  const conceptData = [
    {
      id: "concept_puberty",
      lessonId: "lesson_puberty",
      referenceId: "ref_puberty",
      conceptName: "علامات البلوغ",
      category: "الطهارة",
      rulingLevel: "beginner" as const,
      madhhabPosition: "mutamad" as const,
      notesForAdvancedStudents: "تنبيه: تحسب السنون في التكليف الشرعي بالتقويم الهجري القمري وليس الميلادي الشمسي.",
      scientificConfidence: 0,
      status: "draft" as const,
      data: {
        name: "علامات البلوغ",
        pillars: [],
        conditions: [],
        invalidators: [],
        rulings: [
          { title: "تمام خمس عشرة سنة في الذكر والأنثى", description: "بلوغ 15 سنة قمرية كاملة" },
          { title: "الاحتلام في الذكر والأنثى لتسع سنين", description: "خروج المني لتسع سنين قمرية" },
          { title: "الحيض في الأنثى لتسع سنين", description: "نزول دم الحيض للأنثى لتسع سنين قمرية" }
        ],
        commonMistakes: [
          { title: "حساب السن بالتقويم الميلادي", description: "السن يحسب بالتقويم الهجري (القمري)" }
        ]
      }
    },
    {
      id: "concept_istinja",
      lessonId: "lesson_istinja",
      referenceId: "ref_istinja",
      conceptName: "شروط الاستنجاء بالحجر",
      category: "الطهارة",
      rulingLevel: "beginner" as const,
      madhhabPosition: "mutamad" as const,
      notesForAdvancedStudents: "يجب أن تكون الأحجار قالعة للنجاسة غير محترمة (مثل الخبز أو كتب العلم).",
      scientificConfidence: 0,
      status: "draft" as const,
      data: {
        name: "شروط الاستنجاء بالحجر",
        pillars: [],
        conditions: [
          { title: "أن يكون بثلاثة أحجار", description: "استعمال ثلاثة أحجار أو حجر ذي ثلاثة أحرف" },
          { title: "أن ينقي المحل", description: "تنظيف المخرج تماماً بحيث لا يبقى إلا الأثر" },
          { title: "أن لا يجف الخارج", description: "عدم جفاف الغائط أو البول الخارج قبل الاستنجاء" },
          { title: "أن لا ينتقل الخارج", description: "عدم تجاوز الخارج موضع الاستقرار المعتاد" },
          { title: "أن لا يطرأ عليه خارج آخر", description: "عدم اختلاط المخرج بشيء أجنبي رطب" },
          { title: "أن لا يجاوز صفحته وحشفته", description: "عدم تعدي البول الحشفة أو الغائط الصفحة" },
          { title: "أن لا يصيبه ماء", description: "عدم اختلاط الخارج بماء أو رطوبة أجنبية قبل الاستنجاء" },
          { title: "أن تكون الأحجار طاهرة", description: "طهارة الأحجار المستخدمة" }
        ],
        invalidators: [],
        rulings: [],
        commonMistakes: [
          { title: "الاستنجاء بحجر متنجس", description: "لا يجزئ الاستنجاء إلا بحجر طاهر" }
        ]
      }
    },
    {
      id: "concept_wudu_pillars",
      lessonId: "lesson_wudu_pillars",
      referenceId: "ref_wudu_pillars",
      conceptName: "فروض الوضوء",
      category: "الطهارة",
      rulingLevel: "beginner" as const,
      madhhabPosition: "mutamad" as const,
      notesForAdvancedStudents: "تجب النية مقترنة بغسل أول جزء من الوجه، والترتيب ركن أساسي يبطل الوضوء بتركه عمداً أو سهواً.",
      scientificConfidence: 0,
      status: "draft" as const,
      data: {
        name: "فروض الوضوء",
        pillars: [
          { title: "النية عند غسل الوجه", description: "قصد الشيء مقترناً بفعله، وتجب مع أول جزء من الوجه" },
          { title: "غسل الوجه", description: "من منابت شعر الرأس غالباً إلى منتهى اللحيين طولاً، ومن الأذن إلى الأذن عرضاً" },
          { title: "غسل اليدين مع المرفقين", description: "غسل اليدين كاملاً بما في ذلك المرفقين" },
          { title: "مسح شيء من الرأس", description: "مسح جزء من بشرة الرأس أو شعر في حد الرأس" },
          { title: "غسل الرجلين مع الكعبين", description: "غسل القدمين كاملاً بما في ذلك الكعبين" },
          { title: "الترتيب", description: "غسل الأعضاء على الترتيب المذكور (الوجه، اليدين، الرأس، الرجلين)"}
        ],
        conditions: [],
        invalidators: [],
        rulings: [],
        commonMistakes: [
          { title: "تأخير النية عن غسل أول جزء من الوجه", description: "يجب أن تقترن النية بأول جزء مغسول من الوجه" }
        ]
      }
    },
    {
      id: "concept_wudu_conds",
      lessonId: "lesson_wudu_conds",
      referenceId: "ref_wudu_conds",
      conceptName: "شروط الوضوء",
      category: "الطهارة",
      rulingLevel: "beginner" as const,
      madhhabPosition: "mutamad" as const,
      notesForAdvancedStudents: "دائم الحدث (مثل سلس البول) يلزمه الوضوء لكل صلاة فرض بعد دخول وقتها والموالاة بين أفعاله وصلاة الفرض.",
      scientificConfidence: 0,
      status: "draft" as const,
      data: {
        name: "شروط الوضوء",
        pillars: [],
        conditions: [
          { title: "الإسلام", description: "أن يكون المتوضئ مسلماً" },
          { title: "التمييز", description: "أن يكون مميزاً (يعقل الخطاب ويرد الجواب)" },
          { title: "الطهارة عن الحيض والنفاس", description: "خلو المتوضئ من الحيض والنفاس أثناء الوضوء" },
          { title: "عما يمنع وصول الماء إلى البشرة", description: "عدم وجود حائل كالدهان والطلاء والشمع" },
          { title: "أن لا يكون على العضو ما يغير الماء", description: "خلو العضو مما يغير الماء تغيراً مؤثراً كالعطر المركز" },
          { title: "العلم بفرضيته", description: "أن يعلم أن الوضوء فرض" },
          { title: "أن لا يعتقد فرضاً من فروضه سنة", description: "عدم اعتقاد ركن معين أنه سنة" },
          { title: "الماء الطهور", description: "أن يكون الماء مطهراً (طهوراً)" },
          { title: "دخول الوقت لدائم الحدث", description: "دخول وقت الصلاة لمن به سلس بول ونحوه" },
          { title: "الموالاة لدائم الحدث", description: "الموالاة بين أفعال الوضوء وبين الوضوء والصلاة لدائم الحدث" }
        ],
        invalidators: [],
        rulings: [],
        commonMistakes: [
          { title: "اعتقاد فرض معين سنة", description: "إذا اعتقد العامي أن مسح الرأس سنة بطل وضوؤه" }
        ]
      }
    },
    {
      id: "concept_wudu_invals",
      lessonId: "lesson_wudu_invals",
      referenceId: "ref_wudu_invals",
      conceptName: "نواقض الوضوء",
      category: "الطهارة",
      rulingLevel: "beginner" as const,
      madhhabPosition: "mutamad" as const,
      notesForAdvancedStudents: "لمس المرأة ينقض الوضوء عند الشافعية بلا حائل وبغض النظر عن وجود شهوة، بشرط أن يبلغا حد الشهوة.",
      scientificConfidence: 0,
      status: "draft" as const,
      data: {
        name: "نواقض الوضوء",
        pillars: [],
        conditions: [],
        invalidators: [
          { title: "الخارج من أحد السبيلين من قبل أو دبر", description: "كل ما خرج من القبل أو الدبر ريحاً أو غيره إلا المني" },
          { title: "زوال العقل بموت أو نوم أو غير ذلك", description: "فقد الإدراك إلا نوم متمكن مقعده من الأرض" },
          { title: "التقاء بشرتي ذكر وأنثى كبيرين أجنبيين من غير حائل", description: "لمس الجلد للجلد بين رجل وامرأة بلغا حد الشهوة وليسا محرمين وبلا حائل" },
          { title: "مس قبل الآدمي أو حلقة دبره ببطن الراحة أو بطون الأصابع", description: "لمس الفرج أو الدبر باليد مباشرة وبلا حائل" }
        ],
        rulings: [
          { title: "استثناء نوم المتمكن مقعده", description: "النوم جالساً ممكناً مقعده من الأرض لا ينقض الوضوء" }
        ],
        commonMistakes: [
          { title: "نقض الوضوء بنوم المتمكن", description: "يعتقد البعض أن أي نوم ينقض الوضوء، بينما نوم المتمكن مستثنى شرعاً" }
        ]
      }
    },
    {
      id: "concept_ghusl",
      lessonId: "lesson_ghusl",
      referenceId: "ref_ghusl",
      conceptName: "موجبات وفروض الغسل",
      category: "الطهارة",
      rulingLevel: "beginner" as const,
      madhhabPosition: "mutamad" as const,
      notesForAdvancedStudents: "خروج المني يوجب الغسل ولا ينقض الوضوء، ويجب غسل باطن الأذن والمغابن وكل جزء من البشرة والشعر.",
      scientificConfidence: 0,
      status: "draft" as const,
      data: {
        name: "موجبات وفروض الغسل",
        pillars: [
          { title: "النية", description: "نية رفع الحدث الأكبر أو استباحة الصلاة" },
          { title: "تعميم البدن بالماء", description: "إيصال الماء إلى جميع أجزاء البشرة والشعر ظاهراً وباطناً وإن كثف" }
        ],
        conditions: [],
        invalidators: [],
        rulings: [
          { title: "موجبات الغسل المشتركة", description: "إيلاج الحشفة في الفرج، خروج المني، والموت" },
          { title: "موجبات الغسل الخاصة بالنساء", description: "الحيض، النفاس، والولادة" }
        ],
        commonMistakes: [
          { title: "إهمال تخليل الشعر الكثيف", description: "يجب تعميم الماء على أصول الشعر الكثيف والخفيف وجلده" }
        ]
      }
    },
    // Prayer concepts
    {
      id: "concept_salat_conds",
      lessonId: "lesson_salat_conds",
      referenceId: "ref_salat_conds",
      conceptName: "شروط الصلاة",
      category: "الصلاة",
      rulingLevel: "beginner" as const,
      madhhabPosition: "mutamad" as const,
      notesForAdvancedStudents: "ستر العورة يشترط فيه أن لا يصف البشرة ولا يشف، واستقبال القبلة شرط مع العلم والقدرة وإلا سقط.",
      scientificConfidence: 0,
      status: "draft" as const,
      data: {
        name: "شروط الصلاة",
        pillars: [],
        conditions: [
          { title: "الإسلام", description: "أن يكون المصلي مسلماً فلا تصح من كافر" },
          { title: "التمييز", description: "أن يكون مميزاً عاقلاً يعقل الخطاب" },
          { title: "الطهارة من الحدثين", description: "الطهارة من الحدث الأصغر والأكبر" },
          { title: "إزالة النجاسة", description: "إزالة النجاسة عن الثوب والبدن والمكان" },
          { title: "ستر العورة", description: "ستر العورة بشروطها من كون الثوب لا يصف ولا يشف" },
          { title: "استقبال القبلة", description: "التوجه إلى الكعبة مع العلم والقدرة" },
          { title: "النية", description: "نية الصلاة المعينة مقترنة بتكبيرة الإحرام" },
          { title: "دخول الوقت", description: "دخول وقت الصلاة المحدد شرعاً" },
          { title: "العلم بفرضيتها", description: "أن يعلم أن الصلاة المفروضة فرض" },
          { title: "عدم اعتقاد فرض سنة", description: "أن لا يعتقد ركناً من أركان الصلاة أنه سنة" }
        ],
        invalidators: [],
        rulings: [
          { title: "المشي إلى الصلاة لخشية فوات الوقت", description: "إذا خاف فوات الوقت وجب المشي ولو كان في صلاة نافلة" },
          { title: "عدم اشتغال الذمة بصلاة فائتة", description: "من عليه صلاة فائتة لا تصح نفلته حتى يقضيها" }
        ],
        commonMistakes: [
          { title: "إهمال الطهارة من الحدث الأكبر", description: "بعض الطلاب يعتقد أن الوضوء كافٍ ولو كان جنباً" },
          { title: "اعتقاد أن ستر العورة ليس شرطاً", description: "ستر العورة شرط لصحة الصلاة عند الشافعية" }
        ]
      }
    },
    {
      id: "concept_salat_pillars",
      lessonId: "lesson_salat_pillars",
      referenceId: "ref_salat_pillars",
      conceptName: "أركان الصلاة",
      category: "الصلاة",
      rulingLevel: "beginner" as const,
      madhhabPosition: "mutamad" as const,
      notesForAdvancedStudents: "تكبيرة الإحرام لفظها (الله أكبر) فقط، ولا تكفي (الله الأكبر). والنية للخروج من الصلاة ركن عند المعتمد.",
      scientificConfidence: 0,
      status: "draft" as const,
      data: {
        name: "أركان الصلاة",
        pillars: [
          { title: "النية", description: "نية الصلاة المعينة مقارنة لتكبيرة الإحرام" },
          { title: "تكبيرة الإحرام", description: "قول (الله أكبر) لافتتاح الصلاة" },
          { title: "القيام", description: "الوقوف على الرجلين للقادر على القيام" },
          { title: "قراءة الفاتحة", description: "قراءة سورة الفاتحة في كل ركعة" },
          { title: "الركوع", description: "الانحناء بحيث تنال الراحتان الركبتين" },
          { title: "الاطمئنان في الركوع", description: "السكون والاستقرار في الركوع" },
          { title: "الرفع من الركوع", description: "العودة من الركوع إلى القيام" },
          { title: "الاعتدال قائماً", description: "الاستقامة واقفاً بعد الرفع من الركوع" },
          { title: "السجود", description: "وضع الجبهة على الأرض في السجود" },
          { title: "الاطمئنان في السجود", description: "السكون والاستقرار في السجود" },
          { title: "الجلوس بين السجدتين", description: "الجلوس بعد السجدة الأولى قبل الثانية" },
          { title: "الاطمئنان بين السجدتين", description: "السكون والاستقرار في الجلسة بين السجدتين" },
          { title: "الجلوس للتشهد الأخير", description: "الجلوس لقراءة التشهد الأخير" },
          { title: "التشهد الأخير", description: "قراءة التشهد في الجلسة الأخيرة" },
          { title: "الصلاة على النبي", description: "الصلاة على النبي صلى الله عليه وسلم بعد التشهد الأخير" },
          { title: "التسليمة الأولى", description: "التسليمة الأولى (السلام) للخروج من الصلاة" },
          { title: "ترتيب الأركان", description: "ترتيب الأركان كما ذكرت، فمن قدم سجوداً على ركوع لم يصح" },
          { title: "نية الخروج من الصلاة", description: "نية الخروج من الصلاة عند السلام" }
        ],
        conditions: [],
        invalidators: [],
        rulings: [],
        commonMistakes: [
          { title: "قراءة الفاتحة في الركعة الثالثة والرابعة", description: "تجب قراءة الفاتحة في كل ركعة، ولا تسقط في الثالثة والرابعة" },
          { title: "ترك الطمأنينة", description: "كثير من المصلين لا يطمئن في الركوع والسجود وهو ركن" }
        ]
      }
    },
    {
      id: "concept_salat_sunnahs",
      lessonId: "lesson_salat_sunnahs",
      referenceId: "ref_salat_sunnahs",
      conceptName: "سنن الصلاة",
      category: "الصلاة",
      rulingLevel: "beginner" as const,
      madhhabPosition: "mutamad" as const,
      notesForAdvancedStudents: "رفع اليدين سنة، ومواضعه أربعة عند الشافعية: تكبيرة الإحرام والركوع والرفع منه والقيام من التشهد الأول.",
      scientificConfidence: 0,
      status: "draft" as const,
      data: {
        name: "سنن الصلاة",
        pillars: [],
        conditions: [],
        invalidators: [],
        rulings: [
          { title: "رفع اليدين", description: "رفع اليدين حذو المنكبين في أربعة مواضع" },
          { title: "وضع اليمين على الشمال", description: "وضع اليد اليمنى على اليسرى تحت السرة" },
          { title: "دعاء الافتتاح", description: "دعاء الاستفتاح بعد تكبيرة الإحرام" },
          { title: "التعوذ", description: "الاستعاذة بالله من الشيطان الرجيم قبل القراءة" },
          { title: "التأمين", description: "قول آمين بعد قراءة الفاتحة" },
          { title: "قراءة السورة", description: "قراءة سورة أو آيات بعد الفاتحة في الأوليين" },
          { title: "الجهر والإسرار", description: "الجهر في الصبح والمغرب والعشاء، والإسرار في الظهر والعصر" },
          { title: "التسبيح في الركوع والسجود", description: "قول سبحان ربي العظيم في الركوع وسبحان ربي الأعلى في السجود" },
          { title: "الافتراش والتورك", description: "الافتراش في الجلوس بين السجدتين والتشهد الأول، والتورك في التشهد الأخير" },
          { title: "التسليمة الثانية", description: "التسليمة الثانية بعد الأولى" },
          { title: "دعاء القنوت", description: "دعاء القنوت في صلاة الصبح بعد الرفع من الركوع في الركعة الثانية" }
        ],
        commonMistakes: [
          { title: "ظن بعض السنن أركاناً", description: "بعض الطلاب يعتقد أن رفع اليدين ركن وليس سنة" }
        ]
      }
    },
    {
      id: "concept_salat_invals",
      lessonId: "lesson_salat_invals",
      referenceId: "ref_salat_invals",
      conceptName: "مبطلات الصلاة",
      category: "الصلاة",
      rulingLevel: "beginner" as const,
      madhhabPosition: "mutamad" as const,
      notesForAdvancedStudents: "القهقهة تبطل الصلاة والوضوء معاً عند الشافعية. والحركة اليسيرة العرفاً لا تبطل وإن تكررت.",
      scientificConfidence: 0,
      status: "draft" as const,
      data: {
        name: "مبطلات الصلاة",
        pillars: [],
        conditions: [],
        invalidators: [
          { title: "الكلام العمد", description: "التكلم بحرفين فأكثر عمداً غير القرآن والذكر والدعاء" },
          { title: "الأكل والشرب", description: "تعمد الأكل أو الشرب ولو قليلاً" },
          { title: "القهقهة", description: "الضحك المشتمل على صوت يبطل الصلاة والوضوء" },
          { title: "زيادة ركن فعلي عمداً", description: "فعل ركن زائد كركوع إضافي عن عمد" },
          { title: "نقص ركن", description: "ترك ركن من أركان الصلاة عمداً أو سهواً" },
          { title: "الحركة الكثيرة", description: "الحركة المتوالية الكثيرة غير الضرورية" },
          { title: "الشك في النية", description: "الشك في نية الصلاة كالتردد بين عدد الركعات" },
          { title: "انكشاف العورة", description: "انكشاف العورة مع العلم والقدرة على الستر" },
          { title: "استدبار القبلة", description: "الانحراف عن القبلة بكل البدن" },
          { title: "الحدث", description: "حدوث حدث أصغر أو أكبر أثناء الصلاة" },
          { title: "زوال العقل", description: "فقد العقل بجنون أو إغماء" },
          { title: "الردة", description: "الخروج عن الإسلام" }
        ],
        rulings: [],
        commonMistakes: [
          { title: "الضحك الخفيف", description: "الضحك الخفيف (التبسم) لا يبطل الصلاة" },
          { title: "الحركة اليسيرة", description: "الحركة اليسيرة عرفاً كحك الجسد لا تبطل الصلاة" }
        ]
      }
    },
    {
      id: "concept_sujud_sahw",
      lessonId: "lesson_sujud_sahw",
      referenceId: "ref_sujud_sahw",
      conceptName: "سجود السهو",
      category: "الصلاة",
      rulingLevel: "beginner" as const,
      madhhabPosition: "mutamad" as const,
      notesForAdvancedStudents: "سجود السهو يكون قبل السلام في الأكثر (كتقديم التشهد) وبعده في الأقل (كزيادة ركن قولي).",
      scientificConfidence: 0,
      status: "draft" as const,
      data: {
        name: "سجود السهو",
        pillars: [
          { title: "سجدتان", description: "سجدتان يسجدهما المصلي لجبر الخلل الحاصل في الصلاة" }
        ],
        conditions: [
          { title: "الطهارة", description: "يشترط في سجود السهو ما يشترط في سجود الصلاة من الطهارة" },
          { title: "ستر العورة", description: "يشترط ستر العورة كما في الصلاة" },
          { title: "استقبال القبلة", description: "يشترط استقبال القبلة كما في الصلاة" }
        ],
        invalidators: [],
        rulings: [
          { title: "النقص في الصلاة", description: "نقص جزء كترك التشهد الأول أو القنوت" },
          { title: "الزيادة في الصلاة", description: "زيادة فعل كزيادة ركعة أو سجدة" },
          { title: "الشك في عدد الركعات", description: "كالتردد بين ثلاث وأربع فيأخذ بالأكثر ويسجد للسهو" }
        ],
        commonMistakes: [
          { title: "سجود السهو بعد السلام دائماً", description: "الأصل أن سجود السهو قبل السلام في أكثر الصور" }
        ]
      }
    }
  ];
  await db.insert(conceptBank).values(conceptData);

  // 9. Seed Question Templates
  console.log("🌱 Seeding Question Templates...");
  const templateData = [
    {
      id: "tmpl_recall_pillar",
      type: "recall" as const,
      difficulty: "easy" as const,
      templateText: "أي مما يلي يعتبر ركناً/فرضاً من {concept}؟",
      explanationTemplate: "نعم! يعتبر ({item}) ركناً أساسياً من أركان {concept} كما ورد في المتن المعتمد.",
      status: "draft" as const
    },
    {
      id: "tmpl_distinguish_condition",
      type: "distinguish" as const,
      difficulty: "medium" as const,
      templateText: "أي مما يلي ليس من {concept}؟",
      explanationTemplate: "إجابة صحيحة! ({item}) ليس من {concept}.",
      status: "draft" as const
    },
    {
      id: "tmpl_apply_ruling",
      type: "apply" as const,
      difficulty: "hard" as const,
      templateText: "توضأ شخص ثم {scenario}، ما حكم وضوئه وطهارته في مذهب الشافعية؟",
      explanationTemplate: "صحيح! حكمه هو: ({item}). العلة هي: {reason}.",
      status: "draft" as const
    },
    {
      id: "tmpl_synthesis_invalidators",
      type: "synthesis" as const,
      difficulty: "hard" as const,
      templateText: "أي من الحالات التالية تؤدي إلى بطلان {concept} بالكامل؟",
      explanationTemplate: "رائع! الحالة التي تبطل {concept} هي: ({item}). لأنها تجمع نواقض أو تبطل شروط الصحة المعتمدة.",
      status: "draft" as const
    },
    {
      id: "tmpl_true_false",
      type: "true_false" as const,
      difficulty: "easy" as const,
      templateText: "هل العبارة التالية صحيحة؟ {concept}",
      explanationTemplate: "شرح السؤال: {item}.",
      status: "draft" as const
    },
    {
      id: "tmpl_fill_in",
      type: "fill_in" as const,
      difficulty: "medium" as const,
      templateText: "املأ الفراغ في النص التالي المتعلق بـ {concept}",
      explanationTemplate: "الإجابة الصحيحة: {item}.",
      status: "draft" as const
    }
  ];
  await db.insert(questionTemplates).values(templateData);

  // 10. Seed Badges
  console.log("🌱 Seeding Badges...");
  await db.insert(badges).values([...BADGE_CATALOG]).onConflictDoNothing();

  // 11. Approve MVP content through the review workflow to demonstrate proper content lifecycle
  // In production, a reviewer would do this via the admin UI.
  // Here we simulate the approval to make the platform functional for MVP.
  console.log("📋 Approving MVP content through review workflow...");
  const mvpLessonIds = [
    "lesson_puberty",
    "lesson_istinja",
    "lesson_wudu_pillars",
    "lesson_wudu_conds",
    "lesson_wudu_invals",
    "lesson_ghusl"
  ];
  const mvpConceptIds = [
    "concept_puberty",
    "concept_istinja",
    "concept_wudu_pillars",
    "concept_wudu_conds",
    "concept_wudu_invals",
    "concept_ghusl"
  ];

  // First, submit lessons and concepts for review
  for (const lessonId of mvpLessonIds) {
    await db.update(lessons).set({ status: "reviewed", updatedAt: new Date() }).where(eq(lessons.id, lessonId));
  }
  for (const conceptId of mvpConceptIds) {
    await db.update(conceptBank).set({ status: "reviewed", updatedAt: new Date() }).where(eq(conceptBank.id, conceptId));
  }

  // Then approve all MVP content, setting audit trail
  const now = new Date();
  for (const lessonId of mvpLessonIds) {
    await db.update(lessons).set({ status: "published", updatedAt: now }).where(eq(lessons.id, lessonId));
    await db.insert(contentReviews).values({
      id: `rev_seed_lesson_${lessonId}`,
      entityType: "lesson",
      entityId: lessonId,
      reviewerId: "seed",
      status: "approved",
      notes: "موافقة تلقائية للمحتوى الأساسي للمرحلة الأولى (MVP)",
      reviewedAt: now
    });
  }
  for (const conceptId of mvpConceptIds) {
    await db.update(conceptBank).set({
      status: "published",
      scientificConfidence: 100,
      approvedBy: "seed",
      reviewDate: now,
      updatedAt: now
    }).where(eq(conceptBank.id, conceptId));
    await db.insert(contentReviews).values({
      id: `rev_seed_concept_${conceptId}`,
      entityType: "concept",
      entityId: conceptId,
      reviewerId: "seed",
      status: "approved",
      notes: "اعتماد المحتوى العلمي للمرحلة الأولى (MVP) بعد المراجعة",
      reviewedAt: now
    });
  }

  // Also approve the question templates
  for (const tmpl of ["tmpl_recall_pillar", "tmpl_distinguish_condition", "tmpl_apply_ruling", "tmpl_synthesis_invalidators", "tmpl_true_false", "tmpl_fill_in"]) {
    await db.update(questionTemplates).set({ status: "published", updatedAt: now }).where(eq(questionTemplates.id, tmpl));
    await db.insert(contentReviews).values({
      id: `rev_seed_template_${tmpl}`,
      entityType: "question_template",
      entityId: tmpl,
      reviewerId: "seed",
      status: "approved",
      notes: "اعتماد قالب الأسئلة للمرحلة الأولى (MVP)",
      reviewedAt: now
    });
  }

  console.log("✅ Database seeding completed successfully!");
}

main()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
