import { useState, useCallback, useRef } from 'react';
import { deals, getAllActions, getCompanyById } from '@/data/dealData';
import { useSignalsStore } from '@/stores/signalsStore';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Canned replies used to simulate a streaming AI response. Chosen based on
// keywords in the user's message so answers still feel contextual.
const CANNED_REPLIES: Array<{ match: RegExp; reply: string }> = [
  {
    match: /risk|blocker|concern|worried|red flag/i,
    reply:
      "Looking at your active pipeline, the biggest risk right now is TechFlow Solutions — a key stakeholder has gone quiet for 11 days and the alignment score dropped 8 points this week. I'd prioritize a low-pressure re-engagement touch: send the ROI one-pager the CFO asked for last month and offer three 15-minute slots. Two secondary risks to watch: procurement stall on CloudScale (mitigate by looping in Legal early) and a shifting champion at RetailMax (validate with a discovery call).",
  },
  {
    match: /action|next step|do next|todo|priority/i,
    reply:
      "Your top three actions today, ranked by expected win-probability lift:\n\n1. **Send the ROI summary to Sarah Chen at CloudScale** — she flagged budget concerns; a concrete payback story will unblock the align stage.\n2. **Book a working session with the RetailMax buying committee** — three stakeholders are still 'neutral'; a group review of the pilot results should shift at least two.\n3. **Follow up on the SecureBank Holdings NDA** — the deal has been in validate for 14 days; a nudge on paperwork keeps momentum without pressuring.\n\nWant me to draft the first email?",
  },
  {
    match: /forecast|revenue|value|pipeline|close/i,
    reply:
      "Current pipeline: **$8.0M across 7 active deals**. Weighted forecast for this quarter is $4.6M — the two biggest levers are CloudScale ($1.8M, 62% probability) and SecureBank Holdings ($2.1M, 55% probability). Best-case close if both land: $5.2M. To move the needle, focus on getting SecureBank past validate this week — every day in that stage costs about 2 points of probability.",
  },
  {
    match: /stakeholder|champion|contact|buyer|decision maker/i,
    reply:
      "Across your deals, you have strong alignment with 4 champions but three critical decision-makers are still in 'neutral' territory. Priority to convert: the VP of Finance at CloudScale (blocks the deal but hasn't been engaged in 3 weeks) and the CTO at SecureBank (currently 'silent' — needs a technical deep-dive). I'd draft a peer-introduction from your existing champion to warm up the finance conversation before you reach out directly.",
  },
];

const DEFAULT_REPLY =
  "Based on what I'm seeing across your pipeline, alignment is trending up 5 points week-over-week — that's a good signal that your recent multi-threading is working. Win probability dipped 3 points because two neutral stakeholders on CloudScale have gone quiet. I'd focus this week on re-engaging them with a value-focused touch (case study, ROI model) rather than a status check. Want me to help draft the outreach?";

const pickReply = (input: string): string => {
  const match = CANNED_REPLIES.find(({ match }) => match.test(input));
  return match?.reply ?? DEFAULT_REPLY;
};

// Split a reply into small chunks so the response streams word-by-word.
const chunkReply = (reply: string): string[] => {
  const tokens: string[] = [];
  const words = reply.split(/(\s+)/);
  for (const word of words) {
    if (word.length === 0) continue;
    tokens.push(word);
  }
  return tokens;
};

export function useAIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { getPendingRisks, getPendingSignals } = useSignalsStore();

  // Not sent anywhere anymore, but kept because the panel UI reads deal state
  // via this hook to render "AI is aware of…" hints.
  const buildDealContext = useCallback(() => {
    const pendingRisks = getPendingRisks();
    const pendingSignals = getPendingSignals();
    const allActions = getAllActions();

    return {
      deals: deals.map(d => ({
        company: getCompanyById(d.companyId)?.name || d.name,
        value: d.value,
        stage: d.stage,
        winProbability: d.winProbability,
        hasRisk: d.hasRisk,
        closeDate: d.closeDate,
      })),
      signals: pendingSignals.slice(0, 10).map(s => ({
        type: s.type,
        trigger: s.trigger,
        dealName: s.dealName,
        confidence: s.confidence,
      })),
      risks: pendingRisks.slice(0, 10).map(r => ({
        name: r.name,
        priority: r.priority,
        trigger: r.trigger,
        dealName: r.dealName,
      })),
      actions: allActions.slice(0, 10).map(a => ({
        title: a.title,
        priority: a.priority,
        deadline: a.deadline,
        dealName: (() => { const d = deals.find(d => d.id === a.dealId); return d ? (getCompanyById(d.companyId)?.name || d.name) : 'Unknown'; })(),
      })),
    };
  }, [getPendingRisks, getPendingSignals]);

  const sendMessage = useCallback(async (input: string) => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const reply = pickReply(userMessage.content);
    const chunks = chunkReply(reply);

    let assistantContent = '';
    const appendChunk = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
        }
        return [...prev, { role: 'assistant', content: assistantContent }];
      });
    };

    const wait = (ms: number) =>
      new Promise<void>((resolve, reject) => {
        const timer = setTimeout(resolve, ms);
        signal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new DOMException('Aborted', 'AbortError'));
        }, { once: true });
      });

    try {
      // Small startup delay so the "thinking" state is visible.
      await wait(280);
      for (const chunk of chunks) {
        await wait(24);
        appendChunk(chunk);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [isLoading, buildDealContext]);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    cancelRequest,
    clearMessages,
  };
}
