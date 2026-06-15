/**
 * Question Generator Service for Maslak (درب الشافعي)
 * 
 * Generates jurisprudential questions dynamically by combining database concept bank 
 * JSON data with approved question templates, while strictly ensuring distractors 
 * are pulled from the same category/chapter (باب) to maintain high challenge quality.
 */

export interface ConceptItem {
  title: string;
  description: string;
}

export interface ApplyScenario {
  scen: string;
  ans: string;
  res: string;
  distractors?: string[];
}

export interface ConceptData {
  name: string;
  pillars?: ConceptItem[];
  conditions?: ConceptItem[];
  invalidators?: ConceptItem[];
  rulings?: ConceptItem[];
  commonMistakes?: ConceptItem[];
  applyScenarios?: ApplyScenario[];
}

export interface Concept {
  id: string;
  conceptName: string;
  category: string;
  data: ConceptData;
  notesForAdvancedStudents?: string | null;
}

export interface QuestionTemplate {
  id: string;
  type: "recall" | "distinguish" | "apply" | "synthesis" | "true_false" | "fill_in";
  difficulty: "easy" | "medium" | "hard";
  templateText: string;
  explanationTemplate: string;
}

export interface GeneratedQuestion {
  questionPrompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  type: string;
  token?: string;
}

/**
 * Shuffles an array using the Fisher-Yates algorithm.
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generates a dynamic question based on a concept and a question template.
 * If data is insufficient, it falls back to a safe question format rather than erroring out.
 */
export function generateQuestion(
  concept: Concept,
  template: QuestionTemplate,
  allConcepts: Concept[]
): GeneratedQuestion {
  // Filter concepts from the same category (باب) to retrieve high-quality, closely-related distractors
  const sameCategoryConcepts = allConcepts.filter(
    (c) => c.category === concept.category && c.id !== concept.id
  );

  const conceptName = concept.conceptName;
  let questionPrompt = "";
  let correctAnswer = "";
  let distractors: string[] = [];
  let explanation = "";

  const data = concept.data;

  try {
    switch (template.type) {
      case "recall": {
        // Find a pillar or ruling in the concept to test recall
        const items = [...(data.pillars || []), ...(data.rulings || [])];
        if (items.length === 0) {
          throw new Error("No pillars or rulings available for recall template");
        }
        
        // Choose correct answer
        const selected = items[Math.floor(Math.random() * items.length)];
        correctAnswer = selected.title;

        // Build question text
        questionPrompt = template.templateText.replace("{concept}", conceptName);

        // Gather distractors from same-chapter concepts or invalidators
        // Rule: Distractors must be from the same chapter (باب)
        const possibleDistractors: string[] = [];
        
        // 1. Invalidators from same concept (great distractors)
        if (data.invalidators) {
          possibleDistractors.push(...data.invalidators.map((i) => i.title));
        }
        
        // 2. Pillars/rules/conditions from other concepts in same chapter
        sameCategoryConcepts.forEach((other) => {
          const otherItems = [
            ...(other.data.pillars || []),
            ...(other.data.conditions || []),
            ...(other.data.invalidators || []),
            ...(other.data.rulings || [])
          ];
          possibleDistractors.push(...otherItems.map((item) => item.title));
        });

        // Unique & clean distractors
        const uniqueDistractors = Array.from(new Set(possibleDistractors))
          .filter((d) => d !== correctAnswer && d.trim().length > 0);

        if (uniqueDistractors.length < 3) {
          // Fallback static distractors from general Shafi'i concepts in Taharah if not enough
          uniqueDistractors.push("السواك بعد زوال الشمس للصائم", "النية عند غسل القدمين", "مسح كامل الرأس فرض");
        }

        distractors = shuffleArray(uniqueDistractors).slice(0, 3);
        
        // Build explanation
        explanation = template.explanationTemplate
          .replace("{item}", correctAnswer)
          .replace("{concept}", conceptName);
        break;
      }

      case "distinguish": {
        // Correct answer: something that is NOT a condition (or pillar) of the concept
        // Let's identify the conditions of this concept
        const conditions = data.conditions || [];
        if (conditions.length === 0) {
          throw new Error("No conditions available for distinguish template");
        }

        // Gather valid conditions for distractors
        const validConds = conditions.map(c => c.title);
        distractors = shuffleArray(validConds).slice(0, 3);

        // Correct answer must NOT be a condition. Let's pull from other concepts in same chapter
        const incorrectOptions: string[] = [];
        
        // 1. Pillars or invalidators of this concept
        if (data.pillars) incorrectOptions.push(...data.pillars.map(p => p.title));
        if (data.invalidators) incorrectOptions.push(...data.invalidators.map(i => i.title));
        
        // 2. Anything from other concepts in the same chapter
        sameCategoryConcepts.forEach((other) => {
          const otherItems = [
            ...(other.data.pillars || []),
            ...(other.data.conditions || []),
            ...(other.data.invalidators || []),
            ...(other.data.rulings || [])
          ];
          incorrectOptions.push(...otherItems.map(item => item.title));
        });

        const uniqueIncorrect = Array.from(new Set(incorrectOptions))
          .filter(opt => !validConds.includes(opt) && opt.trim().length > 0);

        if (uniqueIncorrect.length === 0) {
          // Fallback incorrect options
          uniqueIncorrect.push("النية مع أول غسل الوجه (هو فرض وليس شرطاً)");
        }

        correctAnswer = uniqueIncorrect[Math.floor(Math.random() * uniqueIncorrect.length)];
        
        // Build question text
        questionPrompt = template.templateText.replace("{concept}", conceptName);

        // Build explanation
        explanation = template.explanationTemplate
          .replace("{item}", correctAnswer)
          .replace("{concept}", conceptName);
        break;
      }

      case "apply": {
        // Case study/ruling scenario
        // Generate scenario dynamically based on predefined classic Shafi'i jurisprudence cases
        let scenario = "";
        let reason = "";

        if (data.applyScenarios && data.applyScenarios.length > 0) {
          const selected = data.applyScenarios[Math.floor(Math.random() * data.applyScenarios.length)];
          scenario = selected.scen;
          correctAnswer = selected.ans;
          reason = selected.res;
          if (selected.distractors && selected.distractors.length >= 3) {
            distractors = shuffleArray(selected.distractors).slice(0, 3);
          } else {
            distractors = [
              "وضوؤه صحيح تماماً ولا كراهة فيه",
              "يصح ذلك مع الكراهة لمخالفة الاحتياط",
              "لا يصح وتجب إعادة العبادة احتياطاً"
            ];
          }
        } else {
          // Fallback generic scenario
          scenario = `حدثت مسألة تتعلق بأحكام المعتمد في ${conceptName}`;
          correctAnswer = "اتباع المعتمد في المذهب الشافعي";
          reason = "العمل بالمعتمد هو الواجب شرعاً للمقلد والمفتي في المذهب.";
          distractors = [
            "الأخذ بأي قول آخر بلا ضوابط",
            "وجوب التلفيق بين المذاهب الأربعة",
            "ترك العمل بالمسألة بالكلية"
          ];
        }

        questionPrompt = template.templateText.replace("{scenario}", scenario).replace("{concept}", conceptName);
        
        explanation = template.explanationTemplate
          .replace("{item}", correctAnswer)
          .replace("{reason}", reason);
        break;
      }

      case "synthesis": {
        // Group conditions or invalidators into a complex statement
        questionPrompt = template.templateText.replace("{concept}", conceptName);

        if (concept.id === "concept_wudu_invals" || concept.conceptName.includes("نواقض الوضوء")) {
          correctAnswer = "خروج بول من السبيلين مع لمس أجنبية بلا حائل";
          distractors = [
            "النوم جالساً متمكناً مقعده مع مس شعر زوجته",
            "خروج المني مع مس الضفر",
            "زوال العقل بالإغماء مع الاغتسال الفوري"
          ];
        } else if (concept.id === "concept_wudu_conds" || concept.conceptName.includes("شروط الوضوء")) {
          correctAnswer = "وجود مانع لوصول الماء للبشرة مثل طلاء الأظافر العازل";
          distractors = [
            "الوضوء بماء مستعمل في غسلة ثانية مسنونة",
            "الشك في التسمية أثناء غسل الوجه",
            "الكلام العام أثناء الوضوء"
          ];
        } else {
          correctAnswer = `الإخلال بأحد شروط صحة ${conceptName} المعتمدة`;
          distractors = [
            "ترك السنن والمستحبات الواردة في المتن",
            "غسل الأعضاء ثلاثاً بدلاً من مرة واحدة",
            "الاستنجاء بالماء قبل الوضوء مباشرة"
          ];
        }

        explanation = template.explanationTemplate
          .replace("{item}", correctAnswer)
          .replace("{concept}", conceptName);
        break;
      }

      case "true_false": {
        // Generate a statement about the concept, half the time true, half false
        const items = [...(data.pillars || []), ...(data.conditions || []), ...(data.invalidators || []), ...(data.rulings || [])];
        const isTrue = Math.random() > 0.5;

        if (items.length > 0) {
          const selected = items[Math.floor(Math.random() * items.length)];
          if (isTrue) {
            correctAnswer = "صحيح";
            questionPrompt = `هل العبارة التالية صحيحة؟ "${selected.title}: ${selected.description}"`;
            explanation = `صحيح. ${selected.description} وهذا من أحكام ${conceptName} في المذهب الشافعي.`;
          } else {
            // Pick a wrong description from another concept
            const wrongItems = sameCategoryConcepts.flatMap(c =>
              [...(c.data.pillars || []), ...(c.data.conditions || []), ...(c.data.invalidators || []), ...(c.data.rulings || [])]
            ).filter(w => w.title !== selected.title);
            const wrongDesc = wrongItems.length > 0
              ? wrongItems[Math.floor(Math.random() * wrongItems.length)].description
              : "هذا الحكم مخالف للمعتمد في المذهب";
            correctAnswer = "خطأ";
            questionPrompt = `هل العبارة التالية صحيحة؟ "${selected.title}: ${wrongDesc}"`;
            explanation = `خطأ. الصحيح أن: ${selected.description} وهذا ما اعتمده الشافعية في ${conceptName}.`;
          }
        } else {
          questionPrompt = `هل العبارة التالية صحيحة؟ "${conceptName} من أحكام الطهارة المعتمدة في مذهب الشافعية"`;
          correctAnswer = "صحيح";
          explanation = `صحيح. ${conceptName} من المفاهيم الأساسية في باب الطهارة عند الشافعية.`;
        }

        distractors = correctAnswer === "صحيح" ? ["خطأ"] : ["صحيح"];
        break;
      }

      case "fill_in": {
        // Fill in the blank: remove a key term from a description
        const fillItems = [...(data.pillars || []), ...(data.conditions || []), ...(data.invalidators || []), ...(data.rulings || [])];
        if (fillItems.length > 0) {
          const selected = fillItems[Math.floor(Math.random() * fillItems.length)];
          const desc = selected.description;
          const words = desc.split(" ");
          if (words.length > 3) {
            const blankIdx = Math.floor(words.length / 2);
            const blankWord = words[blankIdx];
            words[blankIdx] = "______";
            correctAnswer = blankWord;
            questionPrompt = `املأ الفراغ: "${words.join(" ")}" (المصطلح يتعلق بـ ${conceptName})`;
          } else {
            correctAnswer = selected.title;
            questionPrompt = `املأ الفراغ: "${desc}" (المصطلح الناقص يتعلق بـ ${conceptName})`;
          }
          // Distractors are possible alternative terms from the same concept or from same chapter
          const otherTerms = fillItems
            .filter(f => f.title !== correctAnswer && f.title !== selected.title)
            .map(f => f.title);
          const allTerms = [...new Set([...otherTerms, ...sameCategoryConcepts.flatMap(c =>
            [...(c.data.pillars || []), ...(c.data.conditions || []), ...(c.data.invalidators || []), ...(c.data.rulings || [])].map(i => i.title)
          )])].filter(t => t !== correctAnswer);

          distractors = shuffleArray(allTerms).slice(0, 3);
          if (distractors.length < 3) {
            distractors.push("النية", "الترتيب", "الموالاة");
          }
          distractors = distractors.slice(0, 3);

          explanation = template.explanationTemplate.replace("{item}", correctAnswer).replace("{concept}", conceptName);
        } else {
          questionPrompt = `املأ الفراغ: "${conceptName} من _____ الطهارة عند الشافعية"`;
          correctAnswer = "أحكام";
          distractors = ["شروط", "سنن", "مبطلات"];
          explanation = `${conceptName} من أحكام الطهارة المعتمدة في مذهب الشافعية.`;
        }
        break;
      }

      default:
        throw new Error(`Unknown template type: ${template.type}`);
    }
  } catch (error) {
    // Ultimate fallback question generator if any structure fails to parse
    console.error("Generator fallback triggered due to:", error);
    questionPrompt = `أي مما يلي يرتبط مباشرة بـ ${conceptName} في الفقه الشافعي؟`;
    correctAnswer = concept.notesForAdvancedStudents || "الالتزام بأقوال معتمد المذهب الشافعي";
    distractors = [
      "مخالفة معتمد المذهب بلا دليل",
      "الرجوع للأقوال الشاذة المتروكة",
      "عدم معرفة أحكام الطهارة"
    ];
    explanation = `الجواب الصحيح هو: (${correctAnswer}). ذلك لأن المتن المعتمد هو أساس الفتوى والعمل.`;
  }

  // Combine correct answer and distractors, shuffle, and return
  const options = shuffleArray([correctAnswer, ...distractors]);

  return {
    questionPrompt,
    options,
    correctAnswer,
    explanation,
    difficulty: template.difficulty,
    type: template.type
  };
}
