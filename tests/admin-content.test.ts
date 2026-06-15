export {};
function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

type ContentStatus = "draft" | "reviewed" | "approved" | "published" | "archived";

// Pure function: determine if content can be edited
function canEditContent(status: ContentStatus, role: "admin" | "reviewer" | "student"): boolean {
  if (status === "archived") return false;
  if (role === "student") return false;
  if (role === "reviewer") return status === "draft" || status === "reviewed";
  if (role === "admin") return true;
  return false;
}

// Pure function: determine the archive behavior based on status
function getArchiveBehavior(status: ContentStatus): { canArchive: boolean; isSoftDelete: boolean } {
  if (status === "draft") {
    return { canArchive: true, isSoftDelete: true };
  }
  if (status === "published") {
    return { canArchive: true, isSoftDelete: true };
  }
  return { canArchive: false, isSoftDelete: false };
}

// Pure function: calculate next valid statuses for the admin dropdown
function getNextValidStatuses(current: ContentStatus, role: "admin" | "reviewer"): ContentStatus[] {
  if (role === "reviewer") {
    if (current === "draft") return ["reviewed"];
    if (current === "reviewed") return ["draft"];
    return [];
  }

  if (role === "admin") {
    switch (current) {
      case "draft": return ["reviewed", "archived"];
      case "reviewed": return ["approved", "draft"];
      case "approved": return ["published", "draft"];
      case "published": return ["archived"];
      case "archived": return [];
      default: return [];
    }
  }

  return [];
}

function runAdminContentTests() {
  console.log("🧪 Running Admin Content Lifecycle Tests...");
  let passed = 0;
  let failed = 0;

  // Test 1: Admin can edit any non-archived content
  try {
    assert(canEditContent("draft", "admin") === true, "Admin can edit draft");
    assert(canEditContent("reviewed", "admin") === true, "Admin can edit reviewed");
    assert(canEditContent("approved", "admin") === true, "Admin can edit approved");
    assert(canEditContent("published", "admin") === true, "Admin can edit published");
    assert(canEditContent("archived", "admin") === false, "Admin cannot edit archived");
    console.log("✅ Test 1: Admin can edit all non-archived content");
    passed++;
  } catch (error) {
    console.error("❌ Test 1 Failed:", error);
    failed++;
  }

  // Test 2: Reviewer can only edit draft/reviewed
  try {
    assert(canEditContent("draft", "reviewer") === true, "Reviewer can edit draft");
    assert(canEditContent("reviewed", "reviewer") === true, "Reviewer can edit reviewed");
    assert(canEditContent("approved", "reviewer") === false, "Reviewer cannot edit approved");
    assert(canEditContent("published", "reviewer") === false, "Reviewer cannot edit published");
    console.log("✅ Test 2: Reviewer can only edit draft/reviewed");
    passed++;
  } catch (error) {
    console.error("❌ Test 2 Failed:", error);
    failed++;
  }

  // Test 3: Student cannot edit anything
  try {
    assert(canEditContent("draft", "student") === false, "Student cannot edit draft");
    assert(canEditContent("published", "student") === false, "Student cannot edit published");
    console.log("✅ Test 3: Student cannot edit content");
    passed++;
  } catch (error) {
    console.error("❌ Test 3 Failed:", error);
    failed++;
  }

  // Test 4: Archive behavior for draft
  try {
    const result = getArchiveBehavior("draft");
    assert(result.canArchive === true, "Draft can be archived");
    assert(result.isSoftDelete === true, "Draft archive is soft delete");
    console.log("✅ Test 4: Draft archive behavior");
    passed++;
  } catch (error) {
    console.error("❌ Test 4 Failed:", error);
    failed++;
  }

  // Test 5: Archive behavior for published
  try {
    const result = getArchiveBehavior("published");
    assert(result.canArchive === true, "Published can be archived");
    assert(result.isSoftDelete === true, "Published archive is soft delete");
    console.log("✅ Test 5: Published archive behavior (no hard delete)");
    passed++;
  } catch (error) {
    console.error("❌ Test 5 Failed:", error);
    failed++;
  }

  // Test 6: Admin's next status options from draft
  try {
    const options = getNextValidStatuses("draft", "admin");
    assert(options.includes("reviewed"), "Admin can send draft to review");
    assert(options.includes("archived"), "Admin can archive draft");
    assert(options.length === 2, "Draft has exactly 2 next statuses");
    console.log("✅ Test 6: Admin next statuses from draft");
    passed++;
  } catch (error) {
    console.error("❌ Test 6 Failed:", error);
    failed++;
  }

  // Test 7: Reviewer's next status options from draft
  try {
    const options = getNextValidStatuses("draft", "reviewer");
    assert(options.includes("reviewed"), "Reviewer can send draft to review");
    assert(options.length === 1, "Reviewer can only send to review");
    console.log("✅ Test 7: Reviewer next statuses from draft");
    passed++;
  } catch (error) {
    console.error("❌ Test 7 Failed:", error);
    failed++;
  }

  // Test 8: Admin cannot skip from draft to published
  try {
    const options = getNextValidStatuses("draft", "admin");
    assert(options.includes("published") === false, "Admin cannot skip to published");
    console.log("✅ Test 8: No direct draft → published bypass");
    passed++;
  } catch (error) {
    console.error("❌ Test 8 Failed:", error);
    failed++;
  }

  // Test 9: Archived status has no next states
  try {
    const options = getNextValidStatuses("archived", "admin");
    assert(options.length === 0, "Archived has no next states");
    console.log("✅ Test 9: Archived is a terminal state");
    passed++;
  } catch (error) {
    console.error("❌ Test 9 Failed:", error);
    failed++;
  }

  console.log(`\n📊 Admin Content Test Summary: ${passed} passed, ${failed} failed`);
  if (failed > 0) throw new Error(`${failed} admin content test(s) failed`);
  console.log("🎉 All admin content tests passed successfully!");
}

runAdminContentTests();
