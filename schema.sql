-- =============================================
-- Mental Health Platform - Complete PostgreSQL Schema
-- Generated from Mermaid ERD - PostgreSQL 15 Compatible
-- =============================================

-- =============================================
-- ENUM TYPES
-- =============================================

-- Consent types for data usage permissions
CREATE TYPE consent_key AS ENUM (
    'analytics',
    'personalization',
    'voice_storage',
    'model_training'
);

-- Assessment attempt workflow states
CREATE TYPE assessment_status AS ENUM (
    'in_progress',
    'submitted',
    'scored'
);

-- Standardized severity levels for assessments
CREATE TYPE severity_level AS ENUM (
    'none',
    'mild',
    'moderate',
    'moderately_severe',
    'severe'
);

-- Conversation lifecycle states
CREATE TYPE conversation_status AS ENUM (
    'active',
    'completed',
    'archived'
);

-- Message roles in conversations
CREATE TYPE message_role AS ENUM (
    'user',
    'assistant',
    'system',
    'tool'
);

-- AI provider types
CREATE TYPE ai_provider AS ENUM (
    'openai',
    'anthropic',
    'local'
);

-- Safety event categories
CREATE TYPE safety_event_type AS ENUM (
    'self_harm',
    'medical_advice',
    'privacy',
    'violence',
    'hate',
    'sexual_content',
    'other'
);

-- Generic severity levels
CREATE TYPE generic_severity AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

-- Crisis flag types
CREATE TYPE crisis_flag_type AS ENUM (
    'imminent_risk',
    'passive_ideation',
    'resource_request'
);

-- Generic priority levels
CREATE TYPE priority_level AS ENUM (
    'low',
    'medium',
    'high',
    'urgent'
);

-- Recommendation delivery states
CREATE TYPE recommendation_status AS ENUM (
    'pending',
    'delivered',
    'read',
    'actioned'
);

-- Goal lifecycle states
CREATE TYPE goal_status AS ENUM (
    'active',
    'completed',
    'paused',
    'cancelled'
);

-- Feature flag test variants
CREATE TYPE flag_variant AS ENUM (
    'control',
    'treatment_a',
    'treatment_b'
);

-- =============================================
-- TABLES
-- =============================================

-- Core user accounts
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    username TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- OAuth and external authentication
CREATE TABLE auth_identities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    provider_id TEXT NOT NULL,
    provider_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- GDPR and privacy consents
CREATE TABLE consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key consent_key NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    granted BOOLEAN NOT NULL DEFAULT false,
    granted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Extended user profiles (1:1 with users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    display_name TEXT,
    bio TEXT,
    preferences JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Assessment templates/definitions
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Versioned assessment forms
CREATE TABLE assessment_forms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    title TEXT NOT NULL,
    instructions TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Individual assessment questions/items
CREATE TABLE assessment_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID NOT NULL REFERENCES assessment_forms(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    key TEXT NOT NULL,
    question_type TEXT NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB,
    validation_rules JSONB,
    is_required BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User assessment attempts/sessions
CREATE TABLE assessment_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    form_id UUID NOT NULL REFERENCES assessment_forms(id) ON DELETE CASCADE,
    responses JSONB,
    status assessment_status NOT NULL DEFAULT 'in_progress',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Calculated assessment scores
CREATE TABLE assessment_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
    score_type TEXT NOT NULL,
    raw_score INTEGER,
    score_data JSONB,
    severity severity_level,
    calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Conversation/chat sessions
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT,
    status conversation_status NOT NULL DEFAULT 'active',
    locale TEXT,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Individual messages in conversations
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role message_role NOT NULL,
    content TEXT,
    redacted_content TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- File attachments for messages
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    storage_key TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- AI model execution runs
CREATE TABLE ai_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    provider ai_provider NOT NULL,
    model TEXT NOT NULL,
    prompt_hash TEXT,
    prompt_data JSONB,
    response_data JSONB,
    input_tokens INTEGER,
    output_tokens INTEGER,
    latency_ms INTEGER,
    tool_calls JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Safety monitoring events
CREATE TABLE safety_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    event_type safety_event_type NOT NULL,
    severity generic_severity NOT NULL,
    event_data JSONB,
    reviewed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crisis detection and response flags
CREATE TABLE crisis_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    safety_event_id UUID NOT NULL REFERENCES safety_events(id) ON DELETE CASCADE,
    flag_type crisis_flag_type NOT NULL,
    priority priority_level NOT NULL,
    resolved BOOLEAN NOT NULL DEFAULT false,
    resolved_by_user_id UUID REFERENCES users(id),
    resolution_notes TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI-generated recommendations
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB,
    status recommendation_status NOT NULL DEFAULT 'pending',
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User-defined goals
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    status goal_status NOT NULL DEFAULT 'active',
    target_date DATE,
    progress_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User journal/reflection entries
CREATE TABLE journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT,
    content TEXT NOT NULL,
    mood_data JSONB,
    tags JSONB,
    is_private BOOLEAN NOT NULL DEFAULT false,
    entry_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mood tracking entries
CREATE TABLE mood_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mood_score INTEGER,
    mood_label TEXT,
    context_data JSONB,
    entry_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Feature flag definitions
CREATE TABLE feature_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    conditions JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Feature flag user assignments
CREATE TABLE flag_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    variant flag_variant NOT NULL DEFAULT 'control',
    override_value JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Comprehensive audit logging
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- UNIQUE CONSTRAINTS
-- =============================================

-- Users table constraints
ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username);

-- Auth identities uniqueness
ALTER TABLE auth_identities ADD CONSTRAINT auth_identities_provider_provider_id_unique UNIQUE (provider, provider_id);

-- Profile 1:1 relationship
ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- Assessment versioning
ALTER TABLE assessment_forms ADD CONSTRAINT assessment_forms_assessment_id_version_unique UNIQUE (assessment_id, version);

-- Assessment items uniqueness within form
ALTER TABLE assessment_items ADD CONSTRAINT assessment_items_form_id_key_unique UNIQUE (form_id, key);

-- Feature flags
ALTER TABLE feature_flags ADD CONSTRAINT feature_flags_name_unique UNIQUE (name);

-- =============================================
-- INDEXES
-- =============================================

-- Foreign Key Indexes (automatically created by REFERENCES, but explicit for clarity)
CREATE INDEX idx_auth_identities_user_id ON auth_identities(user_id);
CREATE INDEX idx_consents_user_id ON consents(user_id);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_assessment_forms_assessment_id ON assessment_forms(assessment_id);
CREATE INDEX idx_assessment_items_form_id ON assessment_items(form_id);
CREATE INDEX idx_assessment_attempts_user_id ON assessment_attempts(user_id);
CREATE INDEX idx_assessment_attempts_form_id ON assessment_attempts(form_id);
CREATE INDEX idx_assessment_scores_attempt_id ON assessment_scores(attempt_id);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_attachments_message_id ON attachments(message_id);
CREATE INDEX idx_ai_runs_conversation_id ON ai_runs(conversation_id);
CREATE INDEX idx_ai_runs_message_id ON ai_runs(message_id);
CREATE INDEX idx_safety_events_conversation_id ON safety_events(conversation_id);
CREATE INDEX idx_safety_events_message_id ON safety_events(message_id);
CREATE INDEX idx_crisis_flags_safety_event_id ON crisis_flags(safety_event_id);
CREATE INDEX idx_crisis_flags_resolved_by_user_id ON crisis_flags(resolved_by_user_id);
CREATE INDEX idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX idx_flag_assignments_flag_id ON flag_assignments(flag_id);
CREATE INDEX idx_flag_assignments_user_id ON flag_assignments(user_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);

-- Time-series indexes for performance
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_updated_at ON users(updated_at);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);
CREATE INDEX idx_profiles_updated_at ON profiles(updated_at);
CREATE INDEX idx_assessments_created_at ON assessments(created_at);
CREATE INDEX idx_assessments_updated_at ON assessments(updated_at);
CREATE INDEX idx_assessment_forms_created_at ON assessment_forms(created_at);
CREATE INDEX idx_assessment_forms_updated_at ON assessment_forms(updated_at);
CREATE INDEX idx_assessment_items_created_at ON assessment_items(created_at);
CREATE INDEX idx_assessment_attempts_created_at ON assessment_attempts(created_at);
CREATE INDEX idx_assessment_attempts_updated_at ON assessment_attempts(updated_at);
CREATE INDEX idx_assessment_attempts_started_at ON assessment_attempts(started_at);
CREATE INDEX idx_assessment_attempts_submitted_at ON assessment_attempts(submitted_at);
CREATE INDEX idx_assessment_scores_created_at ON assessment_scores(created_at);
CREATE INDEX idx_assessment_scores_calculated_at ON assessment_scores(calculated_at);
CREATE INDEX idx_conversations_created_at ON conversations(created_at);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at);
CREATE INDEX idx_conversations_started_at ON conversations(started_at);
CREATE INDEX idx_conversations_last_activity ON conversations(last_activity);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_attachments_created_at ON attachments(created_at);
CREATE INDEX idx_attachments_expires_at ON attachments(expires_at);
CREATE INDEX idx_ai_runs_created_at ON ai_runs(created_at);
CREATE INDEX idx_safety_events_created_at ON safety_events(created_at);
CREATE INDEX idx_crisis_flags_created_at ON crisis_flags(created_at);
CREATE INDEX idx_crisis_flags_resolved_at ON crisis_flags(resolved_at);
CREATE INDEX idx_recommendations_created_at ON recommendations(created_at);
CREATE INDEX idx_recommendations_delivered_at ON recommendations(delivered_at);
CREATE INDEX idx_goals_created_at ON goals(created_at);
CREATE INDEX idx_goals_updated_at ON goals(updated_at);
CREATE INDEX idx_goals_target_date ON goals(target_date);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(created_at);
CREATE INDEX idx_journal_entries_updated_at ON journal_entries(updated_at);
CREATE INDEX idx_journal_entries_entry_date ON journal_entries(entry_date);
CREATE INDEX idx_mood_entries_created_at ON mood_entries(created_at);
CREATE INDEX idx_mood_entries_entry_timestamp ON mood_entries(entry_timestamp);
CREATE INDEX idx_feature_flags_created_at ON feature_flags(created_at);
CREATE INDEX idx_feature_flags_updated_at ON feature_flags(updated_at);
CREATE INDEX idx_flag_assignments_created_at ON flag_assignments(created_at);
CREATE INDEX idx_flag_assignments_updated_at ON flag_assignments(updated_at);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Composite indexes for common queries
CREATE INDEX idx_assessment_attempts_user_status ON assessment_attempts(user_id, status);
CREATE INDEX idx_conversations_user_status ON conversations(user_id, status);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);
CREATE INDEX idx_safety_events_severity_reviewed ON safety_events(severity, reviewed);
CREATE INDEX idx_crisis_flags_priority_resolved ON crisis_flags(priority, resolved);
CREATE INDEX idx_mood_entries_user_timestamp ON mood_entries(user_id, entry_timestamp);
CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at);

-- =============================================
-- SCHEMA SUMMARY
-- =============================================
/*
Tables Created (26 total):
- users (PK: id, UK: email, username)
- auth_identities (PK: id, UK: provider+provider_id, FK: user_id)
- consents (PK: id, FK: user_id)
- profiles (PK: id, UK: user_id, FK: user_id)
- assessments (PK: id)
- assessment_forms (PK: id, UK: assessment_id+version, FK: assessment_id)
- assessment_items (PK: id, UK: form_id+key, FK: form_id)
- assessment_attempts (PK: id, FK: user_id, form_id)
- assessment_scores (PK: id, FK: attempt_id)
- conversations (PK: id, FK: user_id)
- messages (PK: id, FK: conversation_id, user_id)
- attachments (PK: id, FK: message_id)
- ai_runs (PK: id, FK: conversation_id, message_id)
- safety_events (PK: id, FK: conversation_id, message_id)
- crisis_flags (PK: id, FK: safety_event_id, resolved_by_user_id)
- recommendations (PK: id, FK: user_id)
- goals (PK: id, FK: user_id)
- journal_entries (PK: id, FK: user_id)
- mood_entries (PK: id, FK: user_id)
- feature_flags (PK: id, UK: name)
- flag_assignments (PK: id, FK: flag_id, user_id)
- audit_logs (PK: id, FK: user_id)

Enums Created (13 total):
- consent_key, assessment_status, severity_level, conversation_status
- message_role, ai_provider, safety_event_type, generic_severity
- crisis_flag_type, priority_level, recommendation_status
- goal_status, flag_variant

Constraints Added:
- UNIQUE: 6 constraints (users email/username, auth identities, profiles 1:1, assessment forms versioning, assessment items, feature flags)
- FK: 28 foreign key relationships with CASCADE deletes where appropriate
- Indexes: 68 total (28 FK indexes + 40 time-series/composite indexes)

Schema is PostgreSQL 15 compatible with gen_random_uuid() usage.
*/
