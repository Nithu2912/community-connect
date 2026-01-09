import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Header } from '@/components/Header';
import { WardSelector } from '@/components/WardSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Camera, 
  Upload, 
  Loader2, 
  Sparkles,
  CheckCircle2,
  Navigation
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { IssueCategory } from '@/types';

const categories: { value: IssueCategory; label: string }[] = [
  { value: 'road-damage', label: 'Road Damage' },
  { value: 'street-light', label: 'Street Light' },
  { value: 'garbage', label: 'Garbage Collection' },
  { value: 'water-supply', label: 'Water Supply' },
  { value: 'drainage', label: 'Drainage Issue' },
  { value: 'public-safety', label: 'Public Safety' },
  { value: 'other', label: 'Other' },
];

export default function ReportIssue() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory | ''>('');
  const [ward, setWard] = useState('');
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [manualAddress, setManualAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isCategorizingAI, setIsCategorizingAI] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const detectLocation = () => {
    setIsDetectingLocation(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          toast({
            title: "Location detected!",
            description: `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`,
          });
          setIsDetectingLocation(false);
        },
        (error) => {
          toast({
            title: "Location detection failed",
            description: "Please enter the location manually",
            variant: "destructive",
          });
          setIsDetectingLocation(false);
        }
      );
    } else {
      toast({
        title: "Geolocation not supported",
        description: "Please enter the location manually",
        variant: "destructive",
      });
      setIsDetectingLocation(false);
    }
  };

  const handleAICategorize = async () => {
    if (!title && !description) {
      toast({
        title: "Enter details first",
        description: "Please enter a title or description to auto-categorize",
        variant: "destructive",
      });
      return;
    }

    setIsCategorizingAI(true);
    
    // Simulate AI categorization
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simple keyword-based categorization for demo
    const text = (title + ' ' + description).toLowerCase();
    let detectedCategory: IssueCategory = 'other';
    
    if (text.includes('pothole') || text.includes('road') || text.includes('street')) {
      detectedCategory = 'road-damage';
    } else if (text.includes('light') || text.includes('lamp') || text.includes('dark')) {
      detectedCategory = 'street-light';
    } else if (text.includes('garbage') || text.includes('trash') || text.includes('waste')) {
      detectedCategory = 'garbage';
    } else if (text.includes('water') || text.includes('tap') || text.includes('supply')) {
      detectedCategory = 'water-supply';
    } else if (text.includes('drain') || text.includes('sewer') || text.includes('flood')) {
      detectedCategory = 'drainage';
    } else if (text.includes('safety') || text.includes('danger') || text.includes('hazard')) {
      detectedCategory = 'public-safety';
    }

    setCategory(detectedCategory);
    toast({
      title: "AI Categorized!",
      description: `Detected category: ${categories.find(c => c.value === detectedCategory)?.label}`,
    });
    setIsCategorizingAI(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !category || !ward) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (!location && !manualAddress) {
      toast({
        title: "Location required",
        description: "Please detect your location or enter it manually",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Issue reported successfully!",
      description: "Your issue has been submitted and will be reviewed shortly",
    });
    
    navigate('/citizen/dashboard');
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
      
      <div className="container px-4 py-6 md:py-8 max-w-2xl">
        <Button 
          variant="ghost" 
          className="mb-6 gap-2"
          onClick={() => navigate('/citizen/dashboard')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Report a Civic Issue</CardTitle>
            <CardDescription>
              Help improve your community by reporting issues in your area
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Ward Selection */}
              <div className="space-y-2">
                <Label htmlFor="ward">Select Your Ward *</Label>
                <WardSelector value={ward} onChange={setWard} />
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Issue Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief title describing the issue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide detailed information about the issue..."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Category with AI */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="category">Category *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-primary"
                    onClick={handleAICategorize}
                    disabled={isCategorizingAI}
                  >
                    {isCategorizingAI ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Auto-categorize with AI
                  </Button>
                </div>
                <Select value={category} onValueChange={(v) => setCategory(v as IssueCategory)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select issue category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <Label>Photo (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  {photoPreview ? (
                    <div className="space-y-3">
                      <img 
                        src={photoPreview} 
                        alt="Preview" 
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setPhoto(null);
                          setPhotoPreview(null);
                        }}
                      >
                        Remove Photo
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Camera className="h-10 w-10" />
                        <span className="text-sm font-medium">Click to upload or drag and drop</span>
                        <span className="text-xs">PNG, JPG up to 10MB</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3">
                <Label>Location *</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 flex-1"
                    onClick={detectLocation}
                    disabled={isDetectingLocation}
                  >
                    {isDetectingLocation ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Navigation className="h-4 w-4" />
                    )}
                    Detect My Location
                  </Button>
                </div>
                
                {location && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm">
                      Location detected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </span>
                  </div>
                )}
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or enter manually</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter address or landmark"
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit */}
              <Button 
                type="submit" 
                size="lg" 
                className="w-full gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5" />
                    Submit Issue Report
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
