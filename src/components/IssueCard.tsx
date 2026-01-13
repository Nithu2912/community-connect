import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from './StatusBadge';
import { 
  MapPin, 
  ThumbsUp, 
  Clock, 
  Lightbulb,
  Trash2,
  Droplets,
  Shield,
  Wrench,
  HelpCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const categoryIcons: any = {
  'road-damage': Wrench,
  'street-light': Lightbulb,
  'garbage': Trash2,
  'water-supply': Droplets,
  'drainage': Droplets,
  'public-safety': Shield,
  'other': HelpCircle,
};

const categoryLabels: any = {
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
}: any) {
  const CategoryIcon = categoryIcons[issue.category] || HelpCircle;

  let displayDate = "Recently";
  try {
    const dateObj = issue.createdAt?.toDate ? issue.createdAt.toDate() : new Date(issue.reportedAt || Date.now());
    displayDate = formatDistanceToNow(dateObj, { addSuffix: true });
  } catch (e) {
    displayDate = "Recently";
  }

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg border-slate-200">
      {issue.photoUrl && (
        <div className="relative h-40 overflow-hidden">
          <img 
            src={issue.photoUrl} 
            alt={issue.title}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base leading-tight line-clamp-2">
              {issue.title || "Untitled Issue"}
            </h3>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-slate-100 px-2 py-0.5 rounded">
                <CategoryIcon className="h-3 w-3" />
                {categoryLabels[issue.category] || "General"}
              </div>
              <span className="text-xs text-muted-foreground font-medium">{issue.ward}</span>
            </div>
          </div>
          <StatusBadge status={issue.status || "reported"} />
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-slate-600 line-clamp-2">
          {issue.description}
        </p>
        
        <div className="flex items-center gap-4 mt-4 text-[10px] uppercase font-bold tracking-wider text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {displayDate}
          </div>
          {issue.location?.address && (
             <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate max-w-[100px]">{issue.location.address}</span>
             </div>
          )}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="pt-0 gap-2">
          <Button
            // Highlight button if user has already upvoted
            variant={hasUpvoted ? "default" : "outline"}
            size="sm"
            className={`gap-1.5 flex-1 h-8 text-xs transition-all ${
              hasUpvoted 
                ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600" 
                : "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onUpvote?.();
            }}
          >
            <ThumbsUp className={`h-3.5 w-3.5 ${hasUpvoted ? 'fill-current' : ''}`} />
            <span>{issue.likes || 0}</span>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1 h-8 text-xs"
            onClick={() => onViewDetails?.(issue)}
          >
            Details
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}