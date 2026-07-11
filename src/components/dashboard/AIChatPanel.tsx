import { useState, useRef, useEffect } from "react";
import { Send, Mic, Square, Copy, Check, ThumbsUp, ThumbsDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAIChat } from "@/hooks/useAIChat";
import { AIThinking } from "@/components/ui/ai-thinking";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { CalendarEvent } from "@/contexts/EventPopupContext";

interface AIChatPanelProps {
  hideHeader?: boolean;
  selectedEvent?: CalendarEvent | null;
}

const AIChatPanel = ({ hideHeader = false, selectedEvent }: AIChatPanelProps) => {
  const [inputValue, setInputValue] = useState("");
  const [lastPrepEventId, setLastPrepEventId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<Record<number, 'up' | 'down' | null>>({});
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading, sendMessage, cancelRequest, clearMessages } = useAIChat();

  // Get assistant messages for copying
  const assistantMessages = messages.filter(m => m.role === 'assistant');
  const hasPrepNotes = selectedEvent && assistantMessages.length > 0;

  const handleCopyPrepNotes = async () => {
    const prepContent = assistantMessages.map(m => m.content).join('\n\n');
    try {
      await navigator.clipboard.writeText(prepContent);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Meeting prep notes copied successfully",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleCopyMessage = async (content: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(idx);
      toast({
        title: "Copied to clipboard",
        description: "Message copied successfully",
      });
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleFeedback = (idx: number, type: 'up' | 'down') => {
    setFeedbackGiven(prev => ({
      ...prev,
      [idx]: prev[idx] === type ? null : type
    }));
    toast({
      title: type === 'up' ? "Thanks for the feedback!" : "We'll do better",
      description: type === 'up' ? "Glad this was helpful" : "We'll improve our responses",
    });
  };

  const suggestedActions = [
    "What are today's most risky deals?",
    "Show me case studies for uptime",
    "Analyze the Salesforce deal",
  ];

  // Auto-trigger meeting prep when event is selected
  useEffect(() => {
    if (selectedEvent && selectedEvent.id !== lastPrepEventId && !isLoading) {
      setLastPrepEventId(selectedEvent.id);
      clearMessages();
      const prepPrompt = `I'm about to join a ${selectedEvent.type} with ${selectedEvent.company}: "${selectedEvent.title}" scheduled for ${selectedEvent.time}. 

Please help me prepare by:
1. Summarizing key context about this deal and stakeholders
2. Suggesting 3-5 key talking points or questions I should raise
3. Identifying any risks or concerns I should address
4. Recommending actions to take after the call

Keep it concise and actionable.`;
      sendMessage(prepPrompt);
    }
  }, [selectedEvent, lastPrepEventId, isLoading, sendMessage, clearMessages]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="h-full flex flex-col">
      {!hideHeader && (
        <div className="px-4 py-1 border-b border-border bg-white flex-shrink-0">
          <div className="flex items-center gap-2">
            <img src="/assets/loomik-icon.svg" alt="Loomik" className="h-5 w-auto" />
            <div className="w-2 h-2 bg-green rounded-full" />
          </div>
        </div>
      )}

      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        {messages.length === 0 ? (
          <>
            {/* Welcome Message */}
            <div className="mb-4">
              <div className="flex-1">
                <div className="bg-purple/10 rounded-lg p-3">
                  <p className="text-base text-foreground">
                    Good morning! I'm analyzing your pipeline in real-time. Ask me about deals, risks, or strategies.
                  </p>
                </div>
                <span className="text-xs text-muted-foreground mt-1 block">Just now</span>
              </div>
            </div>

            {/* Suggested Actions */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Suggested</p>
              {suggestedActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(action)}
                  className="w-full text-left px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-base text-foreground transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[90%] rounded-lg p-3 ${
                  msg.role === 'user' 
                    ? 'bg-[hsl(262,80%,20%)] text-white' 
                    : 'bg-purple/10 text-foreground'
                }`}>
                  <p className="text-base whitespace-pre-wrap">{msg.content}</p>
                </div>
                
                {/* Action buttons for AI messages */}
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <button
                      onClick={() => handleCopyMessage(msg.content, idx)}
                      className="p-1.5 rounded hover:bg-muted transition-colors group"
                      title="Copy message"
                    >
                      {copiedMessageId === idx ? (
                        <Check className="w-3.5 h-3.5 text-green" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground" />
                      )}
                    </button>
                    <button
                      onClick={() => handleFeedback(idx, 'up')}
                      className={`p-1.5 rounded hover:bg-muted transition-colors group ${feedbackGiven[idx] === 'up' ? 'bg-green/10' : ''}`}
                      title="Good response"
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${feedbackGiven[idx] === 'up' ? 'text-green fill-green' : 'text-muted-foreground group-hover:text-foreground'}`} />
                    </button>
                    <button
                      onClick={() => handleFeedback(idx, 'down')}
                      className={`p-1.5 rounded hover:bg-muted transition-colors group ${feedbackGiven[idx] === 'down' ? 'bg-red/10' : ''}`}
                      title="Poor response"
                    >
                      <ThumbsDown className={`w-3.5 h-3.5 ${feedbackGiven[idx] === 'down' ? 'text-red fill-red' : 'text-muted-foreground group-hover:text-foreground'}`} />
                    </button>
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <AIThinking variant="inline" message="Thinking..." />
            )}
          </div>
        )}
      </ScrollArea>

      <div className="p-4 border-t border-border bg-card flex-shrink-0 space-y-3">
        {/* Copy Prep Notes Button - shown when in meeting prep mode */}
        {hasPrepNotes && !isLoading && (
          <Button
            onClick={handleCopyPrepNotes}
            variant="outline"
            size="sm"
            className="w-full border-purple text-purple bg-white hover:!bg-gradient-to-r hover:!from-purple hover:!to-orange-500 hover:!text-white hover:!border-transparent gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Prep Notes
              </>
            )}
          </Button>
        )}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Loomik anything..."
              className="pr-10 bg-muted border-0"
              disabled={isLoading}
            />
          </div>
          {isLoading ? (
            <button 
              onClick={cancelRequest}
              className="w-10 h-10 bg-red text-white rounded-lg flex items-center justify-center hover:bg-red/90 transition-colors"
            >
              <Square className="w-4 h-4" />
            </button>
          ) : (
            <button 
              onClick={handleSend}
              disabled={!inputValue.trim()}
              className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
          <button className="w-10 h-10 bg-muted text-muted-foreground rounded-lg flex items-center justify-center hover:bg-muted/80 transition-colors">
            <Mic className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatPanel;
