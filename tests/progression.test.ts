export {};
function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

interface ProgressionResult {
  isLocked: boolean;
  reason?: string;
}

// Pure progression logic: evaluate if a lesson can be unlocked
function evaluateLessonUnlock(
  lessonOrder: number,
  siblingLessons: Array<{ id: string; order: number }>,
  completedLessonIds: Set<string>
): ProgressionResult {
  const lesson = siblingLessons.find((l) => l.order === lessonOrder);
  if (!lesson) return { isLocked: true, reason: "الدرس غير موجود" };

  const currentIdx = siblingLessons.findIndex((l) => l.id === lesson.id);
  if (currentIdx > 0) {
    const prevLesson = siblingLessons[currentIdx - 1];
    if (!completedLessonIds.has(prevLesson.id)) {
      return { isLocked: true, reason: "أكمل الدرس السابق أولاً" };
    }
  }

  return { isLocked: false };
}

function evaluateSkillUnlock(
  skillOrder: number,
  siblingSkills: Array<{ id: string; order: number }>,
  lessonMap: Record<string, Array<{ id: string }>>,
  completedLessonIds: Set<string>
): ProgressionResult {
  const skill = siblingSkills.find((s) => s.order === skillOrder);
  if (!skill) return { isLocked: true, reason: "المهارة غير موجودة" };

  const currentIdx = siblingSkills.findIndex((s) => s.id === skill.id);
  if (currentIdx > 0) {
    const prevSkill = siblingSkills[currentIdx - 1];
    const prevLessons = lessonMap[prevSkill.id] || [];
    if (prevLessons.length > 0) {
      const allCompleted = prevLessons.every((l) => completedLessonIds.has(l.id));
      if (!allCompleted) {
        return { isLocked: true, reason: "أكمل جميع دروس المهارة السابقة أولاً" };
      }
    }
  }

  return { isLocked: false };
}

function evaluateUnitUnlock(
  unitOrder: number,
  siblingUnits: Array<{ id: string; order: number }>,
  lessonMapByUnit: Record<string, Array<{ id: string }>>,
  completedLessonIds: Set<string>
): ProgressionResult {
  const unit = siblingUnits.find((u) => u.order === unitOrder);
  if (!unit) return { isLocked: true, reason: "الوحدة غير موجودة" };

  const currentIdx = siblingUnits.findIndex((u) => u.id === unit.id);
  if (currentIdx > 0) {
    const prevUnit = siblingUnits[currentIdx - 1];
    const prevLessons = lessonMapByUnit[prevUnit.id] || [];
    if (prevLessons.length > 0) {
      const allCompleted = prevLessons.every((l) => completedLessonIds.has(l.id));
      if (!allCompleted) {
        return { isLocked: true, reason: "أكمل جميع دروس الوحدة السابقة أولاً" };
      }
    }
  }

  return { isLocked: false };
}

function runProgressionTests() {
  console.log("🧪 Running Progression Logic Tests...");
  let passed = 0;
  let failed = 0;

  // Test data
  const taharahLessons = [
    { id: "lesson_puberty", order: 1 },
    { id: "lesson_istinja", order: 2 },
    { id: "lesson_wudu_pillars", order: 3 },
    { id: "lesson_wudu_conds", order: 4 },
    { id: "lesson_wudu_invals", order: 5 },
    { id: "lesson_ghusl", order: 6 },
  ];

  // Test 1: First lesson is always unlocked
  try {
    const allCompleted = new Set<string>(["lesson_puberty"]);
    const result = evaluateLessonUnlock(1, taharahLessons, allCompleted);
    assert(result.isLocked === false, "First lesson should be unlocked");
    console.log("✅ Test 1: First lesson is always unlocked");
    passed++;
  } catch (error) {
    console.error("❌ Test 1 Failed:", error);
    failed++;
  }

  // Test 2: Second lesson is locked when first not completed
  try {
    const noCompleted = new Set<string>();
    const result = evaluateLessonUnlock(2, taharahLessons, noCompleted);
    assert(result.isLocked === true, "Second lesson should be locked");
    assert(result.reason === "أكمل الدرس السابق أولاً", "Should have correct reason");
    console.log("✅ Test 2: Second lesson locked when first not completed");
    passed++;
  } catch (error) {
    console.error("❌ Test 2 Failed:", error);
    failed++;
  }

  // Test 3: Second lesson unlocked when first completed
  try {
    const completed = new Set<string>(["lesson_puberty"]);
    const result = evaluateLessonUnlock(2, taharahLessons, completed);
    assert(result.isLocked === false, "Second lesson should be unlocked");
    console.log("✅ Test 3: Second lesson unlocked when first completed");
    passed++;
  } catch (error) {
    console.error("❌ Test 3 Failed:", error);
    failed++;
  }

  // Test 4: Last lesson locked until all previous completed
  try {
    const partial = new Set<string>(["lesson_puberty", "lesson_istinja", "lesson_wudu_pillars", "lesson_wudu_conds", "lesson_wudu_invals"]);
    const result = evaluateLessonUnlock(6, taharahLessons, partial);
    assert(result.isLocked === false, "Last lesson should be unlocked when all previous completed");
    console.log("✅ Test 4: Last lesson unlocked when all 5 previous completed");
    passed++;
  } catch (error) {
    console.error("❌ Test 4 Failed:", error);
    failed++;
  }

  // Test 5: Skill unlock — all lessons in previous skill must be completed
  try {
    const taharahSkills = [
      { id: "skill_puberty", order: 1 },
      { id: "skill_istinja", order: 2 },
    ];
    const lessonMap = {
      skill_puberty: [{ id: "lesson_puberty" }],
      skill_istinja: [{ id: "lesson_istinja" }],
    };
    const notCompleted = new Set<string>();
    const result = evaluateSkillUnlock(2, taharahSkills, lessonMap, notCompleted);
    assert(result.isLocked === true, "Skill should be locked when previous skill's lessons not completed");
    console.log("✅ Test 5: Skill locked when previous skill lessons incomplete");
    passed++;
  } catch (error) {
    console.error("❌ Test 5 Failed:", error);
    failed++;
  }

  // Test 6: Skill unlock — previous skill has no lessons (always open)
  try {
    const skills = [
      { id: "skill_empty_prev", order: 1 },
      { id: "skill_has_lessons", order: 2 },
    ];
    const lessonMap = {
      skill_empty_prev: [],
      skill_has_lessons: [{ id: "lesson_test" }],
    };
    const noCompleted = new Set<string>();
    const result = evaluateSkillUnlock(2, skills, lessonMap, noCompleted);
    assert(result.isLocked === false, "Skill should unlock when previous skill has no lessons");
    console.log("✅ Test 6: Skill unlocks when previous skill has no lessons");
    passed++;
  } catch (error) {
    console.error("❌ Test 6 Failed:", error);
    failed++;
  }

  // Test 7: Unit unlock — all lessons in previous unit must be completed
  try {
    const units = [
      { id: "safina_taharah", order: 1 },
      { id: "safina_salat", order: 2 },
    ];
    const lessonMap = {
      safina_taharah: [{ id: "lesson_puberty" }, { id: "lesson_istinja" }],
      safina_salat: [{ id: "lesson_salat_conds" }],
    };
    const partialCompleted = new Set<string>(["lesson_puberty"]);
    const result = evaluateUnitUnlock(2, units, lessonMap, partialCompleted);
    assert(result.isLocked === true, "Unit should be locked when not all previous lessons completed");
    console.log("✅ Test 7: Unit locked when previous unit lessons incomplete");
    passed++;
  } catch (error) {
    console.error("❌ Test 7 Failed:", error);
    failed++;
  }

  // Test 8: Unit unlock — all previous lessons completed
  try {
    const units = [
      { id: "safina_taharah", order: 1 },
      { id: "safina_salat", order: 2 },
    ];
    const lessonMap = {
      safina_taharah: [{ id: "lesson_puberty" }, { id: "lesson_istinja" }],
      safina_salat: [{ id: "lesson_salat_conds" }],
    };
    const allCompleted = new Set<string>(["lesson_puberty", "lesson_istinja"]);
    const result = evaluateUnitUnlock(2, units, lessonMap, allCompleted);
    assert(result.isLocked === false, "Unit should unlock when all previous lessons completed");
    console.log("✅ Test 8: Unit unlocks when all previous lessons completed");
    passed++;
  } catch (error) {
    console.error("❌ Test 8 Failed:", error);
    failed++;
  }

  // Test 9: Non-existent entity returns locked
  try {
    const result = evaluateLessonUnlock(99, taharahLessons, new Set<string>());
    assert(result.isLocked === true, "Non-existent lesson should be locked");
    assert(result.reason === "الدرس غير موجود", "Should have correct reason");
    console.log("✅ Test 9: Non-existent entity returns locked");
    passed++;
  } catch (error) {
    console.error("❌ Test 9 Failed:", error);
    failed++;
  }

  console.log(`\n📊 Progression Test Summary: ${passed} passed, ${failed} failed`);
  if (failed > 0) throw new Error(`${failed} progression test(s) failed`);
  console.log("🎉 All progression tests passed successfully!");
}

runProgressionTests();
