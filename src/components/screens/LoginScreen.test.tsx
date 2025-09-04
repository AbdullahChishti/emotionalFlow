import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { LoginScreen } from './LoginScreen'

vi.mock('@/lib/analytics', () => ({ track: vi.fn() }))
vi.mock('@/components/providers/AuthProvider', () => ({ useAuth: () => ({ user: null }) }))
vi.mock('@/lib/supabase', () => ({
  supabase: { auth: { signInWithPassword: vi.fn().mockResolvedValue({ error: null }), signInWithOAuth: vi.fn() } }
}))

describe('LoginScreen', () => {
  it('shows validation errors when fields are empty', async () => {
    const { track } = await import('@/lib/analytics')
    render(<LoginScreen />)
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(await screen.findByText('Please enter your email.')).toBeInTheDocument()
    expect(await screen.findByText('Please enter your password.')).toBeInTheDocument()
    expect(track).toHaveBeenCalledWith('signin_error', { type: 'validation' })
  })

  it('toggles password visibility', () => {
    render(<LoginScreen />)
    const toggle = screen.getByRole('button', { name: /show password/i })
    const input = screen.getByLabelText('Password') as HTMLInputElement
    expect(input.type).toBe('password')
    fireEvent.click(toggle)
    expect(input.type).toBe('text')
    expect(toggle).toHaveAttribute('aria-label', 'Hide password')
  })

  it('emits analytics events on successful submit', async () => {
    const { track } = await import('@/lib/analytics')
    const { supabase } = await import('@/lib/supabase')
    ;(supabase.auth.signInWithPassword as any).mockResolvedValue({ error: null })
    render(<LoginScreen />)
    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }))
    await waitFor(() => {
      expect(track).toHaveBeenCalledWith('signin_submit', { method: 'password', rememberMe: false })
    })
    await waitFor(() => {
      expect(track).toHaveBeenCalledWith('signin_success', { method: 'password' })
    })
  })
})
