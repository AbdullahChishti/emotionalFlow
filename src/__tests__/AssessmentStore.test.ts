import { describe, it, expect, vi } from 'vitest'
import { useAssessmentStore } from '@/stores/assessmentStore'

// Mock localStorage for testing
const localStorageMock = {
}

Object.defineProperty(window, 'localStorage', {
})

describe('AssessmentStore - Unconscious Manifestations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('should have unconscious manifestations in initial state', () => {
    const store = useAssessmentStore.getState()
    expect(store.unconsciousManifestations).toEqual([])
  })

  it('should allow setting unconscious manifestations', () => {
    const mockManifestations = [
      'Difficulty trusting others',
      'Avoiding emotional intimacy',
      'Chronic feelings of inadequacy'
    ]

    const store = useAssessmentStore.getState()
    store.setUnconsciousManifestations(mockManifestations)

    const updatedStore = useAssessmentStore.getState()
    expect(updatedStore.unconsciousManifestations).toEqual(mockManifestations)
  })

  it('should persist unconscious manifestations to localStorage', () => {
    const mockManifestations = [
      'Emotional avoidance patterns',
      'Unresolved trauma responses'
    ]

    const store = useAssessmentStore.getState()
    store.setUnconsciousManifestations(mockManifestations)

    // The persist middleware should have been called
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'assessment-storage',
      expect.stringContaining('"unconsciousManifestations"')
    )
  })

  it('should clear unconscious manifestations when clearing results', () => {
    const mockManifestations = [
      'Test manifestation 1',
      'Test manifestation 2'
    ]

    const store = useAssessmentStore.getState()
    store.setUnconsciousManifestations(mockManifestations)
    store.clearResults()

    const updatedStore = useAssessmentStore.getState()
    expect(updatedStore.unconsciousManifestations).toEqual([])
  })

  it('should handle completeAssessmentFlow with unconscious manifestations', () => {
    const mockResults = {
      }
    }

    const mockUserProfile = {
          'Difficulty forming deep connections',
          'Subconscious fear of vulnerability',
          'Pattern of self-sabotage in relationships'
        ]
      }
    }

    const store = useAssessmentStore.getState()
    store.completeAssessmentFlow(mockResults, mockUserProfile)

    const updatedStore = useAssessmentStore.getState()
    expect(updatedStore.unconsciousManifestations).toEqual([
      'Difficulty forming deep connections',
      'Subconscious fear of vulnerability',
      'Pattern of self-sabotage in relationships'
    ])
  })
})
