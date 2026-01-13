import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, increment, arrayUnion, arrayRemove } from "firebase/firestore";
import { Header } from '@/components/Header';
import { IssueCard } from '@/components/IssueCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertCircle, Loader2, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CitizenDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const issuesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIssues(issuesData);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // UPDATED: STABLE ONE-VOTE LOGIC
  const handleUpvote = async (issueId: string, currentUpvotedBy: any) => {
    if (!user?.email) {
      toast({ title: "Please login to upvote" });
      return;
    }

    // Ensure we are working with an array even if the field doesn't exist yet
    const upvotedBy = Array.isArray(currentUpvotedBy) ? currentUpvotedBy : [];
    const issueRef = doc(db, "issues", issueId);
    const hasAlreadyVoted = upvotedBy.includes(user.email);

    try {
      if (hasAlreadyVoted) {
        // REMOVE VOTE
        await updateDoc(issueRef, {
          upvotedBy: arrayRemove(user.email),
          likes: increment(-1)
        });
      } else {
        // ADD VOTE
        await updateDoc(issueRef, {
          upvotedBy: arrayUnion(user.email),
          likes: increment(1)
        });
      }
    } catch (error) {
      console.error("Firebase Error:", error);
      toast({
        title: "Action failed",
        description: "Check your database permissions.",
        variant: "destructive",
      });
    }
  };

  const stats = {
    total: issues.length,
    reported: issues.filter(i => i.status === 'reported').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="citizen" userName={user?.email} onLogout={() => { logout(); navigate('/'); }} />
      
      <div className="container px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Citizen Dashboard</h1>
            <p className="text-muted-foreground">Track and report civic issues in your area</p>
          </div>
          <Button size="lg" className="gap-2" onClick={() => navigate('/citizen/report')}>
            <Plus className="h-5 w-5" /> Report New Issue
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card><CardContent className="pt-4 flex items-center gap-4 text-blue-500">
            <TrendingUp /> <div><p className="text-2xl font-bold text-foreground">{stats.total}</p><p className="text-xs text-muted-foreground">Total Issues</p></div>
          </CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-4 text-amber-500">
            <Clock /> <div><p className="text-2xl font-bold text-foreground">{stats.reported}</p><p className="text-xs text-muted-foreground">Pending</p></div>
          </CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-4 text-emerald-500">
            <CheckCircle2 /> <div><p className="text-2xl font-bold text-foreground">{stats.resolved}</p><p className="text-xs text-muted-foreground">Resolved</p></div>
          </CardContent></Card>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map((issue) => (
              <IssueCard 
                key={issue.id} 
                issue={issue} 
                // Pass the specific upvotedBy array for this issue
                hasUpvoted={issue.upvotedBy?.includes(user?.email)}
                onUpvote={() => handleUpvote(issue.id, issue.upvotedBy)} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}