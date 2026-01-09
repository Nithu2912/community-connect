import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { Issue, IssueCategory } from '@/types';
import { 
  MapPin, 
  ThumbsUp, 
  Clock, 
  AlertTriangle,
  Lightbulb,
  Trash2,
  Droplets,
  Shield,
  Wrench,
  HelpCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface IssueCardProps {
  issue: Issue;
  onUpvote?: (id: string) => void;
  onViewDetails?: (issue: Issue) => void;
  hasUpvoted?: boolean;
  showActions?: boolean;
}

const categoryIcons: Record<IssueCategory, typeof MapPin> = {
  'road-damage': Wrench,
  'street-light': Lightbulb,
  'garbage': Trash2,
  'water-supply': Droplets,
  'drainage': Droplets,
  'public-safety': Shield,
  'other': HelpCircle,
};

const categoryLabels: Record<IssueCategory, string> = {
  'road-damage': 'Road Damage',
  'street-light': 'Street Light',
  'garbage': 'Garbage',
  'water-supply': 'Water Supply',
  'drainage': 'Drainage',
  'public-safety': 'Public Safety',
  'other': 'Other',
};

export function IssueCard({ 
  issue, 
  onUpvote, 
  onViewDetails, 
  hasUpvoted = false,
  showActions = true 
}: IssueCardProps) {
  const CategoryIcon = categoryIcons[issue.category];
  const timeAgo = formatDistanceToNow(new Date(issue.reportedAt), { addSuffix: true });

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/20">
      {issue.photoUrl && (
        <div className="relative h-40 overflow-hidden">
          <img 
            src={issue.photoUrl} 
            alt={issue.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          {issue.isOverdue && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-destructive text-destructive-foreground text-xs font-medium">
              <AlertTriangle className="h-3 w-3" />
              Overdue
            </div>
          )}
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight line-clamp-2">
              {issue.title}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CategoryIcon className="h-3.5 w-3.5" />
                {categoryLabels[issue.category]}
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{issue.ward}</span>
            </div>
          </div>
          <StatusBadge status={issue.status} />
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {issue.description}
        </p>
        
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            <span className="truncate max-w-[150px]">
              {issue.location.address || `${issue.location.lat.toFixed(4)}, ${issue.location.lng.toFixed(4)}`}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {timeAgo}
          </div>
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="pt-0 gap-2">
          <Button
            variant={hasUpvoted ? "default" : "outline"}
            size="sm"
            className="gap-1.5 flex-1"
            onClick={() => onUpvote?.(issue.id)}
          >
            <ThumbsUp className={`h-4 w-4 ${hasUpvoted ? 'fill-current' : ''}`} />
            <span>{issue.upvotes}</span>
            <span className="hidden sm:inline">Upvote</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => onViewDetails?.(issue)}
          >
            View Details
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
