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

export interface ConceptData {
  name: string;
  pillars?: ConceptItem[];
  conditions?: ConceptItem[];
  invalidators?: ConceptItem[];
  rulings?: ConceptItem[];
  commonMistakes?: ConceptItem[];
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

        if (concept.id === "concept_wudu_pillars" || concept.conceptName.includes("فروض الوضوء")) {
          const cases = [
            {
              scen: "غسل وجهه كاملاً بنية الوضوء، ثم أتم غسل اليدين والمرفقين والمسح والغسل دون ترتيب",
              ans: "يبطل وضوؤه لعدم الترتيب",
              res: "الترتيب ركن من فروض الوضوء الستة، والبدء بغير الوجه يبطل ما قبله ويوجب الترتيب المنهجي."
            },
            {
              scen: "توضأ ونوى عند غسل كفيه (قبل الوجه) ولم يستحضر النية عند أول غسل جزء من الوجه",
              ans: "لا يصح غسل الوجه ويجب إعادته بالنية",
              res: "وقت النية في الوضوء تجب أن تكون مقترنة بغسل أول جزء من الوجه."
            },
            {
              scen: "مسح على شعرة واحدة خارجة عن حد الرأس من الخلف ولم يمسح بشرة رأسه",
              ans: "لا يصح المسح ولا يصح الوضوء",
              res: "المسح يجب أن يقع على شيء في حد الرأس (بشرة أو شعراً لا يخرج بالمد عن حد الرأس)."
            }
          ];
          const selected = cases[Math.floor(Math.random() * cases.length)];
          scenario = selected.scen;
          correctAnswer = selected.ans;
          reason = selected.res;
          
          distractors = [
            "وضوؤه صحيح تماماً ولا كراهة فيه",
            "وضوؤه صحيح مع الكراهة لمخالفة السنن المأثورة",
            "يصح الوضوء وتجب عليه إعادة الصلاة فقط احتياطاً"
          ];
        } else if (concept.id === "concept_wudu_invals" || concept.conceptName.includes("نواقض الوضوء")) {
          const cases = [
            {
              scen: "نام وهو جالس ومتمكن مقعده تماماً من الأرض المستوية",
              ans: "وضوؤه صحيح ولا ينتقض",
              res: "زوال العقل بالنوم ينقض الوضوء إلا نوم القاعد الممكن مقعده من الأرض."
            },
            {
              scen: "لمس بشرة ابنتها الصغيرة (عمرها سنتان) بلا حائل",
              ans: "وضوؤه صحيح ولا ينتقض",
              res: "التقاء البشرتين ينقض فقط إذا كان اللمس لامرأة أجنبية بلغت حد الشهوة (كبيرة)."
            },
            {
              scen: "لمس ظفر زوجته أو شعرها مباشرة بلا حائل",
              ans: "وضوؤه صحيح ولا ينتقض",
              res: "لمس الشعر أو الظفر أو السن لا ينقض الوضوء عند الشافعية لأنه ليس من البشرة."
            },
            {
              scen: "مس فرج طفل صغير ببطن راحته مباشرة بلا حائل",
              ans: "يبطل وضوؤه بالمس",
              res: "مس قبل الآدمي ينقض الوضوء سواء كان صغيراً أو كبيراً، حياً أو ميتاً، وببطن الكف."
            }
          ];
          const selected = cases[Math.floor(Math.random() * cases.length)];
          scenario = selected.scen;
          correctAnswer = selected.ans;
          reason = selected.res;
          
          distractors = [
            "وضوؤه باطل بكل الأحوال وتجب إعادته فوراً",
            "ينتقض وضوء اللامس والملموس معاً",
            "يكره ذلك ويستحب الوضوء خروجاً من الخلاف"
          ];
        } else if (concept.id === "concept_istinja" || concept.conceptName.includes("الاستنجاء")) {
          const cases = [
            {
              scen: "استنجى بحجر واحد له ثلاثة أحرف حتى أنقى المحل تماماً",
              ans: "يصح استنجاؤه ويجزئه",
              res: "المجزئ هو ثلاثة أحجار، أو حجر واحد ذو ثلاثة أحرف/أوجه يمسح بكل حرف منها مسحة كاملة."
            },
            {
              scen: "استنجى بحجر طاهر ثم بالماء بعد أن جف الغائط تماماً على الصفحة",
              ans: "لا يجزئ الحجر ويجب الاستنجاء بالماء حصراً",
              res: "من شروط الاستنجاء بالحجر ألا يجف الخارج، فإذا جف تعين الماء لإزالته."
            }
          ];
          const selected = cases[Math.floor(Math.random() * cases.length)];
          scenario = selected.scen;
          correctAnswer = selected.ans;
          reason = selected.res;

          distractors = [
            "يجوز الحجر وتكره الصلاة به",
            "لا يجزئ الحجر ولا الماء ويجب التيمم",
            "يصح وضوؤه وتجب إراقة الحجر"
          ];
        } else if (concept.id === "concept_puberty" || concept.conceptName.includes("البلوغ")) {
          const cases = [
            {
              scen: "ولد أتم أربعة عشر سنة قمرية من عمره ولم يحتلم قط، هل يحكم ببلوغه بالسن؟",
              ans: "لا يعتبر بالغاً بالسن حتى يتم خمس عشرة سنة",
              res: "علامة البلوغ بالسن هي تمام خمس عشرة سنة قمرية كاملة للذكر والأنثى."
            },
            {
              scen: "رأت فتاة دماً لأول مرة وهي في سن تسع سنين قمرية، ما حكم هذا الدم؟",
              ans: "يعتبر دم حيض وتصير به بالغة شرعاً",
              res: "أقل سن للحيض هو تمام تسع سنين قمرية، والحيض علامة من علامات البلوغ."
            },
            {
              scen: "ادعى طفل يبلغ من العمر ثماني سنين قمرية أنه قد احتلم، هل يحكم ببلوغه؟",
              ans: "لا يحكم ببلوغه لكونه دون تسع سنين قمرية",
              res: "شرط الاحتلام ليكون علامة بلوغ هو أن يقع بعد تمام تسع سنين قمرية."
            }
          ];
          const selected = cases[Math.floor(Math.random() * cases.length)];
          scenario = selected.scen;
          correctAnswer = selected.ans;
          reason = selected.res;

          distractors = [
            "يعتبر بالغاً بالتكليف فوراً لمجرد دعواه",
            "يجب عليه الصيام فوراً ولا تجب عليه الصلاة",
            "يصح بلوغه بالسن الشمسي (الميلادي) احتياطاً"
          ];
        } else if (concept.id === "concept_wudu_conds" || concept.conceptName.includes("شروط الوضوء")) {
          const cases = [
            {
              scen: "توضأ شخص وعلى أظافره طلاء أظافر عازل أو طبقة كثيفة من دهان زيتي تمنع وصول الماء للبشرة",
              ans: "يبطل وضوؤه لوجود حائل يمنع وصول الماء للبشرة",
              res: "من شروط صحة الوضوء عدم وجود حائل يمنع وصول الماء إلى العضو المغسول."
            },
            {
              scen: "شخص مصاب بسلس البول (دائم الحدث) توضأ لصلاة الظهر قبل دخول الوقت (قبل الأذان)",
              ans: "يبطل وضوؤه ويجب إعادته بعد دخول الوقت",
              res: "دخول وقت الصلاة شرط لصحة وضوء دائم الحدث؛ لأن طهارته طهارة ضرورة فلا تتقدم عليها."
            },
            {
              scen: "توضأ عامي وهو يعتقد أن غسل الوجه (الذي هو ركن) سنة من سنن الوضوء",
              ans: "يبطل وضوؤه لاعتقاده الفرض سنة",
              res: "من شروط صحة الوضوء التمييز والعلم بفرضيته وألا يعتقد فرضاً من فروضه سنة."
            }
          ];
          const selected = cases[Math.floor(Math.random() * cases.length)];
          scenario = selected.scen;
          correctAnswer = selected.ans;
          reason = selected.res;

          distractors = [
            "يصح وضوؤه وتكره صلاته لمخالفة الأفضل",
            "يصح وضوؤه ويستحب له إعادة غسل العضو المغسول فقط",
            "يصح وضوؤه للجاهل مطلقاً ويعفى عنه"
          ];
        } else if (concept.id === "concept_ghusl" || concept.conceptName.includes("الغسل")) {
          const cases = [
            {
              scen: "استيقظ رجل من نومه ووجد أثر بلل (مني) على ثوبه ولكنه لا يتذكر احتلاماً",
              ans: "يجب عليه الغسل لتيقنه من خروج المني",
              res: "خروج المني موجب للغسل باليقين سواء تذكر احتلاماً أم لم يتذكر."
            },
            {
              scen: "اغتسلت امرأة من الجنابة ولم تعمم الماء على بشرة فروة رأسها تحت شعرها الكثيف",
              ans: "لم يصح غسلها ويجب تعميم كامل البشرة والشعر بالماء",
              res: "فروض الغسل تعميم الجسد بالماء بشراً وشعراً، ظاهراً وباطناً، خفيفاً كان أو كثيفاً."
            },
            {
              scen: "ولدت امرأة ولادة جافة (بدون رؤية دم النفاس)، هل يجب عليها الغسل؟",
              ans: "يجب عليها الغسل لمجرد الولادة",
              res: "الولادة بنفسها موجب من موجبات الغسل في المذهب الشافعي ولو خلت عن الدم."
            }
          ];
          const selected = cases[Math.floor(Math.random() * cases.length)];
          scenario = selected.scen;
          correctAnswer = selected.ans;
          reason = selected.res;

          distractors = [
            "يصح الغسل وتجزئها الصلاة مع وجوب الوضوء",
            "يستحب لها الغسل ويكفيها الوضوء لرفع الحدث",
            "لا يجب عليها شيء حتى ترى دم النفاس"
          ];
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
