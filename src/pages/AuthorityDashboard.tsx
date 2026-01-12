import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'; // Fixed path
import { Header } from '@/components/Header';
import { StatusBadge } from '@/components/StatusBadge';
import { WardSelector } from '@/components/WardSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  MapPin, 
  Calendar, 
  Loader2,
  BarChart3 // Added for Polls
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export default function AuthorityDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);

  // REAL-TIME CONNECTION
  useEffect(() => {
    const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const issuesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setIssues(issuesData);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // FILTER LOGIC
  const filteredIssues = selectedWard === 'all' 
    ? issues 
    : issues.filter(i => i.ward === selectedWard);

  const stats = {
    total: filteredIssues.length,
    pending: filteredIssues.filter(i => i.status === 'reported').length,
    resolved: filteredIssues.filter(i => i.status === 'resolved').length,
  };

  // AI Summary Logic
  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedIssue) return;
    try {
      const issueRef = doc(db, "issues", selectedIssue.id);
      await updateDoc(issueRef, { 
        status: newStatus,
        updatedAt: new Date() 
      });
      toast({ title: `Status updated to ${newStatus}` });
      setIsUpdateDialogOpen(false);
    } catch (error) {
      toast({ title: "Update failed", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header userRole="authority" userName={user?.email} onLogout={() => { logout(); navigate('/'); }} />
      
      <div className="container px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold italic text-slate-800">Authority Panel</h1>
            <p className="text-muted-foreground">Monitor and resolve ward-level complaints</p>
          </div>
          {/* FIXED: Changed onValueChange to onChange to fix the red underline error */}
          <WardSelector value={selectedWard} onChange={setSelectedWard} />
        </div>

        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white border-none shadow-sm"><CardContent className="pt-4 flex items-center gap-4">
            <TrendingUp className="text-blue-600" /> <div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground uppercase">Total Assigned</p></div>
          </CardContent></Card>
          <Card className="bg-white border-none shadow-sm"><CardContent className="pt-4 flex items-center gap-4">
            <Clock className="text-amber-600" /> <div><p className="text-2xl font-bold">{stats.pending}</p><p className="text-xs text-muted-foreground uppercase">Pending Action</p></div>
          </CardContent></Card>
          <Card className="bg-white border-none shadow-sm"><CardContent className="pt-4 flex items-center gap-4">
            <CheckCircle2 className="text-emerald-600" /> <div><p className="text-2xl font-bold">{stats.resolved}</p><p className="text-xs text-muted-foreground uppercase">Resolved</p></div>
          </CardContent></Card>
        </div>

        {/* ISSUES LIST */}
        <Card className="border-none shadow-sm mb-8">
          <CardHeader className="border-b bg-white rounded-t-lg">
            <CardTitle className="text-lg flex items-center gap-2"><AlertCircle className="h-5 w-5" /> Ward Issues</CardTitle>
          </CardHeader>
          <CardContent className="p-0 bg-white">
            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
            ) : filteredIssues.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground">No issues reported for this ward.</div>
            ) : (
              <div className="divide-y">
                {filteredIssues.map((issue) => (
                  <div key={issue.id} className="p-4 flex flex-col md:flex-row gap-4 hover:bg-slate-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-slate-700">{issue.title}</h4>
                        <StatusBadge status={issue.status} />
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-4">{issue.description}</p>
                      <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-400 uppercase">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {issue.ward}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {issue.createdAt?.toDate ? formatDistanceToNow(issue.createdAt.toDate(), { addSuffix: true }) : 'Just now'}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => { setSelectedIssue(issue); setIsUpdateDialogOpen(true); }}
                      >
                        Update Status
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ADDED COMMUNITY FEATURES SECTION */}
        <div className="grid md:grid-cols-2 gap-4 mt-12">
          <Card className="bg-white border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Monthly Polls</CardTitle>
              <CardDescription>Community feedback collection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">Monthly polls feature coming soon</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
  ✨ AI Ward Summary
  <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
    Gemini
  </span>
</CardTitle>

              <CardDescription>AI-powered insights for your ward</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">Summary: </span>
                  This ward has a {resolutionRate}% resolution rate. 
                  {resolutionRate === 0 ? " Great work keeping the area clean!" : " Monitor pending issues to improve efficiency."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* UPDATE DIALOG */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Issue</DialogTitle>
            <DialogDescription>Update the progress of: {selectedIssue?.title}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 py-4">
            <Button className="bg-amber-500 hover:bg-amber-600" onClick={() => handleUpdateStatus('in-progress')}>Set to In-Progress</Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={() => handleUpdateStatus('resolved')}>Mark as Resolved</Button>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsUpdateDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}