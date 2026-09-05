import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, Shield, Key, Laptop, Smartphone, MapPin, CheckCircle, AlertTriangle, Save, Edit3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getCustomerProfile, updateCustomerProfile, changeCustomerPassword, type CustomerProfileData } from '@/lib/customer-portal-api'

export function CustomerProfilePage() {
  const queryClient = useQueryClient()

  // Editing state
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<CustomerProfileData>>({})

  // Password state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Alerts
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  const { data: profile, isLoading, isError, error } = useQuery({
    queryKey: ['customer-profile'],
    queryFn: getCustomerProfile,
  })

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: (updated: Partial<CustomerProfileData>) => updateCustomerProfile(updated),
    onSuccess: (data) => {
      setProfileSuccess('Profile updated successfully.')
      setIsEditing(false)
      queryClient.setQueryData(['customer-profile'], data)
    },
    onError: (err: Error) => {
      setProfileError(err.message || 'Failed to update profile.')
    },
  })

  // Change Password Mutation
  const changePasswordMutation = useMutation({
    mutationFn: () => {
      if (newPassword !== confirmPassword) {
        throw new Error('New passwords do not match.')
      }
      if (newPassword.length < 8) {
        throw new Error('Password must be at least 8 characters long.')
      }
      return changeCustomerPassword(currentPassword, newPassword)
    },
    onSuccess: () => {
      setPasswordSuccess('Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    },
    onError: (err: Error) => {
      setPasswordError(err.message || 'Failed to change password.')
    },
  })

  const handleEditClick = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        job_title: profile.job_title,
        profile_photo: profile.profile_photo,
      })
    }
    setIsEditing(true)
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSuccess(null)
    setProfileError(null)
    updateProfileMutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-destructive mb-3" />
        <h2 className="text-xl font-semibold">Failed to Load Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">{error instanceof Error ? error.message : 'Unable to load profile'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your personal information, credentials, and active security sessions</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Profile Information
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Security & Activity
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Profile Information */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Personal Information</CardTitle>
                <CardDescription>Your contact details and profile role in DealFlow360</CardDescription>
              </div>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={handleEditClick}>
                  <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit Profile
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {profileSuccess && (
                <div className="mb-4 p-3 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{profileSuccess}</span>
                </div>
              )}
              {profileError && (
                <div className="mb-4 p-3 rounded-md bg-rose-50 text-rose-900 border border-rose-200 text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="flex items-center gap-4 py-2">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xl text-primary border border-primary/20">
                      {profile.name ? profile.name.slice(0, 2).toUpperCase() : 'CU'}
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label htmlFor="profile_photo">Profile Photo URL</Label>
                      <Input
                        id="profile_photo"
                        placeholder="https://..."
                        value={formData.profile_photo || ''}
                        onChange={(e) => setFormData({ ...formData, profile_photo: e.target.value })}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email Address (Read-only)</Label>
                      <Input
                        id="email"
                        value={formData.email || ''}
                        disabled
                        className="bg-muted text-muted-foreground"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="job_title">Job Title</Label>
                      <Input
                        id="job_title"
                        value={formData.job_title || ''}
                        onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button type="submit" disabled={updateProfileMutation.isPending}>
                      <Save className="h-4 w-4 mr-1.5" />
                      {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xl text-primary border border-primary/20">
                      {profile.name ? profile.name.slice(0, 2).toUpperCase() : 'CU'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{profile.name}</h3>
                      <p className="text-sm text-muted-foreground">{profile.job_title}</p>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 pt-4 border-t">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Email</p>
                      <p className="text-sm font-medium mt-1 text-foreground">{profile.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Phone</p>
                      <p className="text-sm font-medium mt-1 text-foreground">{profile.phone || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Job Title</p>
                      <p className="text-sm font-medium mt-1 text-foreground">{profile.job_title}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Security & Activity */}
        <TabsContent value="security" className="space-y-6">
          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" /> Change Password
              </CardTitle>
              <CardDescription>Update your login credentials securely</CardDescription>
            </CardHeader>
            <CardContent>
              {passwordSuccess && (
                <div className="mb-4 p-3 rounded-md bg-emerald-50 text-emerald-900 border border-emerald-200 text-sm flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}
              {passwordError && (
                <div className="mb-4 p-3 rounded-md bg-rose-50 text-rose-900 border border-rose-200 text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  setPasswordSuccess(null)
                  setPasswordError(null)
                  changePasswordMutation.mutate()
                }}
                className="space-y-4 max-w-md"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="current_password">Current Password</Label>
                  <Input
                    id="current_password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="new_password">New Password</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" disabled={changePasswordMutation.isPending}>
                  {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Laptop className="h-4 w-4 text-primary" /> Active Sessions
              </CardTitle>
              <CardDescription>Devices currently signed in to your portal account</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.active_sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border">
                    <div className="flex items-center gap-3">
                      {session.device.toLowerCase().includes('mobile') ? (
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Laptop className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{session.device}</p>
                          {session.current && (
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                              Current Device
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <MapPin className="h-3 w-3" /> {session.location} • {session.ip}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{session.last_active}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Login Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Login Activity Log</CardTitle>
              <CardDescription>Recent sign-in attempts and security events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {profile.login_activity.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-xs p-2.5 rounded bg-muted/30 border border-border/50">
                    <span className="font-mono text-foreground font-medium">{log.timestamp}</span>
                    <span className="text-muted-foreground">{log.device}</span>
                    <span className="text-muted-foreground font-mono">{log.ip}</span>
                    <span className="text-muted-foreground">{log.location}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
