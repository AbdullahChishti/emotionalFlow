# Assessment Deletion Implementation Plan

## Executive Summary

This document outlines a comprehensive plan to implement assessment deletion functionality in the Emotion Economy application. The system already has partial deletion functionality, but it needs to be enhanced and properly integrated with the UI.

## Current State Analysis

### ✅ Existing Functionality
1. **AssessmentService.deleteAssessment()** - Basic deletion method exists
2. **AssessmentDeletionService** - Sophisticated deletion service with soft/hard delete options
3. **UI Delete Button** - Delete button already present in AssessmentHistory component
4. **Database Schema** - Proper tables with CASCADE DELETE relationships
5. **RLS Policies** - DELETE policies exist for assessment_results table
6. **Soft Delete Support** - Database functions for soft deletion with grace period

### ❌ Missing/Incomplete Functionality
1. **RLS DELETE Policy Missing** - No DELETE policy for overall_assessments table
2. **UI Integration Issues** - Delete button calls wrong service method
3. **Error Handling** - Incomplete error handling and user feedback
4. **Cache Invalidation** - No cache invalidation after deletion
5. **Audit Logging** - Missing audit trail for deletions
6. **Confirmation Dialog** - Basic dialog exists but needs enhancement

## Database Schema Analysis

### Tables Involved in Deletion
1. **assessment_results** - Primary table storing individual assessment completions
2. **overall_assessments** - Comprehensive assessment results (needs DELETE policy)
3. **user_assessment_profiles** - Processed user profile data
4. **conversation_progress** - Assessment chat history (if exists)

### Current RLS Policies
- ✅ `assessment_results_delete_own` - Users can delete their own assessment results
- ❌ Missing DELETE policy for `overall_assessments`
- ✅ CASCADE DELETE relationships properly configured

## Detailed Implementation Plan

### Phase 1: Database Layer Fixes

#### 1.1 Add Missing RLS Policy
```sql
-- Add DELETE policy for overall_assessments
CREATE POLICY "overall_assessments_delete_own" ON overall_assessments
  FOR DELETE USING (auth.uid() = user_id);
```

#### 1.2 Verify Soft Delete Functions
- Ensure `soft_delete_assessment()` function works correctly
- Verify `restore_assessment()` function for recovery
- Test grace period functionality

### Phase 2: Service Layer Enhancements

#### 2.1 Fix AssessmentService.deleteAssessment()
**Current Issues:**
- Uses wrong parameter (assessmentId instead of entry.id)
- No soft delete option
- No cascade handling
- No audit logging

**Required Changes:**
```typescript
async deleteAssessment(
  userId: string, 
  entryId: string, // Use entry.id, not assessmentId
  options: {
    permanent?: boolean;
    cascade?: boolean;
    reason?: string;
  } = {}
): Promise<boolean>
```

#### 2.2 Integrate AssessmentDeletionService
- Use the sophisticated deletion service instead of basic method
- Add proper error handling and logging
- Implement cache invalidation

### Phase 3: UI Layer Improvements

#### 3.1 Fix Delete Button Integration
**Current Issues:**
- Calls `assessmentService.deleteAssessment(user.id, entry.assessmentId)`
- Should call with `entry.id` instead
- No proper error handling
- No loading states

**Required Changes:**
```typescript
const handleDeleteConfirm = useCallback(async () => {
  if (!deleteDialog.entry || !user?.id) return

  setDeletingId(deleteDialog.entry.id)
  
  try {
    const success = await AssessmentDeletionService.deleteIndividualAssessment(
      user.id,
      deleteDialog.entry.id, // Use entry.id
      {
        permanent: false, // Soft delete by default
        cascade: true,    // Delete related data
        reason: 'user_requested'
      }
    )

    if (success) {
      // Invalidate caches
      await invalidateUserCaches(user.id)
      
      // Refresh UI
      await loadHistory()
      
      // Show success message
      showSuccessToast('Assessment deleted successfully')
    }
  } catch (error) {
    showErrorToast('Failed to delete assessment')
  } finally {
    setDeletingId(null)
  }
}, [deleteDialog.entry, user?.id, loadHistory])
```

#### 3.2 Enhanced Confirmation Dialog
- Add permanent vs soft delete options
- Show what data will be affected
- Add reason field for audit trail
- Better visual design

#### 3.3 Loading States and Feedback
- Proper loading indicators
- Success/error toast notifications
- Optimistic UI updates
- Retry mechanisms

### Phase 4: Data Flow Architecture

#### 4.1 Complete Data Flow
```
UI (Delete Button) 
  ↓
AssessmentHistory.handleDeleteConfirm()
  ↓
AssessmentDeletionService.deleteIndividualAssessment()
  ↓
Database Functions (soft_delete_assessment)
  ↓
Database Tables (assessment_results, overall_assessments)
  ↓
Cache Invalidation
  ↓
UI Refresh
```

#### 4.2 Error Handling Flow
```
Service Error
  ↓
Error Classification (Network, Auth, Validation, etc.)
  ↓
User-Friendly Error Messages
  ↓
Retry Mechanisms (where appropriate)
  ↓
Fallback Actions
```

### Phase 5: Testing Strategy

#### 5.1 Unit Tests
- Test AssessmentDeletionService methods
- Test AssessmentService.deleteAssessment()
- Test UI component handlers
- Test error scenarios

#### 5.2 Integration Tests
- Test complete deletion flow
- Test RLS policy enforcement
- Test cache invalidation
- Test audit logging

#### 5.3 E2E Tests
- Test UI deletion workflow
- Test confirmation dialog
- Test error handling
- Test recovery scenarios

## Implementation Steps

### Step 1: Database Fixes (Priority: High)
1. Add missing RLS DELETE policy for overall_assessments
2. Test existing soft delete functions
3. Verify CASCADE relationships

### Step 2: Service Layer Updates (Priority: High)
1. Fix AssessmentService.deleteAssessment() method
2. Integrate AssessmentDeletionService
3. Add proper error handling and logging
4. Implement cache invalidation

### Step 3: UI Integration (Priority: Medium)
1. Fix delete button to use correct parameters
2. Enhance confirmation dialog
3. Add proper loading states and feedback
4. Implement optimistic updates

### Step 4: Testing and Validation (Priority: Medium)
1. Write comprehensive tests
2. Test all deletion scenarios
3. Validate security and permissions
4. Performance testing

### Step 5: Documentation and Monitoring (Priority: Low)
1. Update API documentation
2. Add monitoring and alerting
3. Create user guides
4. Audit trail verification

## Security Considerations

### 1. Authorization
- RLS policies ensure users can only delete their own assessments
- Service layer validates user ownership
- UI prevents unauthorized access

### 2. Data Integrity
- Soft delete preserves data for recovery
- CASCADE operations maintain referential integrity
- Audit logging tracks all deletion activities

### 3. Privacy Compliance
- Soft delete allows data recovery within grace period
- Permanent deletion removes all traces
- User consent for permanent deletion

## Performance Considerations

### 1. Database Performance
- Proper indexing on deletion queries
- Soft delete queries use efficient WHERE clauses
- CASCADE operations are optimized

### 2. Cache Management
- Invalidate relevant caches after deletion
- Use optimistic updates for better UX
- Implement cache warming strategies

### 3. UI Performance
- Lazy loading of confirmation dialogs
- Debounced deletion requests
- Background refresh of data

## Monitoring and Alerting

### 1. Success Metrics
- Deletion success rate
- Average deletion time
- User satisfaction scores

### 2. Error Monitoring
- Failed deletion attempts
- Permission errors
- Database constraint violations

### 3. Audit Trail
- All deletion activities logged
- User actions tracked
- Recovery operations recorded

## Rollback Plan

### 1. Database Rollback
- Soft delete allows easy recovery
- Database functions can restore data
- Migration rollback scripts available

### 2. Code Rollback
- Feature flags for deletion functionality
- Gradual rollout strategy
- Quick revert mechanisms

### 3. Data Recovery
- Grace period for soft-deleted data
- Manual recovery procedures
- Backup and restore strategies

## Success Criteria

### 1. Functional Requirements
- ✅ Users can delete individual assessments
- ✅ Soft delete preserves data for recovery
- ✅ Permanent delete removes all traces
- ✅ Related data is properly handled
- ✅ UI provides clear feedback

### 2. Non-Functional Requirements
- ✅ Deletion completes within 2 seconds
- ✅ 99.9% success rate for deletions
- ✅ Proper error handling and recovery
- ✅ Security and privacy compliance
- ✅ Comprehensive audit trail

### 3. User Experience
- ✅ Intuitive deletion workflow
- ✅ Clear confirmation process
- ✅ Immediate feedback and updates
- ✅ Recovery options available
- ✅ Consistent with app design

## Timeline Estimate

- **Phase 1 (Database)**: 1-2 days
- **Phase 2 (Services)**: 2-3 days  
- **Phase 3 (UI)**: 2-3 days
- **Phase 4 (Testing)**: 2-3 days
- **Phase 5 (Documentation)**: 1 day

**Total Estimated Time**: 8-12 days

## Risk Assessment

### High Risk
- Data loss during permanent deletion
- Performance impact on large datasets
- Security vulnerabilities in deletion process

### Medium Risk
- UI/UX confusion with deletion options
- Cache invalidation issues
- Error handling edge cases

### Low Risk
- Minor UI polish issues
- Documentation gaps
- Monitoring setup delays

## Conclusion

The assessment deletion functionality is partially implemented but needs significant enhancements to be production-ready. The plan focuses on fixing existing issues, improving the user experience, and ensuring data security and integrity. The implementation should be done in phases with proper testing and monitoring at each stage.
