import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useStore } from '@/store/useStore'
import { isSupabaseConfigured } from '@/lib/supabaseClient'
import { AuthPage } from '@/pages/AuthPage'
import { Layout } from '@/components/Layout'
import { Overview } from '@/pages/Overview'
import { CourseDetail } from '@/pages/CourseDetail'
import { WeeklyComparison } from '@/pages/WeeklyComparison'
import { ErrorToast } from '@/components/ErrorToast'

function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-line-strong border-t-brand" />
    </div>
  )
}

function App() {
  const init = useStore((s) => s.init)
  const authLoading = useStore((s) => s.authLoading)
  const user = useStore((s) => s.user)

  useEffect(() => {
    void init()
  }, [init])

  if (!isSupabaseConfigured) return <AuthPage />
  if (authLoading) return <FullScreenSpinner />
  if (!user) return <AuthPage />

  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="course/:courseId" element={<CourseDetail />} />
          <Route path="compare" element={<WeeklyComparison />} />
        </Route>
      </Routes>
      <ErrorToast />
    </>
  )
}

export default App
