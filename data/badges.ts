export const BADGE_CATALOG = [
  {
    id: "first_step",
    name: "أول خطوة",
    description: "أكمل أول درس منشور في مسارك العلمي.",
    iconUrl: "book-open",
    xpRequirement: 0,
  },
  {
    id: "faqih_wudu",
    name: "فقيه الوضوء",
    description: "أكمل دروس فروض الوضوء وشروطه ونواقضه.",
    iconUrl: "droplets",
    xpRequirement: 0,
  },
  {
    id: "purity_master",
    name: "متقن باب الطهارة",
    description: "أكمل جميع دروس باب الطهارة المنشورة في سفينة النجاة.",
    iconUrl: "sparkles",
    xpRequirement: 0,
  },
  {
    id: "persistent_7",
    name: "المثابر 7 أيام",
    description: "حافظ على سلسلة نشاط علمي لمدة سبعة أيام.",
    iconUrl: "flame",
    xpRequirement: 0,
  },
  {
    id: "mistake_reviewer_10",
    name: "راجع أخطاءه 10 مرات",
    description: "واجه أخطاءه المتراكمة بالمراجعة والتثبيت.",
    iconUrl: "refresh-cw",
    xpRequirement: 0,
  },
] as const;

export type BadgeId = (typeof BADGE_CATALOG)[number]["id"];
