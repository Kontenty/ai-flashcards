import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => (
  <Dialog open={isOpen} onOpenChange={onCancel}>
    <DialogContent showCloseButton={false}>
      <DialogHeader>
        <DialogTitle>Confirm Deletion</DialogTitle>
      </DialogHeader>
      <div className="py-4">Are you sure you want to delete this flashcard?</div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          No
        </Button>
        <Button variant="destructive" onClick={onConfirm}>
          Yes
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default DeleteConfirmDialog;
