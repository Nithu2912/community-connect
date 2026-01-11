import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Header } from "@/components/Header";
import { WardSelector } from "@/components/WardSelector";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { IssueCategory } from "@/types";

const categories = [
  { value: "road-damage", label: "Road Damage" },
  { value: "street-light", label: "Street Light" },
  { value: "garbage", label: "Garbage Collection" },
  { value: "water-supply", label: "Water Supply" },
  { value: "drainage", label: "Drainage Issue" },
  { value: "public-safety", label: "Public Safety" },
  { value: "other", label: "Other" },
];

export default function ReportIssue() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<IssueCategory | "">("");
  const [ward, setWard] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({ title: "Please login again", variant: "destructive" });
      return;
    }

    // This check will now pass because ward is being updated correctly
    if (!title || !description || !category || !ward) {
      toast({ title: "Fill all fields", variant: "destructive" });
      return;
    }

    try {
      setIsSubmitting(true);

      await addDoc(collection(db, "issues"), {
        title,
        description,
        category,
        ward,
        status: "reported",
        upvotes: 0,
        reportedAt: new Date().toISOString(), // Fallback for UI cards
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        userEmail: user.email,
        location: { lat: 18.5204, lng: 73.8567 } // Default Pune coordinates
      });

      toast({ title: "Issue reported successfully!" });
      navigate("/citizen/dashboard");
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to submit", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="citizen" userName={user?.email} onLogout={() => { logout(); navigate("/"); }} />

      <div className="container max-w-xl py-6">
        <Button variant="ghost" onClick={() => navigate("/citizen/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Report Issue</CardTitle>
            <CardDescription>Submit a civic issue for your ward</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* FIX: Changed 'onValueChange' to 'onChange' to match your WardSelectorProps */}
              <WardSelector value={ward} onChange={setWard} />

              <Input placeholder="Title of the issue" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea placeholder="Describe the problem in detail..." value={description} onChange={(e) => setDescription(e.target.value)} />

              <Select value={category} onValueChange={(v) => setCategory(v as IssueCategory)}>
                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2 h-4 w-4" />}
                Submit Report
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}