import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle } from "lucide-react";
import logo from "@/assets/flyte-dna-shield-landscape.png";
import { z } from "zod";
import { getUserFriendlyError } from "@/lib/errorHandling";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useActivityLogger } from "@/hooks/useActivityLogger";
import { Badge } from "@/components/ui/badge";

// Validation schemas
const signInSchema = z.object({
  email: z.string().email("Invalid email format").max(255, "Email must be less than 255 characters"),
  password: z.string().min(1, "Password is required"),
});

const signUpSchema = z.object({
  email: z.string().email("Invalid email format").max(255, "Email must be less than 255 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  firstName: z.string().trim().min(1, "First name is required").max(100, "First name must be less than 100 characters"),
  lastName: z.string().trim().min(1, "Last name is required").max(100, "Last name must be less than 100 characters"),
  role: z.enum(["student", "coach", "admin"]),
  sport: z.string().trim().max(100, "Sport must be less than 100 characters").optional(),
  dateOfBirth: z.string().min(1, "Date of birth is required").refine(
    (date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 10 && age <= 100;
    },
    { message: "Please enter a valid date of birth" }
  ),
  referralSource: z.string().trim().max(200, "Referral source must be less than 200 characters").optional(),
});

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { logActivity } = useActivityLogger();
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [pilotCode, setPilotCode] = useState("");

  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "student" as "student" | "coach" | "admin",
    sport: "",
    dateOfBirth: "",
    referralSource: "",
  });

  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  // Check if user is coming from password reset email or has pilot code in URL
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'recovery') {
      setIsPasswordReset(true);
    }

    // Check for pilot code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const pilotCodeFromUrl = urlParams.get('pilot');
    if (pilotCodeFromUrl) {
      setPilotCode(pilotCodeFromUrl.toUpperCase());
    }
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      const validationResult = signUpSchema.safeParse(signUpData);
      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email.trim(),
        password: signUpData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            first_name: signUpData.firstName.trim(),
            last_name: signUpData.lastName.trim(),
            role: signUpData.role,
            sport: signUpData.sport?.trim() || null,
            date_of_birth: signUpData.dateOfBirth,
            referral_source: signUpData.referralSource?.trim() || null,
          },
        },
      });

      if (error) throw error;

      // Handle pilot code if provided
      if (pilotCode) {
        const validatePilotCode = async (attempt = 1): Promise<boolean> => {
          try {
            console.log(`[Pilot Code] Attempt ${attempt}: Validating code ${pilotCode} for user ${data.user.id}`);
            
            const { data: pilotResult, error: pilotError } = await supabase.rpc(
              'validate_and_consume_pilot_code',
              { 
                _code: pilotCode, 
                _user_id: data.user.id 
              }
            );

            if (pilotError) {
              console.error(`[Pilot Code] Attempt ${attempt} failed:`, pilotError);
              throw pilotError;
            }
            
            const result = pilotResult as any;
            console.log(`[Pilot Code] Attempt ${attempt} result:`, result);
            
            if (result.success) {
              toast({
                title: "🎉 Pilot Access Granted!",
                description: "You have 90 days of full access to the FLDI platform. Welcome!",
              });
              
              // Notify admins of pilot enrollment
              try {
                await supabase.functions.invoke('notify-admin-events', {
                  body: {
                    event_type: 'pilot_enrollment',
                    user_email: signUpData.email,
                    user_name: `${signUpData.firstName} ${signUpData.lastName}`,
                    additional_data: {
                      pilot_code: pilotCode,
                      expires_at: result.expires_at,
                    },
                  },
                });
              } catch (notifyError) {
                console.error('[Admin Notification] Failed to notify admins:', notifyError);
              }
              
              return true;
            } else {
              toast({
                title: "Invalid Pilot Code",
                description: result.message,
                variant: "destructive",
              });
              return false;
            }
          } catch (error) {
            console.error(`[Pilot Code] Attempt ${attempt} error:`, error);
            
            // Retry once if first attempt fails
            if (attempt === 1) {
              console.log('[Pilot Code] Retrying pilot code validation...');
              await new Promise(resolve => setTimeout(resolve, 1000));
              return validatePilotCode(2);
            }
            
            // Show warning toast on final failure
            toast({
              title: "Pilot Code Validation Failed",
              description: "Unable to apply pilot code. Please contact support if you have a valid code.",
              variant: "destructive",
            });
            console.error('[Pilot Code] Final validation failed after retry:', error);
            return false;
          }
        };

        await validatePilotCode();
      }

      // Notify admins of new signup
      try {
        await supabase.functions.invoke('notify-admin-events', {
          body: {
            event_type: 'new_signup',
            user_email: signUpData.email,
            user_name: `${signUpData.firstName} ${signUpData.lastName}`,
            additional_data: {
              registration_type: 'team', // Default registration type
              sport: signUpData.sport,
              referral_source: signUpData.referralSource,
            },
          },
        });
      } catch (notifyError) {
        console.error('[Admin Notification] Failed to notify admins of signup:', notifyError);
      }

      const roleMessage = (() => {
        if (signUpData.role === 'student') {
          return "Welcome to FLDI. Redirecting to your dashboard...";
        }
        
        if (signUpData.role === 'admin') {
          return "Account created! If this is the first administrator account, you'll have immediate access. Otherwise, your request is pending approval.";
        }
        
        return `Account created! Your ${signUpData.role} role request is pending administrator approval. You'll have student access until approved.`;
      })();
      
      toast({
        title: "Account created!",
        description: roleMessage,
      });

      // Check if there's an intended package and redirect to pricing
      const intendedPackage = localStorage.getItem('intended_package');
      if (intendedPackage) {
        localStorage.removeItem('intended_package');
        navigate('/pricing');
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: getUserFriendlyError(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      const validationResult = signInSchema.safeParse(signInData);
      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: signInData.email.trim(),
        password: signInData.password,
      });

      if (error) throw error;

      // Track login activity and update login stats
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('login_count')
          .eq('id', data.user.id)
          .single();

        await supabase
          .from('profiles')
          .update({ 
            last_login_at: new Date().toISOString(),
            login_count: (profile?.login_count || 0) + 1
          })
          .eq('id', data.user.id);

        await logActivity('login');
      }

      toast({
        title: "Welcome back!",
        description: "Redirecting to your dashboard...",
      });

      // Check if there's an intended package and redirect to pricing
      const intendedPackage = localStorage.getItem('intended_package');
      if (intendedPackage) {
        localStorage.removeItem('intended_package');
        navigate('/pricing');
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: getUserFriendlyError(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail || !resetEmail.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth`,
      });

      if (error) throw error;

      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for a password reset link",
      });
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: getUserFriendlyError(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 8) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "Please make sure both passwords match",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated. Redirecting...",
      });

      // Clear the hash and redirect to dashboard
      window.location.hash = '';
      setIsPasswordReset(false);
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: getUserFriendlyError(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show password reset form if user came from reset email
  if (isPasswordReset) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-950 p-4">
        <Card className="w-full max-w-md shadow-elegant">
          <CardHeader className="space-y-4">
            <div className="flex justify-center">
              <img 
                src={logo} 
                alt="FLY.TE Academy Logo" 
                className="h-128 w-auto cursor-pointer hover:opacity-80 transition-opacity" 
                onClick={() => navigate("/")}
              />
            </div>
            <CardTitle className="text-center">Reset Your Password</CardTitle>
            <CardDescription className="text-center">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 8 characters
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating password...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-950 p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <img 
              src={logo} 
              alt="FLY.TE Academy Logo" 
              className="h-128 w-auto cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => navigate("/")}
            />
          </div>
          <CardDescription className="text-center">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={signInData.email}
                    onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    className="text-sm text-muted-foreground"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot your password?
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First Name</Label>
                    <Input
                      id="first-name"
                      value={signUpData.firstName}
                      onChange={(e) => setSignUpData({ ...signUpData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last Name</Label>
                    <Input
                      id="last-name"
                      value={signUpData.lastName}
                      onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be at least 8 characters with uppercase, lowercase, and number
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">I am a...</Label>
                  <Select
                    value={signUpData.role}
                    onValueChange={(value: "student" | "coach" | "admin") =>
                      setSignUpData({ ...signUpData, role: value })
                    }
                  >
                    <SelectTrigger id="role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student-Athlete</SelectItem>
                      <SelectItem value="coach">Coach</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sport">Sport (Optional)</Label>
                  <Input
                    id="sport"
                    placeholder="e.g., Basketball, Track & Field"
                    value={signUpData.sport}
                    onChange={(e) => setSignUpData({ ...signUpData, sport: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-of-birth">Date of Birth</Label>
                  <Input
                    id="date-of-birth"
                    type="date"
                    value={signUpData.dateOfBirth}
                    onChange={(e) => setSignUpData({ ...signUpData, dateOfBirth: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Used for age-appropriate leadership development tracking
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referral-source">How did you hear about us?</Label>
                  <Select
                    value={signUpData.referralSource}
                    onValueChange={(value) =>
                      setSignUpData({ ...signUpData, referralSource: value })
                    }
                  >
                    <SelectTrigger id="referral-source">
                      <SelectValue placeholder="Select an option..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Coach/Mentor">Coach or Mentor</SelectItem>
                      <SelectItem value="Friend/Teammate">Friend or Teammate</SelectItem>
                      <SelectItem value="Social Media">Social Media (Instagram, Twitter, etc.)</SelectItem>
                      <SelectItem value="School/Organization">School or Organization</SelectItem>
                      <SelectItem value="Search Engine">Search Engine (Google, etc.)</SelectItem>
                      <SelectItem value="Advertisement">Advertisement</SelectItem>
                      <SelectItem value="Conference/Event">Conference or Event</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Help us understand how athletes discover FLDI
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="pilot-code">Pilot Invitation Code</Label>
                    {pilotCode && (
                      <Badge variant="secondary" className="text-xs">
                        Code Applied
                      </Badge>
                    )}
                  </div>
                  <Input
                    id="pilot-code"
                    placeholder="PILOT-XXX-XXX"
                    value={pilotCode}
                    onChange={(e) => setPilotCode(e.target.value.trim().toUpperCase())}
                    maxLength={15}
                    className={pilotCode ? "border-primary" : ""}
                  />
                  {pilotCode ? (
                    <div className="flex items-start gap-2 text-xs text-primary">
                      <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <p>
                        Pilot code <strong>{pilotCode}</strong> will be validated after signup. You'll receive 90 days of free access if valid.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Have a pilot invitation? Enter your code here for 90 days of free access.
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AlertDialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Password</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="reset-email">Email</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="your.email@example.com"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleForgotPassword} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Auth;