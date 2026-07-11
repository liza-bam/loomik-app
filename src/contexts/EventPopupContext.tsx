import { createContext, useContext, useState, ReactNode } from "react";

export interface CalendarEvent {
  id: number;
  title: string;
  company: string;
  time: string;
  status: string;
  type: "call" | "meeting";
  date: Date;
  description?: string;
  location?: string;
}

interface EventPopupContextType {
  isOpen: boolean;
  event: CalendarEvent | null;
  openPopup: (event: CalendarEvent) => void;
  closePopup: () => void;
}

const EventPopupContext = createContext<EventPopupContextType | undefined>(undefined);

export const EventPopupProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [event, setEvent] = useState<CalendarEvent | null>(null);

  const openPopup = (event: CalendarEvent) => {
    setEvent(event);
    setIsOpen(true);
  };

  const closePopup = () => {
    setIsOpen(false);
  };

  return (
    <EventPopupContext.Provider value={{ isOpen, event, openPopup, closePopup }}>
      {children}
    </EventPopupContext.Provider>
  );
};

export const useEventPopup = () => {
  const context = useContext(EventPopupContext);
  if (context === undefined) {
    throw new Error("useEventPopup must be used within an EventPopupProvider");
  }
  return context;
};
