import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useEventPopup } from "@/contexts/EventPopupContext";
import EventDetailPanel from "./EventDetailPanel";

/** The calendar event detail as a dialog (bottom sheet on phones). Same content as the Calendar page panel. */
export const EventDetailPopup = () => {
  const { isOpen, event, closePopup } = useEventPopup();

  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closePopup()}>
      <DialogContent className="max-w-2xl max-h-popup flex flex-col gap-0 p-0 overflow-hidden">
        <DialogTitle className="sr-only">{event.title}</DialogTitle>
        <EventDetailPanel event={event} />
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailPopup;
