import { supabase } from './supabase'

export async function uploadCV(file, userId) {
  const fileExt = file.name.split('.').pop()
  const filePath = `${userId}/cv.${fileExt}`

  const { error } = await supabase.storage
    .from('cvs')
    .upload(filePath, file, { upsert: true })

  if (error) throw error

  // Save CV URL to profile
  await supabase
    .from('profiles')
    .update({ cv_url: filePath })
    .eq('user_id', userId)

  return filePath
}