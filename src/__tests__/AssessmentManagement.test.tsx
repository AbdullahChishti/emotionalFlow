import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AssessmentManagement } from '@/components/assessment/AssessmentManagement'

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(() => ({ data: { user: { id: 'user-123' } } })),
      getSession: vi.fn(() => ({
        data: { session: { access_token: 'mock-token' } }
      }))
    }
  }
}))

vi.mock('@/data/assessments', () => ({
  ASSESSMENTS: {
    phq9: {
      title: 'PHQ-9',
      shortTitle: 'Depression',
      category: 'depression'
    },
    gad7: {
      title: 'GAD-7',
      shortTitle: 'Anxiety',
      category: 'anxiety'
    }
  }
}))

vi.mock('@/data/assessment-icons', () => ({
  getAssessmentIcon: vi.fn(() => ({ __esModule: true, default: () => null }))
}))

describe('AssessmentManagement', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // Mock fetch for API calls
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: {
            summary: {
              activeAssessments: [
                { assessment_id: 'phq9', taken_at: '2024-01-01T00:00:00Z' }
              ],
              deletedAssessments: [],
              userProfile: null,
              overallAssessments: []
            }
          }
        })
      })
    ) as any
  })

  it('renders loading state initially', () => {
    render(<AssessmentManagement onClose={mockOnClose} />)

    expect(screen.getByText(/Loading/i)).toBeInTheDocument()
  })

  it('renders assessment management interface', async () => {
    render(<AssessmentManagement onClose={mockOnClose} />)

    await waitFor(() => {
      expect(screen.getByText('Manage Assessments')).toBeInTheDocument()
    })
  })

  it('displays assessment summary', async () => {
    render(<AssessmentManagement onClose={mockOnClose} />)

    await waitFor(() => {
      expect(screen.getByText('Summary')).toBeInTheDocument()
      expect(screen.getByText('Active')).toBeInTheDocument()
      expect(screen.getByText('Deleted')).toBeInTheDocument()
      expect(screen.getByText('Not Taken')).toBeInTheDocument()
      expect(screen.getByText('Overall')).toBeInTheDocument()
    })
  })

  it('calls onClose when close button is clicked', async () => {
    render(<AssessmentManagement onClose={mockOnClose} />)

    await waitFor(() => {
      const closeButton = screen.getByRole('button', { name: /close/i })
      fireEvent.click(closeButton)
    })

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('shows delete button for active assessments', async () => {
    render(<AssessmentManagement onClose={mockOnClose} />)

    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      expect(deleteButtons.length).toBeGreaterThan(0)
    })
  })

  it('shows confirmation dialog when delete is clicked', async () => {
    render(<AssessmentManagement onClose={mockOnClose} />)

    await waitFor(() => {
      const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0]
      fireEvent.click(deleteButton)
    })

    expect(screen.getByText('Delete Assessment')).toBeInTheDocument()
    expect(screen.getByText(/Are you sure/)).toBeInTheDocument()
  })

  it('handles bulk selection', async () => {
    render(<AssessmentManagement onClose={mockOnClose} />)

    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox')
      expect(checkboxes.length).toBeGreaterThan(0)
    })
  })
})
