import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/Header';
import { IssueCard } from '@/components/IssueCard';
import { WardSelector } from '@/components/WardSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { mockIssues } from '@/data/mockData';
import { 
  Plus, 
  List, 
  Map, 
  Filter,
  AlertCircle,
  Clock,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Issue } from '@/types';

export default function CitizenDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedWard, setSelectedWard] = useState('');
  const [issues, setIssues] = useState(mockIssues);
  const [upvotedIssues, setUpvotedIssues] = useState<string[]>([]);

  const filteredIssues = selectedWard 
    ? issues.filter(issue => issue.ward.toLowerCase().includes(selectedWard.replace('ward-', 'ward ')))
    : issues;

  const stats = {
    total: filteredIssues.length,
    reported: filteredIssues.filter(i => i.status === 'reported').length,
    inProgress: filteredIssues.filter(i => i.status === 'in-progress').length,
    resolved: filteredIssues.filter(i => i.status === 'resolved').length,
  };

  const handleUpvote = (issueId: string) => {
    if (upvotedIssues.includes(issueId)) {
      setUpvotedIssues(prev => prev.filter(id => id !== issueId));
      setIssues(prev => prev.map(issue => 
        issue.id === issueId 
          ? { ...issue, upvotes: issue.upvotes - 1 }
          : issue
      ));
      toast({ title: "Upvote removed" });
    } else {
      setUpvotedIssues(prev => [...prev, issueId]);
      setIssues(prev => prev.map(issue => 
        issue.id === issueId 
          ? { ...issue, upvotes: issue.upvotes + 1 }
          : issue
      ));
      toast({ title: "Issue upvoted!", description: "Thank you for your support" });
    }
  };

  const handleViewDetails = (issue: Issue) => {
    toast({
      title: issue.title,
      description: `Status: ${issue.status} • ${issue.upvotes} upvotes`,
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        userRole="citizen" 
        userName={user?.displayName} 
        onLogout={handleLogout}
      />
      
      <div className="container px-4 py-6 md:py-8">
        {/* Welcome & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Welcome back!</h1>
            <p className="text-muted-foreground">Report issues and track their resolution</p>
          </div>
          <Button 
            size="lg" 
            className="gap-2 shadow-lg"
            onClick={() => navigate('/citizen/report')}
          >
            <Plus className="h-5 w-5" />
            Report New Issue
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Issues</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-info/10">
                  <AlertCircle className="h-5 w-5 text-info" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.reported}</p>
                  <p className="text-xs text-muted-foreground">Reported</p>
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
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
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
                  <p className="text-2xl font-bold">{stats.resolved}</p>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Filter className="h-4 w-4" />
                Filter by Ward:
              </div>
              <WardSelector 
                value={selectedWard} 
                onChange={setSelectedWard}
                placeholder="All Wards"
                className="w-full sm:w-64"
              />
              {selectedWard && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedWard('')}
                >
                  Clear filter
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Issues Tabs */}
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              List View
            </TabsTrigger>
            <TabsTrigger value="map" className="gap-2">
              <Map className="h-4 w-4" />
              Map View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            {filteredIssues.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No issues found</h3>
                  <p className="text-muted-foreground mb-4">
                    {selectedWard ? 'No issues in this ward yet' : 'No issues reported yet'}
                  </p>
                  <Button onClick={() => navigate('/citizen/report')}>
                    Report an Issue
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredIssues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onUpvote={handleUpvote}
                    onViewDetails={handleViewDetails}
                    hasUpvoted={upvotedIssues.includes(issue.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="map">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  Issue Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-[400px] md:h-[500px] rounded-lg bg-muted overflow-hidden">
                  {/* Map placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
                    <div className="text-center">
                      <Map className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Interactive Map</h3>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        Google Maps integration showing {filteredIssues.length} issues with markers
                      </p>
                      <div className="flex justify-center gap-4 mt-4">
                        <div className="flex items-center gap-1.5 text-xs">
                          <div className="w-3 h-3 rounded-full bg-info" />
                          Reported
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <div className="w-3 h-3 rounded-full bg-warning" />
                          In Progress
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <div className="w-3 h-3 rounded-full bg-success" />
                          Resolved
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Simulated markers */}
                  {filteredIssues.slice(0, 5).map((issue, idx) => (
                    <div
                      key={issue.id}
                      className={`absolute w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg cursor-pointer transform hover:scale-110 transition-transform ${
                        issue.status === 'reported' ? 'bg-info' :
                        issue.status === 'in-progress' ? 'bg-warning' : 'bg-success'
                      }`}
                      style={{
                        left: `${20 + (idx * 15)}%`,
                        top: `${30 + (idx * 10)}%`,
                      }}
                      title={issue.title}
                    >
                      {idx + 1}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
