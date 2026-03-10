export function calculateMatchScore(userSkills: Array<{ skillName: string; level: number; isGrowthTarget: boolean }>, requiredSkills: string[], currentUtilization: number): { score: number; breakdown: { skill: number; capacity: number; growth: number } } {
  if (requiredSkills.length === 0) return { score: 50, breakdown: { skill: 50, capacity: 50, growth: 0 } }
  const matched = requiredSkills.filter(rs => userSkills.some(us => us.skillName === rs))
  const skillScore = (matched.length / requiredSkills.length) * 100
  const capacityScore = Math.max(0, 100 - currentUtilization)
  const growthMatched = requiredSkills.filter(rs => userSkills.some(us => us.skillName === rs && us.isGrowthTarget))
  const growthScore = requiredSkills.length > 0 ? (growthMatched.length / requiredSkills.length) * 100 : 0
  const score = Math.round(skillScore * 0.4 + capacityScore * 0.4 + growthScore * 0.2)
  return { score, breakdown: { skill: Math.round(skillScore), capacity: Math.round(capacityScore), growth: Math.round(growthScore) } }
}
