import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { isSupabaseConfigured } from '@/lib/supabaseClient'

type Mode = 'magic-link' | 'password'

export function AuthPage() {
  const signInWithMagicLink = useStore((s) => s.signInWithMagicLink)
  const signInWithPassword = useStore((s) => s.signInWithPassword)
  const signUpWithPassword = useStore((s) => s.signUpWithPassword)

  const [mode, setMode] = useState<Mode>('magic-link')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  if (!isSupabaseConfigured) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-card border border-line bg-paper-raised p-6 shadow-sm">
          <h1 className="font-display text-xl font-semibold text-ink">Connect Supabase to continue</h1>
          <p className="mt-2 text-sm text-ink-soft">
            This app needs a Supabase project to store your data. Copy <code className="font-data text-xs">.env.example</code> to{' '}
            <code className="font-data text-xs">.env</code>, fill in your project URL and anon key, then restart the dev server.
          </p>
        </div>
      </div>
    )
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      await signInWithMagicLink(email)
      setStatus('sent')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Failed to send magic link.')
    }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      if (isSignUp) {
        await signUpWithPassword(email, password)
        setStatus('sent')
      } else {
        await signInWithPassword(email, password)
      }
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Sign-in failed.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-ink bg-paper-raised font-display text-lg font-semibold text-ink">
            §
          </div>
          <div>
            <h1 className="font-display text-xl font-semibold text-ink">Semester Notebook</h1>
            <p className="text-xs text-ink-soft">Your NUS modules, tracked properly.</p>
          </div>
        </div>

        <div className="rounded-card border border-line bg-paper-raised p-6 shadow-sm">
          <div className="mb-4 flex rounded-lg border border-line bg-paper p-1 text-sm">
            <button
              type="button"
              onClick={() => setMode('magic-link')}
              className={`min-h-10 flex-1 rounded-md font-medium transition-colors ${mode === 'magic-link' ? 'bg-brand text-paper-raised' : 'text-ink-soft'}`}
            >
              Magic link
            </button>
            <button
              type="button"
              onClick={() => setMode('password')}
              className={`min-h-10 flex-1 rounded-md font-medium transition-colors ${mode === 'password' ? 'bg-brand text-paper-raised' : 'text-ink-soft'}`}
            >
              Password
            </button>
          </div>

          {status === 'sent' && mode === 'magic-link' && (
            <p className="rounded-md bg-status-safe-tint p-3 text-sm text-status-safe">
              Check <strong>{email}</strong> for a sign-in link.
            </p>
          )}
          {status === 'sent' && mode === 'password' && isSignUp && (
            <p className="rounded-md bg-status-safe-tint p-3 text-sm text-status-safe">
              Account created. Check <strong>{email}</strong> to confirm, then sign in.
            </p>
          )}

          {!(status === 'sent') && mode === 'magic-link' && (
            <form onSubmit={handleMagicLink} className="space-y-3">
              <label className="block text-sm font-medium text-ink-soft">
                Email
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 min-h-11 w-full rounded-md border border-line-strong bg-paper px-3 text-sm text-ink outline-none focus:border-brand"
                  placeholder="you@u.nus.edu"
                />
              </label>
              <button
                type="submit"
                disabled={status === 'sending'}
                className="min-h-11 w-full rounded-md bg-brand text-sm font-medium text-paper-raised hover:opacity-90 disabled:opacity-60"
              >
                {status === 'sending' ? 'Sending…' : 'Send magic link'}
              </button>
            </form>
          )}

          {!(status === 'sent' && isSignUp) && mode === 'password' && (
            <form onSubmit={handlePassword} className="space-y-3">
              <label className="block text-sm font-medium text-ink-soft">
                Email
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 min-h-11 w-full rounded-md border border-line-strong bg-paper px-3 text-sm text-ink outline-none focus:border-brand"
                  placeholder="you@u.nus.edu"
                />
              </label>
              <label className="block text-sm font-medium text-ink-soft">
                Password
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 min-h-11 w-full rounded-md border border-line-strong bg-paper px-3 text-sm text-ink outline-none focus:border-brand"
                  placeholder="••••••••"
                />
              </label>
              <button
                type="submit"
                disabled={status === 'sending'}
                className="min-h-11 w-full rounded-md bg-brand text-sm font-medium text-paper-raised hover:opacity-90 disabled:opacity-60"
              >
                {status === 'sending' ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp((v) => !v)}
                className="min-h-11 w-full text-xs text-ink-soft hover:text-ink"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </form>
          )}

          {status === 'error' && <p className="mt-3 text-sm text-status-needs-self-study">{errorMessage}</p>}
        </div>

        <p className="mt-4 text-center text-xs text-ink-faint">
          Single-user tool — whoever signs in first owns this data. Keep your login private.
        </p>
      </div>
    </div>
  )
}
