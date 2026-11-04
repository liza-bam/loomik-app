import { useState } from "react";
import { ChevronRight, FileText, Users, Mail, Video, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import ActionEmailDialog from "./ActionEmailDialog";
import ActionMeetingDialog from "./ActionMeetingDialog";
import StakeholderCard from "@/components/stakeholder/StakeholderCard";
import SummaryBox from "@/components/ui/summary-box";
import {
  getDealById,
  getStakeholdersForDeal,
  getActionsForDeal,
  getStakeholderById,
  type Action,
} from "@/data/dealData";
import { priorityDot } from "@/lib/tone";

interface DealExpandedRowProps {
  dealId: number;
  company: string;
  hasRisk: boolean;
}

// Transform action data for display
interface DisplayAction {
  id: number;
  stakeholderName: string;
  stakeholderRole: string;
  artifact: string;
  basedOn: string;
  priority: "high" | "medium" | "low";
  type: "email" | "meeting";
}

const DealExpandedRow = ({ dealId, company, hasRisk }: DealExpandedRowProps) => {
  const navigate = useNavigate();
  const deal = getDealById(dealId);
  const stakeholders = getStakeholdersForDeal(dealId);
  const dealActions = getActionsForDeal(dealId);
  
  // Transform actions for display
  const displayActions: DisplayAction[] = dealActions.map(action => {
    const primaryStakeholder = action.stakeholderIds[0] ? getStakeholderById(action.stakeholderIds[0]) : null;
    return {
      id: action.id,
      stakeholderName: primaryStakeholder?.name || "Unknown",
      stakeholderRole: primaryStakeholder?.role || "Unknown",
      artifact: action.artifact,
      basedOn: action.basedOn,
      priority: action.priority,
      type: action.type,
    };
  });

  const priorityActions = hasRisk ? displayActions.filter(a => a.priority === "high") : [];
  
  const [selectedAction, setSelectedAction] = useState<DisplayAction | null>(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);

  const handleViewAllActions = () => {
    const dealName = deal?.name || "";
    navigate(`/action-hub?deal=${encodeURIComponent(dealName)}`);
  };

  const handleGoToAction = (action: DisplayAction) => {
    setSelectedAction(action);
    if (action.type === "email") {
      setEmailDialogOpen(true);
    } else {
      setMeetingDialogOpen(true);
    }
  };

  const handleNextAction = () => {
    if (!selectedAction) return;
    
    const currentIndex = priorityActions.findIndex(a => a.id === selectedAction.id);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < priorityActions.length) {
      const nextAction = priorityActions[nextIndex];
      setSelectedAction(nextAction);
      
      setEmailDialogOpen(false);
      setMeetingDialogOpen(false);
      
      setTimeout(() => {
        if (nextAction.type === "email") {
          setEmailDialogOpen(true);
        } else {
          setMeetingDialogOpen(true);
        }
      }, 100);
    }
  };

  const hasNextAction = () => {
    if (!selectedAction) return false;
    const currentIndex = priorityActions.findIndex(a => a.id === selectedAction.id);
    return currentIndex < priorityActions.length - 1;
  };

  return (
    <TooltipProvider>
      <div className="bg-muted/30 p-6 space-y-6">
        {/* Summary */}
        <SummaryBox>
          {deal?.summary.text || "No summary available."}
        </SummaryBox>

        {/* Priority Actions */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <h4 className="font-semibold text-foreground">Priority Actions</h4>
          </div>
          
          {priorityActions.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {priorityActions.map((action) => {
                const ActionIcon = action.type === "email" ? Mail : Video;
                
                return (
                  <div
                    key={action.id}
                    className="group relative bg-card border border-border rounded-lg p-4 space-y-3 w-fit max-w-sm interactive-card cursor-pointer"
                    onClick={() => handleGoToAction(action)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-subtle flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110">
                        <ActionIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="flex items-center gap-1.5 font-medium text-foreground">
                          {action.stakeholderName}
                          <span className={`w-1.5 h-1.5 rounded-full ${priorityDot(action.priority)}`} title={`${action.priority} priority`} />
                        </p>
                        <p className="text-sm text-muted-foreground">{action.stakeholderRole}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{action.artifact}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Based on: {action.basedOn}</p>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => { e.stopPropagation(); handleGoToAction(action); }}
                    >
                      Go to Action
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                );
              })}
              <Button 
                size="sm" 
                className="self-center"
                onClick={handleViewAllActions}
              >
                <Zap className="w-4 h-4" />
                Actions
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3 py-2">
              <p className="text-sm text-muted-foreground/60 italic">No priority actions for this deal</p>
              <Button 
                size="sm" 
                className="text-xs"
                onClick={handleViewAllActions}
              >
                <Zap className="w-3 h-3" />
                Actions
                <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Stakeholders */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <h4 className="font-semibold text-foreground">Key Stakeholders</h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stakeholders.map((stakeholder) => (
              <StakeholderCard key={stakeholder.id} stakeholder={stakeholder} />
            ))}
          </div>
        </div>
      </div>

      {/* Email Dialog */}
      <ActionEmailDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        action={selectedAction ? {
          id: selectedAction.id,
          stakeholderIds: dealActions.find(a => a.id === selectedAction.id)?.stakeholderIds || [],
          stakeholderName: selectedAction.stakeholderName,
          stakeholderRole: selectedAction.stakeholderRole,
          artifact: selectedAction.artifact,
          basedOn: selectedAction.basedOn,
          priority: selectedAction.priority,
        } : null}
        company={company}
        hasNextAction={hasNextAction()}
        onNextAction={handleNextAction}
      />

      {/* Meeting Dialog */}
      <ActionMeetingDialog
        open={meetingDialogOpen}
        onOpenChange={setMeetingDialogOpen}
        action={selectedAction ? {
          id: selectedAction.id,
          stakeholderIds: dealActions.find(a => a.id === selectedAction.id)?.stakeholderIds || [],
          stakeholderName: selectedAction.stakeholderName,
          stakeholderRole: selectedAction.stakeholderRole,
          artifact: selectedAction.artifact,
          basedOn: selectedAction.basedOn,
          priority: selectedAction.priority,
        } : null}
        company={company}
        hasNextAction={hasNextAction()}
        onNextAction={handleNextAction}
      />
    </TooltipProvider>
  );
};

export default DealExpandedRow;
