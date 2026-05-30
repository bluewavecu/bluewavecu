import {
  StatusBadge,
  formatStatusLabel,
  statusToTone,
} from "@/components/ui/StatusBadge";

type AdminStatusBadgeProps = {
  status: string;
  label?: string;
};

export function AdminStatusBadge({ status, label }: AdminStatusBadgeProps) {
  return <StatusBadge label={label ?? formatStatusLabel(status)} tone={statusToTone(status)} />;
}

export { formatStatusLabel, statusToTone };
