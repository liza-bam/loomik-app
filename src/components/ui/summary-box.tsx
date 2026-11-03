import { ReactNode } from "react";

interface SummaryBoxProps {
  children: ReactNode;
  className?: string;
}

export const SummaryBox = ({ children, className = "" }: SummaryBoxProps) => {
  return (
    <div className={`bg-muted/50 border border-border rounded-lg p-4 ${className}`}>
      <div className="text-base text-muted-foreground leading-relaxed">
        {children}
      </div>
    </div>
  );
};

export default SummaryBox;
