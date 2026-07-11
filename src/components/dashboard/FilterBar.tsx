import { ReactNode } from "react";

interface FilterBarProps {
  children: ReactNode;
  className?: string;
}

/**
 * A consistent filter bar container used across all pages.
 * Provides unified styling for filter controls.
 */
const FilterBar = ({ children, className = "" }: FilterBarProps) => {
  return (
    <div className={`flex items-center justify-between p-4 border-b border-border ${className}`}>
      {children}
    </div>
  );
};

interface FilterBarLeftProps {
  children: ReactNode;
  className?: string;
}

/**
 * Left section of the filter bar for primary filters.
 */
const FilterBarLeft = ({ children, className = "" }: FilterBarLeftProps) => {
  return (
    <div className={`flex items-center gap-2 sm:gap-3 flex-nowrap ${className}`}>
      {children}
    </div>
  );
};

interface FilterBarRightProps {
  children: ReactNode;
  className?: string;
}

/**
 * Right section of the filter bar for secondary controls (sort, view toggle, etc).
 */
const FilterBarRight = ({ children, className = "" }: FilterBarRightProps) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {children}
    </div>
  );
};

export { FilterBar, FilterBarLeft, FilterBarRight };
