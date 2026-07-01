import express from 'express'
import cors from 'cors'
import { calculateMatchScore } from './src/lib/matching.js'

const app = express()
app.use(cors())
app.use(express.json())

app.post('/api/match', (req, res) => {
  const { profile, listing } = req.body || {}
  const match = calculateMatchScore(profile, listing)
  res.json(match)
})

app.listen(3001, () => {
  console.log('Matching API listening on port 3001')
})
