import { signChallengeToken, verifyChallengeToken } from "../lib/crypto";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

// Test the pure challenge scoring logic
function calculateChallengeResult(answers: { isCorrect: boolean }[]) {
  const correctAnswers = answers.filter((a) => a.isCorrect).length;
  const raw = answers.length > 0 ? (correctAnswers / answers.length) * 100 : 0;
  const scorePercentage = Number.isFinite(raw) ? raw : 0;
  const isPassed = scorePercentage >= 80;
  const xpReward = isPassed ? 15 : 5;
  const gemsReward = isPassed ? 5 : 0;

  return { correctAnswers, total: answers.length, scorePercentage, isPassed, xpReward, gemsReward };
}

function runChallengeTests() {
  console.log("🧪 Running Challenge Logic Tests...");
  let passed = 0;
  let failed = 0;

  // Test 1: Perfect score (5/5 correct)
  try {
    const result = calculateChallengeResult([
      { isCorrect: true }, { isCorrect: true }, { isCorrect: true },
      { isCorrect: true }, { isCorrect: true },
    ]);
    assert(result.scorePercentage === 100, "Perfect score should be 100%");
    assert(result.isPassed === true, "Perfect score should pass");
    assert(result.xpReward === 15, "Pass should reward 15 XP");
    assert(result.gemsReward === 5, "Pass should reward 5 gems");
    assert(result.correctAnswers === 5, "Should have 5 correct answers");
    console.log("✅ Test 1: Perfect score calculates correctly");
    passed++;
  } catch (error) {
    console.error("❌ Test 1 Failed:", error);
    failed++;
  }

  // Test 2: Passing score (4/5 = 80%)
  try {
    const result = calculateChallengeResult([
      { isCorrect: true }, { isCorrect: true }, { isCorrect: true },
      { isCorrect: true }, { isCorrect: false },
    ]);
    assert(result.scorePercentage === 80, "4/5 should be 80%");
    assert(result.isPassed === true, "80% should pass");
    assert(result.xpReward === 15, "Pass should reward 15 XP");
    console.log("✅ Test 2: 80% passing score calculates correctly");
    passed++;
  } catch (error) {
    console.error("❌ Test 2 Failed:", error);
    failed++;
  }

  // Test 3: Failing score (3/5 = 60%)
  try {
    const result = calculateChallengeResult([
      { isCorrect: true }, { isCorrect: true }, { isCorrect: true },
      { isCorrect: false }, { isCorrect: false },
    ]);
    assert(result.scorePercentage === 60, "3/5 should be 60%");
    assert(result.isPassed === false, "60% should not pass");
    assert(result.xpReward === 5, "Fail should reward only 5 XP");
    assert(result.gemsReward === 0, "Fail should reward 0 gems");
    console.log("✅ Test 3: 60% failing score calculates correctly");
    passed++;
  } catch (error) {
    console.error("❌ Test 3 Failed:", error);
    failed++;
  }

  // Test 4: Zero score (0/5)
  try {
    const result = calculateChallengeResult([
      { isCorrect: false }, { isCorrect: false }, { isCorrect: false },
      { isCorrect: false }, { isCorrect: false },
    ]);
    assert(result.scorePercentage === 0, "0/5 should be 0%");
    assert(result.isPassed === false, "0% should not pass");
    assert(result.xpReward === 5, "Fail should reward 5 XP minimum");
    assert(result.gemsReward === 0, "Fail should reward 0 gems");
    console.log("✅ Test 4: Zero score calculates correctly");
    passed++;
  } catch (error) {
    console.error("❌ Test 4 Failed:", error);
    failed++;
  }

  // Test 5: Edge case — single answer (challenge with 1 question)
  try {
    const result = calculateChallengeResult([{ isCorrect: true }]);
    assert(result.scorePercentage === 100, "1/1 should be 100%");
    assert(result.isPassed === true, "Single correct should pass");
    assert(result.total === 1, "Total should be 1");
    console.log("✅ Test 5: Single answer edge case");
    passed++;
  } catch (error) {
    console.error("❌ Test 5 Failed:", error);
    failed++;
  }

  // Test 6: Edge case — empty answers
  try {
    const result = calculateChallengeResult([]);
    assert(result.scorePercentage === 0, "Empty should be 0%");
    assert(result.isPassed === false, "Empty should not pass");
    assert(result.total === 0, "Total should be 0");
    console.log("✅ Test 6: Empty answers edge case");
    passed++;
  } catch (error) {
    console.error("❌ Test 6 Failed:", error);
    failed++;
  }

  // Test 7: Secure Challenge Token signing & verification
  try {
    const data = {
      conceptId: "concept_1",
      questionPrompt: "أي مما يلي يعتبر فرضاً؟",
      correctAnswer: "غسل الوجه",
      explanation: "غسل الوجه فرض",
      expiresAt: Date.now() + 10000 // 10 seconds
    };

    const token = signChallengeToken(data);
    assert(token.includes("."), "Signed token should contain a dot separator");

    const verified = verifyChallengeToken(token);
    assert(verified !== null, "Valid token should verify successfully");
    assert(verified?.correctAnswer === data.correctAnswer, "Verified data should match original data");
    console.log("✅ Test 7: Secure Challenge Token signs and verifies correctly");
    passed++;
  } catch (error) {
    console.error("❌ Test 7 Failed:", error);
    failed++;
  }

  // Test 8: Secure Challenge Token verification fails with tampered data
  try {
    const data = {
      conceptId: "concept_1",
      questionPrompt: "أي مما يلي يعتبر فرضاً؟",
      correctAnswer: "غسل الوجه",
      explanation: "غسل الوجه فرض",
      expiresAt: Date.now() + 10000
    };

    const token = signChallengeToken(data);
    const parts = token.split(".");
    // Tamper with payload part by changing one character
    const tamperedPayload = parts[0] + "a";
    const tamperedToken = `${tamperedPayload}.${parts[1]}`;

    const verified = verifyChallengeToken(tamperedToken);
    assert(verified === null, "Tampered token verification should fail");
    console.log("✅ Test 8: Secure Challenge Token fails on tampering");
    passed++;
  } catch (error) {
    console.error("❌ Test 8 Failed:", error);
    failed++;
  }

  // Test 9: Secure Challenge Token verification fails when expired
  try {
    const data = {
      conceptId: "concept_1",
      questionPrompt: "أي مما يلي يعتبر فرضاً؟",
      correctAnswer: "غسل الوجه",
      explanation: "غسل الوجه فرض",
      expiresAt: Date.now() - 5000 // Expired 5 seconds ago
    };

    const token = signChallengeToken(data);
    const verified = verifyChallengeToken(token);
    assert(verified === null, "Expired token verification should fail");
    console.log("✅ Test 9: Secure Challenge Token fails when expired");
    passed++;
  } catch (error) {
    console.error("❌ Test 9 Failed:", error);
    failed++;
  }

  console.log(`\n📊 Challenge Test Summary: ${passed} passed, ${failed} failed`);
  if (failed > 0) throw new Error(`${failed} challenge test(s) failed`);
  console.log("🎉 All challenge tests passed successfully!");
}

runChallengeTests();
