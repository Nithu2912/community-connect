import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { WardSelector } from "@/components/WardSelector";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Shield, Mail, Phone, ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import Firebase directly for the 'Auto-Create' logic
import { auth, db } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export default function AuthorityLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [ward, setWard] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !ward) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      let userCredential;

      try {
        // 1. First, try to log in normally
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (loginError: any) {
        // 2. If user doesn't exist, create them automatically
        if (loginError.code === 'auth/user-not-found' || loginError.code === 'auth/invalid-credential') {
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
        } else {
          throw loginError; // Rethrow if it's a different error (like wrong password)
        }
      }

      const user = userCredential.user;

      // 3. Save/Update the officer's profile with the selected Ward
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: "authority",
        ward: ward,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      toast({
        title: "Access Granted",
        description: `Logged in as Authority for ${ward}`,
      });

      navigate("/authority/dashboard");
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "OTP Feature",
      description: "Coming soon!",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container px-4 py-8 md:py-12">
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to role selection
        </Button>

        <div className="max-w-md mx-auto">
          <Card className="border-2 border-accent/20">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 text-accent mx-auto mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">Authority Login</CardTitle>
              <CardDescription>
                Enter credentials to access your assigned ward
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="email" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="email" className="gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="gap-2">
                    <Phone className="h-4 w-4" /> Phone
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email">
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Assigned Ward</Label>
                      <WardSelector value={ward} onChange={setWard} />
                    </div>

                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        placeholder="officer@municipality.gov"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Authenticating...
                        </>
                      ) : (
                        "Login / Create Session"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="phone">
                  <div className="space-y-4">
                    <WardSelector value={ward} onChange={setWard} />
                    <Input placeholder="Phone Number" />
                    <Button onClick={handlePhoneLogin} className="w-full" variant="outline">Send OTP</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}