import { EditableTaskArchiveRoute, taskMetadata } from '@/editable/pages/TaskArchivePage'

/*
  /profile renders the profile task page directly (the same archive template
  every other task uses). Profile is still not linked from the public nav /
  footer / home / search / archives per site policy — but the URL itself,
  when reached directly, always lands on the profile task page and never
  redirects elsewhere.
*/

export const revalidate = 3

export const generateMetadata = () => taskMetadata('profile', '/profile')

export async function ProfilePageTaskPage({
  searchParams,
  basePath = '/profile',
}: {
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  return <EditableTaskArchiveRoute task="profile" searchParams={searchParams} basePath={basePath} />
}

export default ProfilePageTaskPage

export const ProfileTaskPage = ProfilePageTaskPage
