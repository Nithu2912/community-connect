import { Badge } from '@/components/ui/badge';
import { IssueStatus } from '@/types';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: IssueStatus;
  className?: string;
}

const statusConfig = {
  'reported': {
    label: 'Reported',
    icon: AlertCircle,
    className: 'status-reported border',
  },
  'in-progress': {
    label: 'In Progress',
    icon: Clock,
    className: 'status-in-progress border',
  },
  'resolved': {
    label: 'Resolved',
    icon: CheckCircle2,
    className: 'status-resolved border',
  },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant="outline" 
      className={`${config.className} ${className} font-medium gap-1.5 px-2.5 py-1`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}
