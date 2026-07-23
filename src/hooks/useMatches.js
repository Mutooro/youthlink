import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { calculateMatchScore } from '../lib/matching'

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
            const { data: listings, error } = await supabase
                .from('listings')
                .select('*, employers(company_name)')
                .eq('is_active', true)

            if (error) throw error

            if (!listings?.length) {
                setMatches([])
                return
            }

            const scoredListings = await Promise.all(listings.map(async (job) => {
                const localMatch = calculateMatchScore(profile, job)
                return { ...job, matchScore: localMatch.score, matchedSkills: localMatch.matchedSkills }
            }))

            const highQualityMatches = scoredListings
                .filter(j => j.matchScore > 0)
                .sort((a, b) => b.matchScore - a.matchScore)

            setMatches(highQualityMatches.slice(0, 6))
        } catch (err) {
            console.error('Matching error:', err)
            setMatches([])
        } finally {
            setLoading(false)
        }
    }

    return { matches, loading, refreshMatches: fetchAndMatch }
}
