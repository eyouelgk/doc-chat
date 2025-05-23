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
import { ArrowLeft, Save, Lock, User } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/app/components/ui/skeleton"

type UserType = {
  id: string
  email: string
  userName: string | null
  createdAt: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)

  // Profile update state
  const [state, formAction, isPending] = useActionState<
    { success: boolean; message: string },
    FormData
  >(
    async (prevState, formData) => {
      try {
        const result = await updateUserProfile(formData)
        if (result.success) {
          toast.success(result.message)
          // Refresh user data
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

  // Password change state
  const [passwordState, passwordFormAction, isPasswordPending] = useActionState<
    { success: boolean; message: string },
    FormData
  >(
    async (prevState, formData) => {
      try {
        const result = await changeUserPassword(formData)
        if (result.success) {
          toast.success(result.message)
          // Reset form
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

  // Fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/user")
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

  return (
    <>
      {loading ? (
        <ProfileSkeleton />
      ) : (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">Your Profile</h1>
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
                    <Label htmlFor="userName">Name</Label>
                    <Input
                      id="userName"
                      name="userName"
                      defaultValue={user?.userName || ""}
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
          </div>
        </div>
      )}
    </>
  )
}
