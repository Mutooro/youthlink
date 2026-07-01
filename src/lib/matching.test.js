import { describe, expect, it } from 'vitest'
import { calculateMatchScore } from './matching'

describe('calculateMatchScore', () => {
  it('scores skill overlap higher than generic text matches', () => {
    const profile = {
      skills: ['React', 'Node.js', 'SQL'],
      district: 'Kampala',
      availability: 'immediately',
      looking_for: ['internship']
    }

    const listing = {
      title: 'Frontend Developer',
      description: 'Build dashboards for clients',
      district: 'Kampala',
      type: 'internship',
      skills_required: ['React', 'UI/UX']
    }

    const score = calculateMatchScore(profile, listing)

    expect(score.score).toBeGreaterThan(60)
    expect(score.matchedSkills).toEqual(['React'])
  })
})
