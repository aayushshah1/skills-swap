import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LoginRequestModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Login Required</DialogTitle>
        </DialogHeader>
        <p>You must be logged in to send a skill swap request.</p>
        <Link href="/login">
          <Button className="mt-4 w-full">Go to Login</Button>
        </Link>
      </DialogContent>
    </Dialog>
  );
}
