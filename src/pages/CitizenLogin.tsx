import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase";


import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Phone, ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function CitizenLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);


  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password, 'citizen');
      toast({
        title: "Welcome!",
        description: "You've successfully logged in as a citizen",
      });
      navigate('/citizen/dashboard');
    } catch (error: any) {
  console.error(error);
}
 finally {
      setIsLoading(false);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast({
        title: "Missing field",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "OTP Feature",
      description: "OTP verification will be implemented in the next phase",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container px-4 py-8 md:py-12">
        <Button 
          variant="ghost" 
          className="mb-6 gap-2"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to role selection
        </Button>

        <div className="max-w-md mx-auto">
          <Card className="border-2">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mx-auto mb-4">
                <Mail className="h-6 w-6" />
              </div>
              <CardTitle>
                   {isLogin ? "Citizen Login" : "Citizen Sign Up"}
              </CardTitle>

              <CardDescription>
                    {isLogin
                        ? "Sign in to report and track civic issues in your area"
                        : "Create an account to report civic issues"}
              </CardDescription>

            </CardHeader>
            <CardContent>
              <Tabs defaultValue="email" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="email" className="gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email">
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
  {isLoading ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin mr-2" />
      {isLogin ? "Signing in..." : "Creating account..."}
    </>
  ) : (
    isLogin ? "Sign In" : "Sign Up"
  )}
</Button>

                  </form>
                </TabsContent>

                <TabsContent value="phone">
                  <form onSubmit={handlePhoneLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  <Button type="submit" className="w-full">
                      {isLogin ? "Sign In" : "Sign Up"}
                  </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      OTP verification is a future feature
                    </p>
                  </form>
                </TabsContent>
              </Tabs>

               <p
  className="mt-4 text-sm text-center text-blue-600 cursor-pointer"
  onClick={() => setIsLogin(!isLogin)}
>
  {isLogin
    ? "New user? Create an account"
    : "Already have an account? Sign in"}
</p>


              <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
             
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}