"use client"

import { useState, useEffect } from "react"
import { Button } from "@/app/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { useActionState } from "react"
import { updateUserProfile, changeUserPassword } from "@/app/actions/profile"
import { toast } from "react-hot-toast"
import { ArrowLeft, Save, Lock, User, Trash2 } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/app/components/ui/skeleton"
import { ThemeToggle } from "@/app/components/theme-toggle"
import { LogOut } from "lucide-react"
import { signOut } from "@/app/actions/auth"
import { deleteUserAccount } from "@/app/actions/profile" // Import the new action
import ConfirmDialog from "@/app/components/ConfirmDialog" // Import ConfirmDialog
import { useRouter } from "next/navigation" // Import useRouter

type UserType = {
  id: string
  email: string
  name: string | null
  createdAt: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false) // State for delete loading
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const router = useRouter()

  const [state, formAction, isPending] = useActionState<
    { success: boolean; message: string },
    FormData
  >(
    async (prevState, formData) => {
      try {
        const result = await updateUserProfile(formData)
        if (result.success) {
          toast.success(result.message)
          fetchUserData()
        } else {
          toast.error(result.message)
        }
        return result
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : "An error occurred",
        }
      }
    },
    { success: false, message: "" }
  )

  const [passwordState, passwordFormAction, isPasswordPending] = useActionState<
    { success: boolean; message: string },
    FormData
  >(
    async (prevState, formData) => {
      try {
        const result = await changeUserPassword(formData)
        if (result.success) {
          toast.success(result.message)
          ;(
            document.getElementById("password-form") as HTMLFormElement
          )?.reset()
        } else {
          toast.error(result.message)
        }
        return result
      } catch (error) {
        return {
          success: false,
          message: error instanceof Error ? error.message : "An error occurred",
        }
      }
    },
    { success: false, message: "" }
  )

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/users/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  function ProfileSkeleton() {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="grid gap-8">
          <div>
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-32 w-full mb-2" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div>
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-32 w-full mb-2" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return <ProfileSkeleton />
  }

  const handleDeleteAccountConfirm = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteUserAccount()
      if (result.success) {
        toast.success(result.message || "Account deleted successfully.")
        await signOut() // Sign out user
        router.push("/login?message=Account+deleted") // Redirect to login
      } else {
        toast.error(result.message || "Failed to delete account.")
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred."
      )
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <>
      {loading ? (
        <ProfileSkeleton />
      ) : (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="flex justify-between items-center mb-8">
            <div className="flex  items-center gap-4 ">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <h1 className="text-3xl font-bold">Your Profile</h1>
            </div>
            <ThemeToggle />
          </div>

          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form action={formAction} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      defaultValue={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-sm text-muted-foreground">
                      Your email address cannot be changed
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      defaultValue={user?.name || ""}
                      placeholder="Your name"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="flex gap-2"
                  >
                    {isPending ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  id="password-form"
                  action={passwordFormAction}
                  className="space-y-4"
                >
                  <div className="grid gap-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isPasswordPending}
                    className="flex gap-2"
                  >
                    {isPasswordPending ? (
                      <>Updating...</>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        Update Password
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="h-5 w-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Deleting your account is a permanent action and cannot be
                  undone. All your data, including documents and conversations,
                  will be removed.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowDeleteConfirm(true) // Open confirmation dialog
                  }}
                  className="flex gap-2"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>Deleting...</>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete My Account
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                variant="destructive"
                onClick={() => {
                  signOut()
                }}
              >
                <LogOut className="h-4 w-4" />
                <p>Sign Out</p>
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        onConfirm={handleDeleteAccountConfirm}
        title="Delete Account"
        description="Are you sure you want to delete your account? This action is permanent and cannot be undone. All your data, including documents and conversations, will be removed."
        onCancel={function (): void {
          throw new Error("Function not implemented.")
        }}
      />
    </>
  )
}
