import { Button } from '@/components/ui/button';

export default function RegistrationDetailModal({ registration, onClose }) {
  if (!registration) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg border bg-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg">{registration.fullName}</h2>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gender</span>
            <span className="capitalize">{registration.gender || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Registration No.</span>
            <span>{registration.regNo || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">WhatsApp</span>
            <span>{registration.whatsappNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Emergency Contact</span>
            <span>
              {registration.emergencyContactName} — {registration.emergencyContactNumber}
            </span>
          </div>
          {registration.groupMemberNames?.length > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Group Members</span>
              <span className="text-right">{registration.groupMemberNames.join(', ')}</span>
            </div>
          )}
        </div>
        <Button variant="outline" className="mt-6 w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  );
}