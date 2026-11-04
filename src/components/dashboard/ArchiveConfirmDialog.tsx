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

interface ArchiveConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  actionTitle?: string;
}

const ArchiveConfirmDialog = ({ open, onOpenChange, onConfirm, actionTitle }: ArchiveConfirmDialogProps) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent className="max-w-md p-4 sm:p-6">
      <AlertDialogHeader className="text-left">
        <AlertDialogTitle>Archive {actionTitle ? `"${actionTitle}"` : "this action"}?</AlertDialogTitle>
        <AlertDialogDescription>It moves to History, where you can find it anytime.</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter className="gap-2 sm:space-x-0">
        <AlertDialogCancel className="mt-0">Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>Archive</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default ArchiveConfirmDialog;
