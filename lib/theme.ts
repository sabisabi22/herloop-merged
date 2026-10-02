export const COLORS = {
  plum: "#2B1B33",
  plumSoft: "#6B5570",
  plumMid: "#8B6B9E",
  rose: "#C1666B",
  moss: "#6B7F5E",
  gold: "#D4A94A",
  cream: "#FBF6EF",
  sage: "#A8C5A2",
  mist: "#E4D9E8",
} as const;

export const PHASES = [
  { name: "Childhood", color: COLORS.sage },
  { name: "Teen", color: COLORS.rose },
  { name: "Adult", color: COLORS.plumMid },
  { name: "Maternity", color: COLORS.gold },
  { name: "Elder", color: COLORS.moss },
] as const;
