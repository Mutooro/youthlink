import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useMatches(profile) {
    const [matches, setMatches] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (profile && profile.role === 'student') {
            fetchAndMatch()
        } else {
            setLoading(false)
        }
    }, [profile])

    async function fetchAndMatch() {
        setLoading(true)
        try {
            // 1. Fetch active listings
            const { data: listings, error } = await supabase
                .from('listings')
                .select('*, employers(company_name)')
                .eq('is_active', true)

            if (error) throw error

            if (!listings) {
                setMatches([])
                return
            }

            // 2. Compute scores
            const userSkills = (profile.skills || []).map(s => s.toLowerCase())
            const userDistrict = profile.district?.toLowerCase()

            const scoredListings = listings.map(job => {
                let score = 0

                // Skill matching (higher weight)
                const jobReqs = (job.requirements || '').toLowerCase()
                const jobTitle = (job.title || '').toLowerCase()
                const jobDesc = (job.description || '').toLowerCase()

                userSkills.forEach(skill => {
                    if (jobReqs.includes(skill)) score += 3
                    else if (jobTitle.includes(skill)) score += 2
                    else if (jobDesc.includes(skill)) score += 1
                })

                // Location matching
                if (userDistrict && job.district?.toLowerCase() === userDistrict) {
                    score += 5
                }

                // Type matching (if looking_for matches)
                if (profile.looking_for?.includes(job.type)) {
                    score += 2
                }

                return { ...job, matchScore: score }
            })

            // 3. Filter and Sort
            // Only show jobs with some relevance, or top 4 if no matches
            const highQualityMatches = scoredListings
                .filter(j => j.matchScore > 0)
                .sort((a, b) => b.matchScore - a.matchScore)

            const finalMatches = highQualityMatches.length > 0
                ? highQualityMatches.slice(0, 6)
                : listings.slice(0, 4) // Fallback to recent if no scores

            setMatches(finalMatches)
        } catch (err) {
            console.error('Matching error:', err)
        } finally {
            setLoading(false)
        }
    }

    return { matches, loading, refreshMatches: fetchAndMatch }
}
