import { createContext, useContext, useState, ReactNode } from "react";
import type { Stakeholder } from "@/data/dealData";

interface StakeholderPopupContextType {
  isOpen: boolean;
  stakeholder: Stakeholder | null;
  openPopup: (stakeholder: Stakeholder) => void;
  closePopup: () => void;
}

const StakeholderPopupContext = createContext<StakeholderPopupContextType | undefined>(undefined);

export const StakeholderPopupProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stakeholder, setStakeholder] = useState<Stakeholder | null>(null);

  const openPopup = (stakeholder: Stakeholder) => {
    setStakeholder(stakeholder);
    setIsOpen(true);
  };

  const closePopup = () => {
    setIsOpen(false);
  };

  return (
    <StakeholderPopupContext.Provider value={{ isOpen, stakeholder, openPopup, closePopup }}>
      {children}
    </StakeholderPopupContext.Provider>
  );
};

export const useStakeholderPopup = () => {
  const context = useContext(StakeholderPopupContext);
  if (context === undefined) {
    throw new Error("useStakeholderPopup must be used within a StakeholderPopupProvider");
  }
  return context;
};
