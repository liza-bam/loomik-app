// Component to initialize signals store with seed data on first load
import { useEffect, useRef } from "react";
import { useSignalsStore } from "@/stores/signalsStore";
import { initializeSignals } from "@/data/signalsData";

// Increment this version when seed data changes to force re-initialization
const SEED_DATA_VERSION = 2;
const SEED_VERSION_KEY = 'loomik-signals-seed-version';

export const SignalsInitializer = () => {
  const hasInitialized = useRef(false);
  const { signals, addSignal, resetStore } = useSignalsStore();
  
  useEffect(() => {
    // Only initialize once per component mount
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    // Check if seed data version has changed
    const storedVersion = localStorage.getItem(SEED_VERSION_KEY);
    const needsReset = storedVersion !== String(SEED_DATA_VERSION);
    
    // Reset store if version changed or if store is empty
    if (needsReset) {
      resetStore();
      localStorage.setItem(SEED_VERSION_KEY, String(SEED_DATA_VERSION));
    }
    
    // Only seed if store is empty (after potential reset)
    if (needsReset || signals.length === 0) {
      const seedSignals = initializeSignals();
      seedSignals.forEach(signal => {
        addSignal({
          type: signal.type,
          name: signal.name,
          trigger: signal.trigger,
          evidence: signal.evidence,
          dealId: signal.dealId,
          dealName: signal.dealName,
          stakeholder: signal.stakeholder,
          priority: signal.priority,
          sentiment: signal.sentiment,
          confidence: signal.confidence,
          suggestedAction: signal.suggestedAction,
          channel: signal.channel,
          isUrgent: signal.isUrgent,
          severity: signal.severity,
          eventCategory: signal.eventCategory,
        });
      });
    }
  }, [signals.length, addSignal, resetStore]);
  
  return null;
};
