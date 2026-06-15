import "dotenv/config";
import { db } from "./index";
import { 
  levels, 
  books, 
  units, 
  skills, 
  lessons, 
  fiqhReferences, 
  conceptBank, 
  questionTemplates 
} from "./schema";

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
    { id: "safina", levelId: 0, title: "سفينة النجاة", author: "الشيخ سالم بن سمير الحضرمي", description: "متن مختصر عظيم النفع للمبتدئين في أصول الدين والفقه", order: 1, status: "published" as const },
    { id: "yaqut", levelId: 0, title: "الياقوت النفيس", author: "السيد أحمد بن عمر الشاطري", description: "متن فقهي مميز بعبارته العصرية ووضوح تبويبه", order: 2, status: "draft" as const },
    { id: "muqaddimah_hadramiyyah", levelId: 0, title: "المقدمة الحضرمية", author: "الشيخ عبد الله بن عبد الرحمن بافضل", description: "شرح واسع التفصيل في ربع العبادات لضبط فروع الطهارة والصلاة", order: 3, status: "draft" as const },
    
    // Level 1
    { id: "abi_shuja", levelId: 1, title: "متن أبي شجاع", author: "القاضي أبو شجاع", description: "عمدة المتون المختصرة الشاملة لجميع أبواب الفقه", order: 1, status: "draft" as const },
    { id: "fath_alqareeb", levelId: 1, title: "فتح القريب المجيب", author: "ابن قاسم الغزي", description: "شرح مباشر وسهل لفك عبارات متن الغاية والتقريب", order: 2, status: "draft" as const },
    { id: "kifayat_alakhyar", levelId: 1, title: "كفاية الأخيار", author: "الشيخ تقي الدين الحصني", description: "شرح متوسع يذكر الأدلة الفقهية والتعليلات الشرعية للمسائل", order: 3, status: "draft" as const },
    
    // Level 2
    { id: "umdat_assalik", levelId: 2, title: "عمدة السالك وعدة الناسك", author: "ابن النقيب المصري", description: "متن دقيق ومنظم وأوسع مسائل من متن أبي شجاع", order: 1, status: "draft" as const },
    { id: "manhaj_alqawim", levelId: 2, title: "المنهج القويم", author: "ابن حجر الهيتمي", description: "شرح مميز على المقدمة الحضرمية يُعد من ركائز الفتوى في العبادات", order: 2, status: "draft" as const },
    { id: "fath_almuin", levelId: 2, title: "فتح المعين بشرح قرة العين", author: "الشيخ زين الدين المليباري", description: "شرح دقيق يعتمد عليه متأخرو الشافعية في الفتوى والقضاء", order: 3, status: "draft" as const },
    { id: "ianat_attalibin", levelId: 2, title: "إعانة الطالبين", author: "السيد البكري الدمياطي", description: "حاشية موسعة على فتح المعين تفيد في تفريعات المسائل الحادثة", order: 4, status: "draft" as const },
 
    // Level 3
    { id: "minhaj_attalibin", levelId: 3, title: "منهاج الطالبين", author: "الإمام النووي", description: "عمدة التحقيق والفتوى في المذهب الشافعي بألفاظه المحررة", order: 1, status: "draft" as const },
    { id: "mughni_almuhtaj", levelId: 3, title: "مغني المحتاج", author: "الخطيب الشربيني", description: "شرح واضح العبارة وسهل التقريب لمسائل المنهاج", order: 2, status: "draft" as const },
    { id: "nihayat_almuhtaj", levelId: 3, title: "نهاية المحتاج", author: "الإمام شمس الدين الرملي", description: "ركيزة الفتوى المعتمدة لدى المحققين من متأخري الشافعية", order: 3, status: "draft" as const },
    { id: "tuhfat_almuhtaj", levelId: 3, title: "تحفة المحتاج", author: "الإمام ابن حجر الهيتمي", description: "أعلى مصنفات التحرير الفقهي والفتوى المعتمدة في المذهب", order: 4, status: "draft" as const },
    { id: "hawashi_shirwani", levelId: 3, title: "حواشي الشرواني والعبادي", author: "الشيخ الشرواني والعبادي", description: "حاشية دقيقة تفصل تحقيقات تحفة المحتاج الفقهية", order: 5, status: "draft" as const },
 
    // Level 4
    { id: "muhazzab", levelId: 4, title: "المهذب في فقه الشافعي", author: "الإمام الشيرازي", description: "شرح عمدة لضبط الأدلة العقلية والنقلية ومسائل فقه العراقيين", order: 1, status: "draft" as const },
    { id: "majmu", levelId: 4, title: "المجموع شرح المهذب", author: "الإمام النووي", description: "الموسوعة الأعظم للفقه المقارن والأدلة والاستدلال المذهبي", order: 2, status: "draft" as const },
    { id: "rawdat_attalibin", levelId: 4, title: "روضة الطالبين", author: "الإمام النووي", description: "مرجع واسع لتحقيق الفتاوى وتحرير المسائل قبل المنهاج", order: 3, status: "draft" as const },
    { id: "umm", levelId: 4, title: "الأم", author: "الإمام محمد بن إدريس الشافعي", description: "المصدر الأم والمنبع الأول لفقه المذهب من كلام الشافعي مباشرة", order: 4, status: "draft" as const }
  ];
  await db.insert(books).values(bookData);
 
  // 4. Seed Unit: Purity Chapter for Safinat al-Naja
  console.log("🌱 Seeding Unit for Safina (Taharah)...");
  await db.insert(units).values({
    id: "safina_taharah",
    bookId: "safina",
    title: "باب الطهارة",
    description: "دراسة شاملة لأحكام الطهارة، الوضوء، الغسل، وإزالة النجاسات من متن سفينة النجاة",
    order: 1,
    status: "published"
  });
 
  // 5. Seed Skills inside Taharah
  console.log("🌱 Seeding Skills for Taharah...");
  const skillData = [
    { id: "skill_puberty", unitId: "safina_taharah", title: "علامات البلوغ", order: 1, status: "published" as const },
    { id: "skill_istinja", unitId: "safina_taharah", title: "الاستنجاء بالحجر", order: 2, status: "published" as const },
    { id: "skill_wudu_pillars", unitId: "safina_taharah", title: "فروض الوضوء", order: 3, status: "published" as const },
    { id: "skill_wudu_conds", unitId: "safina_taharah", title: "شروط الوضوء", order: 4, status: "published" as const },
    { id: "skill_wudu_invals", unitId: "safina_taharah", title: "نواقض الوضوء", order: 5, status: "published" as const },
    { id: "skill_ghusl", unitId: "safina_taharah", title: "موجبات وفروض الغسل", order: 6, status: "published" as const }
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
      status: "published" as const
    },
    {
      id: "lesson_istinja",
      skillId: "skill_istinja",
      title: "شروط الاستنجاء بالحجر",
      content: "شُرُوطُ إِجْزَاءِ الْحَجَرِ ثَمَانِيَةٌ: أَنْ يَكُونَ بِثَلَاثَةِ أَحْجَارٍ، وَأَنْ يُنْقِيَ الْمَحَلَّ، وَأَنْ لَا يَجِفَّ الْخَارِجُ، وَلَا يَنْتَقِلَ، وَلَا يَطْرَأَ عَلَيْهِ غَيْرُهُ، وَلَا يُجَاوِزَ صَفْحَتَهُ وَحَشَفَتَهُ، وَلَا يُصِيبَهُ مَاءٌ، وَأَنْ تَكُونَ الْأَحْجَارُ طَاهِرَةً.",
      order: 2,
      xpReward: 15,
      status: "published" as const
    },
    {
      id: "lesson_wudu_pillars",
      skillId: "skill_wudu_pillars",
      title: "فروض الوضوء وأحكام النية",
      content: "فُرُوضُ الْوُضُوءِ سِتَّةٌ: الْأَوَّلُ: النِّيَّةُ عِنْدَ غَسْلِ الْوَجْهِ، الثَّانِي: غَسْلُ الْوَجْهِ، الثَّالِثُ: غَسْلُ الْيَدَيْنِ مَعَ الْمِرْفَقَيْنِ، الرَّابِعُ: مَسْحُ شَيْءٍ مِنَ الرَّأْسِّ، الْخَامِسُ: غَسْلُ الرِّجْلَيْنِ مَعَ الْكَعْبَيْنِ، السَّادِسُ: التَّرْتِيبُ.",
      order: 3,
      xpReward: 15,
      status: "published" as const
    },
    {
      id: "lesson_wudu_conds",
      skillId: "skill_wudu_conds",
      title: "شروط الوضوء",
      content: "شُرُوطُ الْوُضُوءِ عَشَرَةٌ: الْإِسْلَامُ، وَالتَّمْيِيزُ، وَالطَّهَارَةُ عَنِ الْحَيْضِ وَالنِّفَاسِ، وَعَمَّا يَمْنَعُ وُصُولَ الْمَاءِ إِلَى الْبَشَرَةِ، وَأَنْ لَا يَكُونَ عَلَى الْعُضْوِ مَا يُغَيِّرُ الْمَاءَ، وَالْعِلْمُ بِفَرْضِيَّتِهِ، وَأَنْ لَا يَعْتَقِدَ فَرْضاً مِنْ فُرُوضِهِ سُنَّةً، وَالْمَاءُ الطَّهُورُ، وَدُخُولُ الْوَقْتِ، وَالْمُوَالَاةُ لِدَائِمِ الْحَدَثِ.",
      order: 4,
      xpReward: 15,
      status: "published" as const
    },
    {
      id: "lesson_wudu_invals",
      skillId: "skill_wudu_invals",
      title: "نواقض الوضوء",
      content: "نَوَاقِضُ الْوُضُوءِ أَرْبَعَةُ أَشْيَاءَ: الْأَوَّلُ: الْخَارِجُ مِنْ أَحَدِ السَّبِيلَيْنِ مِنْ قُبُلٍ أَوْ دُبُرٍ رِيحٌ أَوْ غَيْرُهُ إِلَّا الْمَنِيَّ، الثَّانِي: زَوَالُ الْعَقْلِ بِنَوْمٍ أَوْ غَيْرِهِ إِلَّا نَوْمَ قَاعِدٍ مُمَكِّنٍ مَقْعَدَهُ مِنَ الْأَرْضِ، الثَّالِثُ: الْتِقَاءُ بَشَرَتَيْ ذَكَرٍ وَأُنْثَى كَبِيرَيْنِ أَجْنَبِيَّيْنِ مِنْ غَيْرِ حَائِلٍ، الرَّابِعُ: مَسُّ قُبُلِ الْآدَمِيِّ أَوْ حَلْقَةِ دُبُرِهِ بِبَطْنِ الرَّاحَةِ أَوْ بُطُونِ الْأَصَابِعِ.",
      order: 5,
      xpReward: 15,
      status: "published" as const
    },
    {
      id: "lesson_ghusl",
      skillId: "skill_ghusl",
      title: "موجبات الغسل وفروضه",
      content: "مُوجِبَاتُ الْغُسْلِ سِتَّةٌ: إِيلَاجُ الْحَشَفَةِ فِي الْفَرْجِ، وَخُرُوجُ الْمَنِيِّ، وَالْمَوْتُ، وَالْحَيْضُ، وَالنِّفَاسُ، وَالْوِلَادَةُ. وَفُرُوضُهُ اثْنَانِ: النِّيَّةُ، وَتَعْمِيمُ الْبَدَنِ بِالْمَاءِ.",
      order: 6,
      xpReward: 15,
      status: "published" as const
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
      scientificConfidence: 100,
      status: "published" as const,
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
      scientificConfidence: 100,
      status: "published" as const,
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
      scientificConfidence: 100,
      status: "published" as const,
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
      scientificConfidence: 100,
      status: "published" as const,
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
      scientificConfidence: 100,
      status: "published" as const,
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
      scientificConfidence: 100,
      status: "published" as const,
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
      status: "published" as const
    },
    {
      id: "tmpl_distinguish_condition",
      type: "distinguish" as const,
      difficulty: "medium" as const,
      templateText: "أي مما يلي ليس من {concept}؟",
      explanationTemplate: "إجابة صحيحة! ({item}) ليس من {concept}.",
      status: "published" as const
    },
    {
      id: "tmpl_apply_ruling",
      type: "apply" as const,
      difficulty: "hard" as const,
      templateText: "توضأ شخص ثم {scenario}، ما حكم وضوئه وطهارته في مذهب الشافعية؟",
      explanationTemplate: "صحيح! حكمه هو: ({item}). العلة هي: {reason}.",
      status: "published" as const
    },
    {
      id: "tmpl_synthesis_invalidators",
      type: "synthesis" as const,
      difficulty: "hard" as const,
      templateText: "أي من الحالات التالية تؤدي إلى بطلان {concept} بالكامل؟",
      explanationTemplate: "رائع! الحالة التي تبطل {concept} هي: ({item}). لأنها تجمع نواقض أو تبطل شروط الصحة المعتمدة.",
      status: "published" as const
    }
  ];
  await db.insert(questionTemplates).values(templateData);

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
