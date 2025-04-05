import { useState } from "react";
import DashboardLayout from "@/components/layout/Dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Loader2, User, ShieldCheck, History, Settings } from "lucide-react";

const Profile = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Get user profile data
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["/api/user/profile"],
    enabled: !!user
  });

  // Get user usage statistics
  const { data: usageStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/user/usage-stats"],
    enabled: !!user
  });

  const handleUpdateProfile = async () => {
    if (!displayName.trim()) {
      toast({
        title: "Error",
        description: "Display name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdating(true);
      await apiRequest("PUT", "/api/user/profile", { displayName });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: (error as Error).message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        await apiRequest("DELETE", "/api/user");
        await logout();
        toast({
          title: "Account deleted",
          description: "Your account has been deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Delete failed",
          description: (error as Error).message || "Failed to delete account",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <Tabs defaultValue="account" className="space-y-6">
          <TabsList>
            <TabsTrigger value="account" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Account
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <ShieldCheck className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center">
              <History className="h-4 w-4 mr-2" />
              Usage
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  Update your account details here.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingProfile ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user?.email || ""}
                        disabled
                        readOnly
                      />
                      <p className="text-sm text-muted-foreground">
                        Your email address cannot be changed
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="display-name">Display Name</Label>
                      <Input
                        id="display-name"
                        placeholder="Enter display name"
                        defaultValue={profile?.displayName || ""}
                        onChange={(e) => setDisplayName(e.target.value)}
                      />
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => logout()}>
                  Log Out
                </Button>
                <Button 
                  onClick={handleUpdateProfile} 
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : "Update Profile"}
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Delete Account</CardTitle>
                <CardDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove your data from our servers.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password to keep your account secure.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Change Password</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-factor authentication is disabled</p>
                    <p className="text-sm text-muted-foreground">
                      Enable two-factor authentication for enhanced security.
                    </p>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
                <CardDescription>
                  Your usage of speech services this month.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingStats ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Minutes Transcribed</p>
                        <p className="text-sm">{usageStats?.minutesTranscribed || 0} / 100</p>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{
                            width: `${Math.min(100, ((usageStats?.minutesTranscribed || 0) / 100) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Words Translated</p>
                        <p className="text-sm">{usageStats?.wordsTranslated || 0} / 10,000</p>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{
                            width: `${Math.min(100, ((usageStats?.wordsTranslated || 0) / 10000) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Speech Generated (seconds)</p>
                        <p className="text-sm">{usageStats?.speechGenerated || 0} / 600</p>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{
                            width: `${Math.min(100, ((usageStats?.speechGenerated || 0) / 600) * 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center">
                      <p className="font-medium">Current Plan</p>
                      <p className="font-medium">Free Tier</p>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <p>Monthly cost</p>
                      <p>$0.00</p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button>Upgrade Plan</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>
                  Manage your billing information and view past invoices.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  You are currently on the free tier. No billing information required.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Language Settings</CardTitle>
                <CardDescription>
                  Configure default languages for speech services.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default-transcription-language">Default Transcription Language</Label>
                  <select
                    id="default-transcription-language"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue="en-US"
                  >
                    <option value="en-US">English (US)</option>
                    <option value="en-GB">English (UK)</option>
                    <option value="es-ES">Spanish</option>
                    <option value="fr-FR">French</option>
                    <option value="de-DE">German</option>
                    <option value="ja-JP">Japanese</option>
                    <option value="zh-CN">Chinese (Simplified)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-translation-language">Default Translation Language</Label>
                  <select
                    id="default-translation-language"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue="es"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="ja">Japanese</option>
                    <option value="zh">Chinese</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-voice">Default Text-to-Speech Voice</Label>
                  <select
                    id="default-voice"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue="en-US-Standard-B"
                  >
                    <option value="en-US-Standard-B">English (US) - Male</option>
                    <option value="en-US-Standard-A">English (US) - Female</option>
                    <option value="en-US-Wavenet-A">English (US) - Female (Natural)</option>
                    <option value="en-US-Wavenet-B">English (US) - Male (Natural)</option>
                  </select>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Preferences</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Configure how you receive notifications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive updates about your account via email.
                      </p>
                    </div>
                    <div className="h-6 w-11 rounded-full bg-gray-200 p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                      <div className="h-4 w-4 rounded-full bg-white shadow-sm"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Process Completion Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts when your speech processing tasks are completed.
                      </p>
                    </div>
                    <div className="h-6 w-11 rounded-full bg-primary p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                      <div className="translate-x-full h-4 w-4 rounded-full bg-white shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Notification Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
