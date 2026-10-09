import type { AccountTier } from "./auth";

export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);

  let age = today.getFullYear() - birthDate.getFullYear();

  const monthDifference =
    today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

export function getCurrentTier(age: number): AccountTier {
  if (age < 10) {
    return "under10";
  }

  if (age < 18) {
    return "teen";
  }

  return "adult";
}