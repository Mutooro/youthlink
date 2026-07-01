export function calculateMatchScore(profile = {}, listing = {}) {
  const profileSkills = (profile.skills || []).map((skill) => skill.toLowerCase())
  const requiredSkills = (listing.skills_required || []).map((skill) => skill.toLowerCase())
  const matchedSkills = requiredSkills.filter((skill) => profileSkills.includes(skill))

  const skillScore = requiredSkills.length > 0
    ? (matchedSkills.length / requiredSkills.length) * 60
    : 30

  const matchedSkillNames = (listing.skills_required || []).filter((skill) => {
    const normalized = skill.toLowerCase()
    return profileSkills.includes(normalized)
  })

  const locationScore = profile.district && profile.district.toLowerCase() === (listing.district || '').toLowerCase()
    ? 25
    : 10

  const availabilityScore = profile.availability === 'immediately' ? 15 : 5
  const typeScore = profile.looking_for?.includes(listing.type) ? 10 : 0
  const total = Math.min(100, Math.round(skillScore + locationScore + availabilityScore + typeScore))

  return { score: total, matchedSkills: matchedSkillNames }
}
