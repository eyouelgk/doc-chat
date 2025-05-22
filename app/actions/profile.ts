"use server"

import { z } from "zod"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getCurrentUser } from "@/lib/get-data"
import { hashPassword, verifyPassword } from "@/lib/auth"

// Define Zod schema for profile update validation
const ProfileUpdateSchema = z.object({
  userName: z.string().min(1, "Name is required"),
})

// Define Zod schema for password change validation
const PasswordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export type ActionResponse = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}

export async function updateUserProfile(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        message: "You must be logged in to update your profile",
      }
    }

    // Extract data from form
    const data = {
      userName: formData.get("userName") as string,
    }

    // Validate with Zod
    const validationResult = ProfileUpdateSchema.safeParse(data)
    if (!validationResult.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      }
    }

    // Update user profile
    await db
      .update(users)
      .set({
        userName: data.userName,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    return {
      success: true,
      message: "Profile updated successfully",
    }
  } catch (error) {
    console.error("Profile update error:", error)
    return {
      success: false,
      message: "An error occurred while updating your profile",
    }
  }
}

export async function changeUserPassword(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return {
        success: false,
        message: "You must be logged in to change your password",
      }
    }

    // Extract data from form
    const data = {
      currentPassword: formData.get("currentPassword") as string,
      newPassword: formData.get("newPassword") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    }

    // Validate with Zod
    const validationResult = PasswordChangeSchema.safeParse(data)
    if (!validationResult.success) {
      return {
        success: false,
        message: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors,
      }
    }

    // Verify current password
    const isPasswordValid = await verifyPassword(
      data.currentPassword,
      user.hashedPassword
    )
    if (!isPasswordValid) {
      return {
        success: false,
        message: "Current password is incorrect",
      }
    }

    // Hash new password
    const hashedPassword = await hashPassword(data.newPassword)

    // Update user password
    await db
      .update(users)
      .set({
        hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))

    return {
      success: true,
      message: "Password changed successfully",
    }
  } catch (error) {
    console.error("Password change error:", error)
    return {
      success: false,
      message: "An error occurred while changing your password",
    }
  }
}
