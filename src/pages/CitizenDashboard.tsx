import { useState, useEffect } from 'react';
import { db } from '@/firebase';
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Header } from '@/components/Header';
import { IssueCard } from '@/components/IssueCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertCircle, Loader2, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

export default function CitizenDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // REAL-TIME DATABASE CONNECTION
  useEffect(() => {
    const q = query(collection(db, "issues"), orderBy("createdAt", "desc"));
    
    // This fills the cards automatically as soon as a user reports an issue
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

  const stats = {
    total: issues.length,
    reported: issues.filter(i => i.status === 'reported').length,
    resolved: issues.filter(i => i.status === 'resolved').length,
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="citizen" userName={user?.email} onLogout={handleLogout} />
      
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

        {/* Minimal Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card><CardContent className="pt-4 flex items-center gap-4">
            <TrendingUp className="text-blue-500" /> <div><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total Issues</p></div>
          </CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-4">
            <Clock className="text-amber-500" /> <div><p className="text-2xl font-bold">{stats.reported}</p><p className="text-xs text-muted-foreground">Pending</p></div>
          </CardContent></Card>
          <Card><CardContent className="pt-4 flex items-center gap-4">
            <CheckCircle2 className="text-emerald-500" /> <div><p className="text-2xl font-bold">{stats.resolved}</p><p className="text-xs text-muted-foreground">Resolved</p></div>
          </CardContent></Card>
        </div>

        {/* THE CARDS GRID */}
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
        ) : issues.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No issues found</h3>
              <p className="text-muted-foreground mb-4">Start by reporting a new civic issue.</p>
              <Button onClick={() => navigate('/citizen/report')}>Get Started</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}