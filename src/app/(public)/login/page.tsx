import LoginScreen from '@/components/screens/LoginScreen'
import { Suspense } from 'react'

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginScreen />
    </Suspense>
  )
}
