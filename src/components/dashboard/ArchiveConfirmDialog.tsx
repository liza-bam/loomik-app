import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Archive } from "lucide-react";

interface ArchiveConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  actionTitle?: string;
}

const ArchiveConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  actionTitle,
}: ArchiveConfirmDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-purple/10 flex items-center justify-center">
              <Archive className="w-5 h-5 text-purple" />
            </div>
            <AlertDialogTitle>Archive Action</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <p>
              {actionTitle 
                ? `Are you sure you want to archive "${actionTitle}"?`
                : "Are you sure you want to archive this action?"}
            </p>
            <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-2">
              <p className="font-medium text-foreground">What happens when you archive:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>The action will be moved to your History</li>
                <li>It will no longer appear in your active actions list</li>
                <li>You can view archived actions anytime in the History page</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-purple hover:bg-gradient-to-r hover:from-purple hover:to-violet-500 text-white"
          >
            Archive Action
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ArchiveConfirmDialog;
