import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuth } from "@/contexts/AuthContext";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  ArrowLeft,
  Upload,
  Loader2,
} from "lucide-react";
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
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });

      toast({ title: "Issue reported" });
      navigate("/citizen/dashboard");
    } catch (err) {
      console.error(err);
      toast({ title: "Failed to submit", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="citizen" userName={user?.email} onLogout={handleLogout} />

      <div className="container max-w-xl py-6">
        <Button variant="ghost" onClick={() => navigate("/citizen/dashboard")}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Report Issue</CardTitle>
            <CardDescription>Submit a civic issue</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <WardSelector value={ward} onChange={setWard} />

              <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

              <Select value={category} onValueChange={(v) => setCategory(v as IssueCategory)}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Upload />}
                Submit
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
