import { AssessmentResults } from '@/components/assessment/AssessmentResults'

export default function ResultsPage() {
  // This page would typically receive results as props or from state
  // For now, we'll show a placeholder
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-green-50 via-white to-brand-green-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-zinc-900 mb-4">Assessment Results</h1>
        <p className="text-zinc-600">Results will be displayed here after completing assessments.</p>
      </div>
    </div>
  )
}