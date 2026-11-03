import { useState } from "react";
import { useUIStore } from "@/stores/uiStore";
import { useIsTablet, useIsMobile } from "@/hooks/use-mobile";
import { ChevronLeft, ChevronRight, Plus, Phone, Video, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/dashboard/Header";
import TabNavigation from "@/components/dashboard/TabNavigation";
import AIChatPanel from "@/components/dashboard/AIChatPanel";
import MobileBottomNav from "@/components/MobileBottomNav";
import EventDetailPanel from "@/components/calendar/EventDetailPanel";
import { getAllDealNames, deals, getCompanyById } from "@/data/dealData";
import { calendarEvents, getEventsForDate as getEventsForDateHelper, hasEventsOnDate as hasEventsOnDateHelper } from "@/data/calendarEvents";
import type { CalendarEvent } from "@/contexts/EventPopupContext";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 21)); // January 21, 2026
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 0, 21));
  const { isAIPanelOpen, toggleAIPanel } = useUIStore();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const isTablet = useIsTablet();
  const isMobile = useIsMobile();
  
  const dealNames = getAllDealNames();
  const [selectedDeals, setSelectedDeals] = useState<string[]>(dealNames);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];

  // Get calendar grid data
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    const days: { date: number; isCurrentMonth: boolean; fullDate: Date }[] = [];
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, prevMonthLastDay - i),
      });
    }
    
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        fullDate: new Date(year, month, i),
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, i),
      });
    }
    
    return days;
  };

  const hasEventsOnDate = (date: Date) => {
    return hasEventsOnDateHelper(date, selectedDeals);
  };

  const getEventsForDate = (date: Date) => {
    return getEventsForDateHelper(date, selectedDeals);
  };

  const toggleDeal = (dealName: string) => {
    setSelectedDeals((prev) =>
      prev.includes(dealName)
        ? prev.filter((d) => d !== dealName)
        : [...prev, dealName]
    );
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateDay = (direction: "prev" | "next") => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setDate(newDate.getDate() - 1);
      } else {
        newDate.setDate(newDate.getDate() + 1);
      }
      // Update currentDate if we navigate to a different month
      if (newDate.getMonth() !== currentDate.getMonth()) {
        setCurrentDate(newDate);
      }
      return newDate;
    });
  };

  const calendarDays = getCalendarDays();
  const selectedDateEvents = getEventsForDate(selectedDate);

  const isToday = (date: Date) => {
    const today = new Date(2026, 0, 21); // Mock "today"
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleEventClick = (event: typeof calendarEvents[0]) => {
    setSelectedEvent(event as CalendarEvent);
  };

  const handleCloseEventDetail = () => {
    setSelectedEvent(null);
  };

  // Check if we're in "Call Prep Mode" (event selected)
  const isCallPrepMode = selectedEvent !== null;

  // Tablet compact mode: hide calendar grid and filters when AI panel is open
  const isTabletCompact = isTablet && isAIPanelOpen;
  // Mobile compact mode: same as tablet compact
  const isCompactMode = isTabletCompact || isMobile;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Header isScrolled={false} />
      
      {/* Tab Navigation + AI Header */}
      <div className="flex border-b border-border bg-card">
        <div className="flex-1">
          <TabNavigation isScrolled={false} activeTab="Calendar" />
        </div>
        
        {/* AI Header - collapsible toggle - ONLY tablet/desktop */}
        {!isMobile && (
          <div className={`flex items-center gap-2 px-2 md:px-4 border-l border-border transition-all duration-200 ${isAIPanelOpen ? "w-64 md:w-80" : "w-10 md:w-12"}`}>
            {isAIPanelOpen && (
              <>
                <img src="/assets/loomik-icon.svg" alt="Loomik" className="h-4 md:h-5 w-auto" />
                <div className="w-2 h-2 bg-success rounded-full" />
              </>
            )}
            <button 
              onClick={toggleAIPanel}
              className="ml-auto p-1 hover:bg-muted rounded transition-colors"
            >
              {isAIPanelOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      <div className={`flex flex-1 overflow-hidden ${isMobile ? 'pb-16' : ''}`}>
        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Column 1: Calendar & Filters - Hidden in prep mode OR tablet/mobile compact mode */}
          {!isCompactMode && !isCallPrepMode && (
            <div className="w-[380px] border-r border-border overflow-y-auto">
              <div className="p-6 pb-0">
                <Card className="p-4 mb-6">
                  {/* Month Navigation */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => navigateMonth("prev")}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <h2 className="text-base font-semibold text-foreground">
                      {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <button
                      onClick={() => navigateMonth("next")}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Days of Week */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {daysOfWeek.map((day, i) => (
                      <div
                        key={i}
                        className="text-center text-sm font-medium text-muted-foreground py-2"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, i) => (
                      <button
                        key={i}
                        onClick={() => day.isCurrentMonth && setSelectedDate(day.fullDate)}
                        className={`
                          relative h-10 rounded-lg text-sm font-medium transition-all
                          ${!day.isCurrentMonth ? "text-muted-foreground/40" : "text-foreground"}
                          ${isSelected(day.fullDate) ? "bg-primary text-primary-foreground" : "hover:bg-muted"}
                          ${isToday(day.fullDate) && !isSelected(day.fullDate) ? "ring-2 ring-primary ring-inset" : ""}
                        `}
                        disabled={!day.isCurrentMonth}
                      >
                        {day.date}
                        {hasEventsOnDate(day.fullDate) && !isSelected(day.fullDate) && (
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </Card>

                {/* Deal Filters */}
                <div className="pb-20">
                  <h3 className="text-sm font-medium text-foreground mb-3">Filter by Deal</h3>
                  <div className="space-y-2">
                    {dealNames.map((dealName) => {
                      const isChecked = selectedDeals.includes(dealName);
                      return (
                        <label
                          key={dealName}
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <div className="relative flex items-center justify-center">
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => toggleDeal(dealName)}
                              className="h-5 w-5 rounded border-2 border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                          </div>
                          <span className={`text-sm font-medium ${isChecked ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {dealName}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Column 2: Event Details (LEFT in prep mode) OR Full Event List */}
          <div className={`overflow-hidden transition-all duration-300 ${
            isCallPrepMode ? "flex-1 order-first" : "flex-1"
          }`}>
            {isCallPrepMode ? (
              /* Event Detail Panel - Now on the LEFT */
              <EventDetailPanel 
                event={selectedEvent} 
                onClose={handleCloseEventDetail} 
              />
            ) : (
            /* Normal View: Events List */
              <div className="p-6 overflow-y-auto h-full">
                {/* Header with day navigation for tablet/mobile compact mode */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    {isCompactMode && (
                      <button
                        onClick={() => navigateDay("prev")}
                        className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    )}
                    <h2 className={`font-semibold text-foreground ${isCompactMode ? "text-base" : "text-lg"}`}>
                      {selectedDate.toLocaleDateString("en-US", {
                        weekday: isCompactMode ? "short" : "long",
                        month: isCompactMode ? "short" : "long",
                        day: "numeric",
                        year: isCompactMode ? undefined : "numeric",
                      })}
                    </h2>
                    {isCompactMode && (
                      <button
                        onClick={() => navigateDay("next")}
                        className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <Button size="icon" className="w-9 h-9">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Events */}
                <div className="space-y-3">
                  {selectedDateEvents.length === 0 ? (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground">No events scheduled for this date</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Select a different date or add a new event
                      </p>
                    </Card>
                  ) : (
                    selectedDateEvents.map((event, index) => {
                      // First event shows "in 15 min" with green pill
                      const isFirstEvent = index === 0;
                      const statusText = isFirstEvent ? "in 15 min" : event.status;
                      const isCompleted = !isFirstEvent && event.status === "completed";
                      const statusClass = isFirstEvent 
                        ? "bg-success-subtle text-success" 
                        : "bg-muted text-muted-foreground";
                      
                      return (
                        <Card 
                          key={event.id} 
                          className="p-4 interactive-card"
                          onClick={() => handleEventClick(event)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`w-2.5 h-2.5 rounded-full mt-2 ${
                                event.type === "call" ? "bg-muted-foreground" : "bg-primary"
                              }`} />
                              <div>
                                <h3 className="text-base font-semibold text-foreground">
                                  {event.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">{event.company}</p>
                                <p className="text-sm text-muted-foreground">{event.time}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge
                                variant="outline"
                                className={`border-transparent whitespace-nowrap ${statusClass}`}
                              >
                                {isFirstEvent && (
                                  <span className="h-1.5 w-1.5 mr-1.5 rounded-full bg-success" />
                                )}
                                {statusText}
                              </Badge>
                              {isCompleted && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEventClick(event);
                                  }}
                                  className="gap-1.5 text-muted-foreground"
                                >
                                  <Play className="w-3.5 h-3.5" />
                                  Recording
                                </Button>
                              )}
                              {!isCompleted && event.type === "call" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log("Starting call:", event.id);
                                  }}
                                  className="gap-1.5"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                  Call
                                </Button>
                              )}
                              {!isCompleted && event.type === "meeting" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log("Joining meeting:", event.id);
                                  }}
                                  className="gap-1.5"
                                >
                                  <Video className="w-3.5 h-3.5" />
                                  Join
                                </Button>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Column 3: Compact Event List (CENTER in prep mode) */}
          {isCallPrepMode && (
            <div className="w-[280px] border-l border-r border-border overflow-y-auto">
              <div className="p-4">
                {/* Header with back button */}
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={handleCloseEventDetail}
                    className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h2 className="text-sm font-semibold text-foreground">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </h2>
                </div>

                {/* Compact Event List */}
                <div className="space-y-2">
                  {selectedDateEvents.map((event) => (
                    <div 
                      key={event.id} 
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedEvent?.id === event.id 
                          ? "bg-primary-subtle border border-primary/30" 
                          : "hover:bg-muted border border-transparent"
                      }`}
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          event.type === "call" ? "bg-muted-foreground" : "bg-primary"
                        }`} />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {event.title}
                          </p>
                          <p className="text-xs text-muted-foreground">{event.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Chat Sidebar - ONLY tablet/desktop */}
        {!isMobile && (
          <aside className={`border-l border-border bg-card flex flex-col overflow-hidden transition-all duration-200 ${isAIPanelOpen ? "w-64 md:w-80" : "w-0"}`}>
            {isAIPanelOpen && <AIChatPanel hideHeader selectedEvent={selectedEvent} />}
          </aside>
        )}
      </div>

      {/* Bottom Nav + AI Sheet - ONLY mobile */}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default Calendar;
