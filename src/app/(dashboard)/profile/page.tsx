import { requireAuth } from '@/lib/auth'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  const { dbUser } = await requireAuth()

  return <ProfileClient user={JSON.parse(JSON.stringify(dbUser))} />
}
