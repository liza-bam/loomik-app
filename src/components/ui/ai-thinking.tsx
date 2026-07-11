import { cn } from "@/lib/utils";

interface AIThinkingProps {
  message?: string;
  className?: string;
  variant?: 'default' | 'inline' | 'minimal';
}

export function AIThinking({ 
  message = "Loomik is analyzing...", 
  className,
  variant = 'default' 
}: AIThinkingProps) {
  if (variant === 'minimal') {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-lg bg-muted/50", className)}>
      <div className="w-8 h-8 bg-gradient-to-br from-purple to-primary rounded-lg flex items-center justify-center flex-shrink-0">
        <svg 
          width="14" 
          height="14" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="animate-pulse"
        >
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="white"/>
          <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{message}</span>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
