import { getReviewCenterData } from "@/actions/spaced-review";
import { ReviewClient } from "./ReviewClient";

export default async function ReviewPage() {
  const initialData = await getReviewCenterData();

  return <ReviewClient initialData={initialData} />;
}
