-- =============================================
-- LOOMIK SALES INTELLIGENCE PLATFORM DATABASE
-- =============================================

-- ==================== ENUMS ====================

-- Deal stages in the sales pipeline
CREATE TYPE public.deal_stage AS ENUM ('diagnose', 'validate', 'align', 'commit');

-- Stakeholder status/sentiment
CREATE TYPE public.stakeholder_status AS ENUM ('positive', 'neutral', 'negative');

-- Engagement level of stakeholder
CREATE TYPE public.engagement_category AS ENUM ('engaged', 'silent', 'hidden');

-- Action priority levels
CREATE TYPE public.action_priority AS ENUM ('high', 'medium', 'low');

-- Action types
CREATE TYPE public.action_type AS ENUM ('email', 'meeting');

-- Action status
CREATE TYPE public.action_status AS ENUM ('pending', 'done', 'archived');

-- Signal/Risk type
CREATE TYPE public.signal_type AS ENUM ('signal', 'risk');

-- Signal status
CREATE TYPE public.signal_status AS ENUM ('pending', 'processed', 'ignored');

-- Calendar event type
CREATE TYPE public.event_type AS ENUM ('call', 'meeting');


-- ==================== DEALS TABLE ====================

CREATE TABLE public.deals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company TEXT NOT NULL,
  logo TEXT,
  industry TEXT,
  value TEXT NOT NULL,
  value_numeric NUMERIC(15, 2) NOT NULL DEFAULT 0,
  close_date DATE,
  deal_start_date DATE,
  stage deal_stage NOT NULL DEFAULT 'diagnose',
  win_probability INTEGER NOT NULL DEFAULT 0 CHECK (win_probability >= 0 AND win_probability <= 100),
  alignment INTEGER NOT NULL DEFAULT 0 CHECK (alignment >= 0 AND alignment <= 100),
  consensus INTEGER NOT NULL DEFAULT 0 CHECK (consensus >= 0 AND consensus <= 100),
  sentiment INTEGER NOT NULL DEFAULT 0 CHECK (sentiment >= 0 AND sentiment <= 100),
  has_risk BOOLEAN NOT NULL DEFAULT false,
  summary_text TEXT,
  summary_headline TEXT,
  summary_context TEXT,
  summary_action TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

-- Policy: All authenticated users can view deals
CREATE POLICY "Authenticated users can view deals" 
ON public.deals FOR SELECT 
TO authenticated 
USING (true);

-- Policy: Authenticated users can insert deals
CREATE POLICY "Authenticated users can insert deals" 
ON public.deals FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Policy: Authenticated users can update deals
CREATE POLICY "Authenticated users can update deals" 
ON public.deals FOR UPDATE 
TO authenticated 
USING (true);

-- Policy: Authenticated users can delete deals
CREATE POLICY "Authenticated users can delete deals" 
ON public.deals FOR DELETE 
TO authenticated 
USING (true);


-- ==================== STAKEHOLDERS TABLE ====================

CREATE TABLE public.stakeholders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT,
  status stakeholder_status NOT NULL DEFAULT 'neutral',
  alignment INTEGER NOT NULL DEFAULT 0 CHECK (alignment >= 0 AND alignment <= 100),
  consensus INTEGER NOT NULL DEFAULT 0 CHECK (consensus >= 0 AND consensus <= 100),
  sentiment INTEGER NOT NULL DEFAULT 0 CHECK (sentiment >= 0 AND sentiment <= 100),
  engagement_category engagement_category NOT NULL DEFAULT 'silent',
  -- Buyer value map
  cost_reduction INTEGER NOT NULL DEFAULT 0 CHECK (cost_reduction >= 0 AND cost_reduction <= 100),
  threat_mitigation INTEGER NOT NULL DEFAULT 0 CHECK (threat_mitigation >= 0 AND threat_mitigation <= 100),
  speed_to_value INTEGER NOT NULL DEFAULT 0 CHECK (speed_to_value >= 0 AND speed_to_value <= 100),
  -- Interests
  cost_interest BOOLEAN NOT NULL DEFAULT false,
  threat_interest BOOLEAN NOT NULL DEFAULT false,
  speed_interest BOOLEAN NOT NULL DEFAULT false,
  -- Summary and interaction
  summary TEXT,
  last_interaction_date DATE,
  last_interaction_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stakeholders ENABLE ROW LEVEL SECURITY;

-- Policies for stakeholders
CREATE POLICY "Authenticated users can view stakeholders" 
ON public.stakeholders FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert stakeholders" 
ON public.stakeholders FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update stakeholders" 
ON public.stakeholders FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete stakeholders" 
ON public.stakeholders FOR DELETE 
TO authenticated 
USING (true);


-- ==================== STAKEHOLDER TRENDS TABLE ====================

CREATE TABLE public.stakeholder_trends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stakeholder_id UUID NOT NULL REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  alignment INTEGER NOT NULL DEFAULT 0,
  priority INTEGER NOT NULL DEFAULT 0,
  relations INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stakeholder_trends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage stakeholder trends" 
ON public.stakeholder_trends FOR ALL 
TO authenticated 
USING (true);


-- ==================== ACTIONS TABLE ====================

CREATE TABLE public.actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artifact TEXT,
  based_on TEXT,
  priority action_priority NOT NULL DEFAULT 'medium',
  type action_type NOT NULL DEFAULT 'email',
  deadline DATE,
  status action_status NOT NULL DEFAULT 'pending',
  -- Email-specific fields
  email_subject TEXT,
  email_body TEXT,
  -- Meeting-specific fields
  meeting_agenda TEXT,
  meeting_duration_minutes INTEGER,
  -- Tracking
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view actions" 
ON public.actions FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert actions" 
ON public.actions FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update actions" 
ON public.actions FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete actions" 
ON public.actions FOR DELETE 
TO authenticated 
USING (true);


-- ==================== ACTION STAKEHOLDERS (Junction Table) ====================

CREATE TABLE public.action_stakeholders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_id UUID NOT NULL REFERENCES public.actions(id) ON DELETE CASCADE,
  stakeholder_id UUID NOT NULL REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(action_id, stakeholder_id)
);

-- Enable RLS
ALTER TABLE public.action_stakeholders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage action stakeholders" 
ON public.action_stakeholders FOR ALL 
TO authenticated 
USING (true);


-- ==================== SIGNALS TABLE ====================

CREATE TABLE public.signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  stakeholder_id UUID REFERENCES public.stakeholders(id) ON DELETE SET NULL,
  type signal_type NOT NULL DEFAULT 'signal',
  name TEXT NOT NULL,
  trigger TEXT NOT NULL,
  evidence TEXT,
  priority action_priority NOT NULL DEFAULT 'medium',
  sentiment stakeholder_status,
  confidence INTEGER NOT NULL DEFAULT 50 CHECK (confidence >= 0 AND confidence <= 100),
  suggested_action TEXT,
  channel TEXT,
  is_urgent BOOLEAN NOT NULL DEFAULT false,
  status signal_status NOT NULL DEFAULT 'pending',
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view signals" 
ON public.signals FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can insert signals" 
ON public.signals FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update signals" 
ON public.signals FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can delete signals" 
ON public.signals FOR DELETE 
TO authenticated 
USING (true);


-- ==================== SIGNAL GENERATED ACTIONS (Junction Table) ====================

CREATE TABLE public.signal_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  signal_id UUID NOT NULL REFERENCES public.signals(id) ON DELETE CASCADE,
  action_id UUID NOT NULL REFERENCES public.actions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(signal_id, action_id)
);

-- Enable RLS
ALTER TABLE public.signal_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage signal actions" 
ON public.signal_actions FOR ALL 
TO authenticated 
USING (true);


-- ==================== ACTIVITIES TABLE (Simulation Feed) ====================

CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  stakeholder_id UUID REFERENCES public.stakeholders(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  sentiment stakeholder_status NOT NULL DEFAULT 'neutral',
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage activities" 
ON public.activities FOR ALL 
TO authenticated 
USING (true);


-- ==================== CALENDAR EVENTS TABLE ====================

CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  company TEXT,
  event_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  type event_type NOT NULL DEFAULT 'meeting',
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage calendar events" 
ON public.calendar_events FOR ALL 
TO authenticated 
USING (true);


-- ==================== AI CHAT MESSAGES TABLE ====================

CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chat messages" 
ON public.chat_messages FOR SELECT 
TO authenticated 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own chat messages" 
ON public.chat_messages FOR INSERT 
TO authenticated 
WITH CHECK (user_id = auth.uid());


-- ==================== ATTACHMENTS TABLE ====================

CREATE TABLE public.attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_id UUID REFERENCES public.actions(id) ON DELETE CASCADE,
  signal_id UUID REFERENCES public.signals(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage attachments" 
ON public.attachments FOR ALL 
TO authenticated 
USING (true);


-- ==================== UPDATE TIMESTAMP FUNCTION ====================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;


-- ==================== TRIGGERS FOR updated_at ====================

CREATE TRIGGER update_deals_updated_at
  BEFORE UPDATE ON public.deals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stakeholders_updated_at
  BEFORE UPDATE ON public.stakeholders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_actions_updated_at
  BEFORE UPDATE ON public.actions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_signals_updated_at
  BEFORE UPDATE ON public.signals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();


-- ==================== INDEXES FOR PERFORMANCE ====================

CREATE INDEX idx_stakeholders_deal_id ON public.stakeholders(deal_id);
CREATE INDEX idx_stakeholder_trends_stakeholder_id ON public.stakeholder_trends(stakeholder_id);
CREATE INDEX idx_actions_deal_id ON public.actions(deal_id);
CREATE INDEX idx_actions_status ON public.actions(status);
CREATE INDEX idx_signals_deal_id ON public.signals(deal_id);
CREATE INDEX idx_signals_status ON public.signals(status);
CREATE INDEX idx_signals_type ON public.signals(type);
CREATE INDEX idx_activities_deal_id ON public.activities(deal_id);
CREATE INDEX idx_calendar_events_date ON public.calendar_events(event_date);
CREATE INDEX idx_chat_messages_user_id ON public.chat_messages(user_id);