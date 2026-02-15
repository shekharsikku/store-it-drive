"use client";

import Image from "next/image";
import type { Models } from "node-appwrite";
import { FileDetails, ShareInput } from "@/components/action-modal-content";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface DialogProps {
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  action: ActionType | null;
  file: Models.Document;
  closeAllModals: () => void;
  filename: string;
  setFilename: React.Dispatch<React.SetStateAction<string>>;
  setEmails: React.Dispatch<React.SetStateAction<string[]>>;
  handleRemoveUser: (email: string) => void;
  handleAction: () => void;
  isLoading: boolean;
}

const ActionDialogContent: React.FC<DialogProps> = ({
  isModalOpen,
  setIsModalOpen,
  action,
  file,
  closeAllModals,
  filename,
  setFilename,
  setEmails,
  handleRemoveUser,
  handleAction,
  isLoading,
}) => {
  if (!action) return null;

  const { value, label } = action;

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="shad-dialog button">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-light-100">{label}</DialogTitle>
          {value === "rename" && (
            <Input id="rename" type="text" value={filename} onChange={(e) => setFilename(e.target.value)} />
          )}
          {value === "details" && <FileDetails file={file} />}
          {value === "share" && <ShareInput file={file} onInputChange={setEmails} onRemove={handleRemoveUser} />}
          {value === "delete" && (
            <p className="delete-confirmation">
              Are you sure you want to delete{` `}
              <span className="delete-file-name">{file.name}</span>?
            </p>
          )}
        </DialogHeader>
        {["rename", "delete", "share"].includes(value) && (
          <DialogFooter className="flex flex-col gap-3 md:flex-row">
            <Button onClick={closeAllModals} className="modal-cancel-button">
              Cancel
            </Button>
            <Button onClick={handleAction} className="modal-submit-button">
              <p className="capitalize">{value}</p>
              {isLoading && (
                <Image src="/assets/icons/loader.svg" alt="loader" width={24} height={24} className="animate-spin" />
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { ActionDialogContent };
