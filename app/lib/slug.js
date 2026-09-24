export function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const CATEGORY_ICON = {
  Networking: "🤝",
  Workshop: "🛠️",
  Dinner: "🍽️",
  Roundtable: "🎙️",
  Expo: "🏛️",
  Conference: "🎤",
};

export function categoryIcon(category) {
  return CATEGORY_ICON[category] || "📅";
}
