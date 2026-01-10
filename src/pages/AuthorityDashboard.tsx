import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/Header';
import { StatusBadge } from '@/components/StatusBadge';
import { WardSelector } from '@/components/WardSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { mockIssues, mockWards } from '@/data/mockData';
import { Issue, IssueStatus } from '@/types';
import { 
  AlertCircle,
  Clock,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Camera,
  AlertTriangle,
  BarChart3,
  ThumbsUp,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export default function AuthorityDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedWard, setSelectedWard] = useState('ward-1');
  const [issues, setIssues] = useState(mockIssues);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<IssueStatus>('in-progress');
  const [resolutionProof, setResolutionProof] = useState<File | null>(null);

  const wardData = mockWards.find(w => w.id === selectedWard);
  
  const filteredIssues = issues.filter(issue => 
    issue.ward.toLowerCase().includes(selectedWard.replace('ward-', 'ward '))
  );

  const overdueIssues = filteredIssues.filter(i => i.isOverdue);

  const handleUpdateStatus = (issue: Issue) => {
    setSelectedIssue(issue);
    setNewStatus(issue.status === 'reported' ? 'in-progress' : 'resolved');
    setIsUpdateDialogOpen(true);
  };

  const confirmStatusUpdate = () => {
    if (!selectedIssue) return;

    setIssues(prev => prev.map(issue => 
      issue.id === selectedIssue.id
        ? { 
            ...issue, 
            status: newStatus, 
            updatedAt: new Date(),
            resolvedAt: newStatus === 'resolved' ? new Date() : undefined,
            isOverdue: false
          }
        : issue
    ));

    toast({
      title: "Status updated!",
      description: `Issue marked as ${newStatus.replace('-', ' ')}`,
    });

    setIsUpdateDialogOpen(false);
    setSelectedIssue(null);
    setResolutionProof(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const resolutionRate = wardData 
    ? Math.round((wardData.resolvedIssues / wardData.totalIssues) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userRole="authority" 
        userName={user?.displayName || 'Officer'} 
        onLogout={handleLogout}
      />
      
      <div className="container px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Authority Dashboard</h1>
            <p className="text-muted-foreground">Manage and resolve civic issues in your ward</p>
          </div>
          <WardSelector 
            value={selectedWard} 
            onChange={setSelectedWard}
            className="w-full md:w-64"
          />
        </div>

        {/* Ward Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{wardData?.totalIssues || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Issues</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/10">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{wardData?.pendingIssues || 0}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{wardData?.resolvedIssues || 0}</p>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/10">
                  <BarChart3 className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{resolutionRate}%</p>
                  <p className="text-xs text-muted-foreground">Resolution Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Alert */}
        {overdueIssues.length > 0 && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-semibold text-destructive">
                    {overdueIssues.length} Overdue {overdueIssues.length === 1 ? 'Issue' : 'Issues'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    These issues require immediate attention
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Issues List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Ward Issues
            </CardTitle>
            <CardDescription>
              {filteredIssues.length} issues in {wardData?.name || 'selected ward'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredIssues.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
                <p className="text-muted-foreground">No issues reported in this ward</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredIssues.map((issue) => (
                  <div 
                    key={issue.id} 
                    className={`flex flex-col md:flex-row gap-4 p-4 rounded-lg border ${
                      issue.isOverdue ? 'border-destructive/50 bg-destructive/5' : ''
                    }`}
                  >
                    {issue.photoUrl && (
                      <img 
                        src={issue.photoUrl} 
                        alt={issue.title}
                        className="w-full md:w-32 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h4 className="font-semibold line-clamp-1">{issue.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="truncate">{issue.location.address || 'Location available'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {issue.isOverdue && (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Overdue
                            </Badge>
                          )}
                          <StatusBadge status={issue.status} />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {issue.description}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-3.5 w-3.5" />
                            {issue.upvotes} upvotes
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDistanceToNow(new Date(issue.reportedAt), { addSuffix: true })}
                          </div>
                        </div>
                        {issue.status !== 'resolved' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateStatus(issue)}
                            className={issue.status === 'reported' ? 'bg-warning hover:bg-warning/90' : 'bg-success hover:bg-success/90'}
                          >
                            {issue.status === 'reported' ? 'Start Progress' : 'Mark Resolved'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Community Features Placeholder */}
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Polls</CardTitle>
              <CardDescription>Community feedback collection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Monthly polls feature coming soon</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Ward Summary</CardTitle>
              <CardDescription>AI-powered insights for your ward</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm">
                  <span className="font-medium">Summary: </span>
                  {wardData?.name || 'This ward'} has a {resolutionRate}% resolution rate. 
                  {wardData?.pendingIssues ? ` Focus on the ${wardData.pendingIssues} pending issues, especially road damage and drainage concerns.` : ' Great work keeping the area clean!'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Issue Status</DialogTitle>
            <DialogDescription>
              {selectedIssue?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as IssueStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {newStatus === 'resolved' && (
              <div className="space-y-2">
                <Label>Resolution Proof (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <label className="cursor-pointer block">
                    <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Upload proof image</span>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setResolutionProof(e.target.files?.[0] || null)}
                    />
                  </label>
                  {resolutionProof && (
                    <p className="text-sm text-success mt-2">{resolutionProof.name}</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmStatusUpdate}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}