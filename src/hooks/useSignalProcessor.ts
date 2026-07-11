// Hook for processing signals and risks into actions
import { useCallback } from "react";
import { useSignalsStore, DetectedSignal } from "@/stores/signalsStore";
import { useGeneratedActionsStore } from "@/stores/generatedActionsStore";
import { generateActionsFromSignal, calculateScoreImpact } from "@/data/signalsData";

interface ProcessingResult {
  actionsAdded: number;
  actionsModified: number;
  probabilityChange: number;
  alignmentChange: number;
  actions: ReturnType<typeof generateActionsFromSignal>;
}

export const useSignalProcessor = () => {
  const { processSignal, processAllSignals, getPendingRisks, getPendingSignals } = useSignalsStore();
  const { addActions, setLastResult } = useGeneratedActionsStore();
  
  // Process a single signal/risk and generate actions
  const processSignalWithActions = useCallback((signalOrRisk: DetectedSignal): ProcessingResult => {
    // Generate actions from the signal
    const generatedActions = generateActionsFromSignal(signalOrRisk);
    const scoreImpact = calculateScoreImpact(signalOrRisk);
    
    // Add actions to store
    const createdActions = addActions(generatedActions);
    
    // Mark signal as processed with action IDs
    const actionIds = createdActions.map(a => a.id);
    processSignal(signalOrRisk.id, actionIds);
    
    // Calculate simulated modifications (existing actions that would be updated)
    const modificationsCount = Math.floor(Math.random() * 4) + 2; // 2-5 modifications
    
    const result: ProcessingResult = {
      actionsAdded: createdActions.length,
      actionsModified: modificationsCount,
      probabilityChange: scoreImpact.winProbability,
      alignmentChange: scoreImpact.alignment,
      actions: generatedActions,
    };
    
    // Store result for confirmation dialog
    setLastResult({
      ...result,
      actions: createdActions,
    });
    
    return result;
  }, [processSignal, addActions, setLastResult]);
  
  // Process all signals/risks of a type
  const processAllWithActions = useCallback((type: "signal" | "risk"): ProcessingResult => {
    const items = type === "risk" ? getPendingRisks() : getPendingSignals();
    
    let totalActionsAdded = 0;
    let totalModifications = 0;
    let totalProbChange = 0;
    let totalAlignChange = 0;
    const allGeneratedActions: ReturnType<typeof generateActionsFromSignal> = [];
    
    items.forEach(item => {
      const generatedActions = generateActionsFromSignal(item);
      const scoreImpact = calculateScoreImpact(item);
      
      const createdActions = addActions(generatedActions);
      const actionIds = createdActions.map(a => a.id);
      processSignal(item.id, actionIds);
      
      totalActionsAdded += createdActions.length;
      totalModifications += Math.floor(Math.random() * 3) + 1;
      totalProbChange += scoreImpact.winProbability;
      totalAlignChange += scoreImpact.alignment;
      allGeneratedActions.push(...generatedActions);
    });
    
    // Cap the probability changes at reasonable levels
    const cappedProbChange = Math.min(totalProbChange, 8);
    const cappedAlignChange = Math.min(totalAlignChange, 6);
    
    const result: ProcessingResult = {
      actionsAdded: totalActionsAdded,
      actionsModified: totalModifications,
      probabilityChange: cappedProbChange,
      alignmentChange: cappedAlignChange,
      actions: allGeneratedActions,
    };
    
    setLastResult({
      actionsAdded: totalActionsAdded,
      actionsModified: totalModifications,
      probabilityChange: cappedProbChange,
      alignmentChange: cappedAlignChange,
      actions: addActions(allGeneratedActions),
    });
    
    return result;
  }, [getPendingRisks, getPendingSignals, addActions, processSignal, setLastResult]);
  
  return {
    processSignalWithActions,
    processAllWithActions,
  };
};
