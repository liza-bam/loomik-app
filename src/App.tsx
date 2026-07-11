import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ActionHub from "./pages/ActionHub";
import History from "./pages/History";
import DealGPS from "./pages/DealGPS";
import Calendar from "./pages/Calendar";
import Assets from "./pages/Assets";
import NotFound from "./pages/NotFound";
import { SimulationInitializer } from "./components/SimulationInitializer";
import { SimulationControls } from "./components/dashboard/SimulationControls";
import { StakeholderPopupProvider } from "./contexts/StakeholderPopupContext";
import { StakeholderPopup } from "./components/stakeholder/StakeholderPopup";
import { EventPopupProvider } from "./contexts/EventPopupContext";
import { EventDetailPopup } from "./components/calendar/EventDetailPopup";
import { SignalsInitializer } from "./components/SignalsInitializer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <StakeholderPopupProvider>
        <EventPopupProvider>
          <Toaster />
          <Sonner />
          <SimulationInitializer />
          <SignalsInitializer />
          <StakeholderPopup />
          <EventDetailPopup />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/action-hub" element={<ActionHub />} />
              <Route path="/history" element={<History />} />
              <Route path="/deal-gps" element={<DealGPS />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/assets" element={<Assets />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <SimulationControls />
          </BrowserRouter>
        </EventPopupProvider>
      </StakeholderPopupProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
