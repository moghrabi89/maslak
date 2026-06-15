export {};
function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

type ReviewDecision = "approved" | "needs_changes" | "rejected";
type ContentStatus = "draft" | "reviewed" | "approved" | "published" | "archived";

interface StatusTransition {
  from: ContentStatus;
  to: ContentStatus;
  allowed: boolean;
  reason?: string;
}

// Pure function: determine the next status based on review decision
function applyReviewDecision(
  currentStatus: ContentStatus,
  decision: ReviewDecision
): { newStatus: ContentStatus; scientificConfidence?: number } {
  if (currentStatus !== "reviewed" && currentStatus !== "draft") {
    throw new Error(`Cannot review content in status: ${currentStatus}`);
  }

  switch (decision) {
    case "approved":
      return { newStatus: "published", scientificConfidence: 100 };
    case "needs_changes":
      return { newStatus: "draft" };
    case "rejected":
      return { newStatus: "draft" };
    default:
      throw new Error(`Unknown decision: ${decision}`);
  }
}

// Pure function: validate a status transition
function isValidTransition(from: ContentStatus, to: ContentStatus): StatusTransition {
  const validTransitions: Record<ContentStatus, ContentStatus[]> = {
    draft: ["reviewed", "archived"],
    reviewed: ["approved", "draft"],
    approved: ["published", "draft"],
    published: ["archived"],
    archived: [],
  };

  const allowed = validTransitions[from]?.includes(to) ?? false;
  return {
    from,
    to,
    allowed,
    reason: allowed ? undefined : `لا يمكن الانتقال من ${from} إلى ${to}`,
  };
}

// Pure function: validate review decision based on user role
function canUserReview(role: "admin" | "reviewer" | "student"): boolean {
  return role === "admin" || role === "reviewer";
}

function runReviewFlowTests() {
  console.log("🧪 Running Review Flow Logic Tests...");
  let passed = 0;
  let failed = 0;

  // Test 1: Approve reviewed content → published
  try {
    const result = applyReviewDecision("reviewed", "approved");
    assert(result.newStatus === "published", "Approved review should publish content");
    assert(result.scientificConfidence === 100, "Approved review should set confidence to 100");
    console.log("✅ Test 1: Approve reviewed → published with 100% confidence");
    passed++;
  } catch (error) {
    console.error("❌ Test 1 Failed:", error);
    failed++;
  }

  // Test 2: Request changes on reviewed content → back to draft
  try {
    const result = applyReviewDecision("reviewed", "needs_changes");
    assert(result.newStatus === "draft", "Needs changes should revert to draft");
    console.log("✅ Test 2: Needs changes → draft");
    passed++;
  } catch (error) {
    console.error("❌ Test 2 Failed:", error);
    failed++;
  }

  // Test 3: Reject reviewed content → back to draft
  try {
    const result = applyReviewDecision("reviewed", "rejected");
    assert(result.newStatus === "draft", "Rejected should revert to draft");
    console.log("✅ Test 3: Rejected → draft");
    passed++;
  } catch (error) {
    console.error("❌ Test 3 Failed:", error);
    failed++;
  }

  // Test 4: Valid transition: draft → reviewed
  try {
    const result = isValidTransition("draft", "reviewed");
    assert(result.allowed === true, "Draft → reviewed should be allowed");
    console.log("✅ Test 4: Draft → reviewed is valid");
    passed++;
  } catch (error) {
    console.error("❌ Test 4 Failed:", error);
    failed++;
  }

  // Test 5: Valid transition: published → archived
  try {
    const result = isValidTransition("published", "archived");
    assert(result.allowed === true, "Published → archived should be allowed");
    console.log("✅ Test 5: Published → archived is valid (soft delete)");
    passed++;
  } catch (error) {
    console.error("❌ Test 5 Failed:", error);
    failed++;
  }

  // Test 6: Invalid transition: draft → published (no review bypass)
  try {
    const result = isValidTransition("draft", "published");
    assert(result.allowed === false, "Draft → published should not be allowed");
    assert(result.reason !== undefined, "Should provide a reason");
    console.log("✅ Test 6: Draft → published is invalid (no bypass)");
    passed++;
  } catch (error) {
    console.error("❌ Test 6 Failed:", error);
    failed++;
  }

  // Test 7: Invalid transition: archived → anything
  try {
    const result = isValidTransition("archived", "draft");
    assert(result.allowed === false, "Archived → draft should not be allowed");
    console.log("✅ Test 7: Archived → anything is invalid");
    passed++;
  } catch (error) {
    console.error("❌ Test 7 Failed:", error);
    failed++;
  }

  // Test 8: Invalid transition: reviewed → published directly (must go through approved)
  try {
    const result = isValidTransition("reviewed", "published");
    assert(result.allowed === false, "Reviewed → published should not be allowed directly");
    console.log("✅ Test 8: Reviewed → published requires approved step");
    passed++;
  } catch (error) {
    console.error("❌ Test 8 Failed:", error);
    failed++;
  }

  // Test 9: Error when applying review to non-reviewable status
  try {
    applyReviewDecision("published", "approved");
    console.error("❌ Test 9 Failed: Should throw error for published content");
    failed++;
  } catch {
    console.log("✅ Test 9: Cannot review published content");
    passed++;
  }

  // Test 10: Admin can review
  try {
    assert(canUserReview("admin") === true, "Admin should be able to review");
    console.log("✅ Test 10: Admin can review");
    passed++;
  } catch (error) {
    console.error("❌ Test 10 Failed:", error);
    failed++;
  }

  // Test 11: Reviewer can review
  try {
    assert(canUserReview("reviewer") === true, "Reviewer should be able to review");
    console.log("✅ Test 11: Reviewer can review");
    passed++;
  } catch (error) {
    console.error("❌ Test 11 Failed:", error);
    failed++;
  }

  // Test 12: Student cannot review
  try {
    assert(canUserReview("student") === false, "Student should not be able to review");
    console.log("✅ Test 12: Student cannot review");
    passed++;
  } catch (error) {
    console.error("❌ Test 12 Failed:", error);
    failed++;
  }

  console.log(`\n📊 Review Flow Test Summary: ${passed} passed, ${failed} failed`);
  if (failed > 0) throw new Error(`${failed} review flow test(s) failed`);
  console.log("🎉 All review flow tests passed successfully!");
}

runReviewFlowTests();
