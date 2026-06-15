import { generateQuestion, Concept, QuestionTemplate } from "../lib/generator";

// Mock concepts for testing
const mockConcepts: Concept[] = [
  {
    id: "concept_wudu_pillars",
    conceptName: "فروض الوضوء",
    category: "الطهارة",
    notesForAdvancedStudents: "تجب النية مقترنة بغسل أول جزء من الوجه.",
    data: {
      name: "فروض الوضوء",
      pillars: [
        { title: "النية عند غسل الوجه", description: "قصد الشيء مقترناً بفعله" },
        { title: "غسل الوجه", description: "غسل كامل الوجه" },
        { title: "غسل اليدين مع المرفقين", description: "غسل اليدين للمرفقين" }
      ],
      conditions: [],
      invalidators: [],
      rulings: [],
      commonMistakes: [
        { title: "تأخير النية", description: "تأخير النية عن غسل أول جزء من الوجه" }
      ]
    }
  },
  {
    id: "concept_wudu_conds",
    conceptName: "شروط الوضوء",
    category: "الطهارة",
    notesForAdvancedStudents: "دائم الحدث يلزمه الموالاة.",
    data: {
      name: "شروط الوضوء",
      pillars: [],
      conditions: [
        { title: "الإسلام", description: "أن يكون مسلماً" },
        { title: "التمييز", description: "أن يكون مميزاً" },
        { title: "الماء الطهور", description: "الماء المطهر" }
      ],
      invalidators: [],
      rulings: [],
      commonMistakes: []
    }
  },
  {
    id: "concept_wudu_invals",
    conceptName: "نواقض الوضوء",
    category: "الطهارة",
    notesForAdvancedStudents: "لمس المرأة الأجنبية ينقض بلا حائل.",
    data: {
      name: "نواقض الوضوء",
      pillars: [],
      conditions: [],
      invalidators: [
        { title: "الخارج من السبيلين", description: "أي خارج إلا المني" },
        { title: "التقاء بشرتي ذكر وأنثى أجنبيين", description: "اللمس بلا حائل" }
      ],
      rulings: [
        { title: "نوم القاعد الممكن مقعده", description: "النوم جالساً متمكناً لا ينقض" }
      ],
      commonMistakes: []
    }
  }
];

// Mock templates
const mockTemplates: QuestionTemplate[] = [
  {
    id: "tmpl_recall",
    type: "recall",
    difficulty: "easy",
    templateText: "أي مما يلي يعتبر ركناً من {concept}؟",
    explanationTemplate: "نعم! يعتبر ({item}) ركناً أساسياً من أركان {concept}."
  },
  {
    id: "tmpl_distinguish",
    type: "distinguish",
    difficulty: "medium",
    templateText: "أي مما يلي ليس من {concept}؟",
    explanationTemplate: "إجابة صحيحة! ({item}) ليس من {concept}."
  },
  {
    id: "tmpl_apply",
    type: "apply",
    difficulty: "hard",
    templateText: "توضأ شخص ثم {scenario}، ما حكم وضوئه وطهارته؟",
    explanationTemplate: "صحيح! حكمه هو: ({item}). العلة هي: {reason}."
  },
  {
    id: "tmpl_synthesis",
    type: "synthesis",
    difficulty: "hard",
    templateText: "أي من الحالات التالية تؤدي إلى بطلان {concept} بالكامل؟",
    explanationTemplate: "رائع! الحالة التي تبطل {concept} هي: ({item})."
  },
  {
    id: "tmpl_true_false",
    type: "true_false",
    difficulty: "easy",
    templateText: "هل العبارة التالية صحيحة؟ {concept}",
    explanationTemplate: "شرح السؤال: {item}."
  },
  {
    id: "tmpl_synthesis",
    type: "synthesis",
    difficulty: "hard",
    templateText: "أي من الحالات التالية تؤدي إلى بطلان {concept} بالكامل؟",
    explanationTemplate: "رائع! الحالة التي تبطل {concept} هي: ({item})."
  },
  {
    id: "tmpl_true_false",
    type: "true_false",
    difficulty: "easy",
    templateText: "هل العبارة التالية صحيحة؟ {concept}",
    explanationTemplate: "شرح السؤال: {item}."
  },
  {
    id: "tmpl_fill_in",
    type: "fill_in",
    difficulty: "medium",
    templateText: "املأ الفراغ في النص التالي المتعلق بـ {concept}",
    explanationTemplate: "الإجابة الصحيحة: {item}."
  }
];

function runTests() {
  console.log("🧪 Running Question Generator Tests...");
  let passed = 0;
  let failed = 0;

  // Test 1: Recall question generation
  try {
    const q = generateQuestion(mockConcepts[0], mockTemplates[0], mockConcepts);
    console.log("✅ Test 1: Recall Question Generated Successfully:");
    console.log(`   Prompt: "${q.questionPrompt}"`);
    console.log(`   Options: [${q.options.map(o => `"${o}"`).join(", ")}]`);
    console.log(`   Correct: "${q.correctAnswer}"`);
    
    // Assertions
    if (q.options.length !== 4) throw new Error("Recall question must have exactly 4 options");
    if (!q.options.includes(q.correctAnswer)) throw new Error("Options must contain the correct answer");
    if (!q.questionPrompt.includes("فروض الوضوء")) throw new Error("Prompt must contain concept name");
    passed++;
  } catch (error) {
    console.error("❌ Test 1 Failed:", error);
    failed++;
  }

  // Test 2: Distinguish question generation
  try {
    const q = generateQuestion(mockConcepts[1], mockTemplates[1], mockConcepts);
    console.log("✅ Test 2: Distinguish Question Generated Successfully:");
    console.log(`   Prompt: "${q.questionPrompt}"`);
    console.log(`   Options: [${q.options.map(o => `"${o}"`).join(", ")}]`);
    console.log(`   Correct: "${q.correctAnswer}"`);

    // Assertions
    if (q.options.length !== 4) throw new Error("Distinguish question must have exactly 4 options");
    if (!q.options.includes(q.correctAnswer)) throw new Error("Options must contain the correct answer");
    if (mockConcepts[1].data.conditions?.map(c => c.title).includes(q.correctAnswer)) {
      throw new Error("Correct answer in 'not a condition' question must NOT be a condition itself");
    }
    passed++;
  } catch (error) {
    console.error("❌ Test 2 Failed:", error);
    failed++;
  }

  // Test 3: Scenario Application question generation
  try {
    const q = generateQuestion(mockConcepts[2], mockTemplates[2], mockConcepts);
    console.log("✅ Test 3: Apply Question Generated Successfully:");
    console.log(`   Prompt: "${q.questionPrompt}"`);
    console.log(`   Correct: "${q.correctAnswer}"`);

    // Assertions
    if (q.options.length !== 4) throw new Error("Apply question must have exactly 4 options");
    if (!q.options.includes(q.correctAnswer)) throw new Error("Options must contain the correct answer");
    if (!q.questionPrompt.includes("توضأ شخص ثم")) throw new Error("Prompt should contain the scenario placeholder");
    passed++;
  } catch (error) {
    console.error("❌ Test 3 Failed:", error);
    failed++;
  }

  // Test 4: Synthesis question generation
  try {
    const q = generateQuestion(mockConcepts[0], mockTemplates[3], mockConcepts);
    console.log("✅ Test 4: Synthesis Question Generated Successfully:");
    console.log(`   Prompt: "${q.questionPrompt}"`);
    console.log(`   Correct: "${q.correctAnswer}"`);

    // Assertions
    if (q.options.length !== 4) throw new Error("Synthesis question must have exactly 4 options");
    if (!q.options.includes(q.correctAnswer)) throw new Error("Options must contain the correct answer");
    passed++;
  } catch (error) {
    console.error("❌ Test 4 Failed:", error);
    failed++;
  }

  // Test 5: True/False question generation
  try {
    const q = generateQuestion(mockConcepts[0], mockTemplates[4], mockConcepts);
    console.log("✅ Test 5: True/False Question Generated Successfully:");
    console.log(`   Prompt: "${q.questionPrompt}"`);
    console.log(`   Correct: "${q.correctAnswer}"`);

    // Assertions
    if (q.options.length !== 2) throw new Error("True/False question must have exactly 2 options");
    if (q.correctAnswer !== "صحيح" && q.correctAnswer !== "خطأ") throw new Error("Correct answer must be one of the true/false values");
    if (!q.questionPrompt.includes("هل العبارة")) throw new Error("Prompt must contain true/false phrasing");
    if (!q.explanation) throw new Error("True/False question must have explanation");
    passed++;
  } catch (error) {
    console.error("❌ Test 5 Failed:", error);
    failed++;
  }

  // Test 6: Fill-in-the-blank question generation
  try {
    const q = generateQuestion(mockConcepts[0], mockTemplates[7], mockConcepts);
    console.log("✅ Test 6: Fill-in Question Generated Successfully:");
    console.log(`   Prompt: "${q.questionPrompt}"`);
    console.log(`   Correct: "${q.correctAnswer}"`);

    // Assertions
    if (q.options.length !== 4) throw new Error("Fill-in question must have exactly 4 options (correct + 3 distractors)");
    if (!q.options.includes(q.correctAnswer)) throw new Error("Options must contain the correct answer");
    if (!q.questionPrompt.includes("______") && !q.questionPrompt.includes("املأ")) throw new Error("Prompt must indicate a fill-in question");
    if (!q.explanation) throw new Error("Fill-in question must have explanation");
    passed++;
  } catch (error) {
    console.error("❌ Test 6 Failed:", error);
    failed++;
  }

  console.log(`\n📊 Test Summary: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("🎉 All generator tests passed successfully!");
    process.exit(0);
  }
}

runTests();
