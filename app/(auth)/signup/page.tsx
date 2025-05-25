"use client"

import { useActionState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import {
  Form,
  FormGroup,
  FormLabel,
  FormInput,
  FormError,
} from "@/app/components/ui/Form"
import Link from "next/link"
import toast from "react-hot-toast"
import { signUp, type ActionResponse } from "@/app/actions/auth"
import { ThemeToggle } from "@/app/components/theme-toggle"

const initialState: ActionResponse = {
  success: false,
  message: "",
  errors: undefined,
}

export default function SignUpPage() {
  const router = useRouter()

  const [state, formAction, isPending] = useActionState<
    ActionResponse,
    FormData
  >(async (prevState: ActionResponse, formData: FormData) => {
    try {
      const result = await signUp(formData)

      if (result.success) {
        toast.success("Account created successfully")
        router.push("/dashboard")
      }

      return result
    } catch (err) {
      return {
        success: false,
        message: (err as Error).message || "An error occurred",
        errors: undefined,
      }
    }
  }, initialState)

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-extrabold text-foreground">
          DocChat
        </h1>
        <h2 className="mt-2 text-center text-2xl font-bold text-foreground">
          Create a new account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-border">
          <Form action={formAction} className="space-y-6">
            {state?.message && !state.success && (
              <FormError>{state.message}</FormError>
            )}

            <FormGroup>
              <FormLabel htmlFor="userName">Full Name</FormLabel>
              <FormInput
                id="userName"
                name="userName"
                type="text"
                autoComplete="name"
                required
                disabled={isPending}
                aria-describedby="userName-error"
                className={state?.errors?.userName ? "border-red-500" : ""}
              />
              {state?.errors?.userName && (
                <p id="userName-error" className="text-sm text-red-500">
                  {state.errors.userName[0]}
                </p>
              )}
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="email">Email</FormLabel>
              <FormInput
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={isPending}
                aria-describedby="email-error"
                className={state?.errors?.email ? "border-red-500" : ""}
              />
              {state?.errors?.email && (
                <p id="email-error" className="text-sm text-red-500">
                  {state.errors.email[0]}
                </p>
              )}
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="password">Password</FormLabel>
              <FormInput
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                disabled={isPending}
                aria-describedby="password-error"
                className={state?.errors?.password ? "border-red-500" : ""}
              />
              {state?.errors?.password && (
                <p id="password-error" className="text-sm text-red-500">
                  {state.errors.password[0]}
                </p>
              )}
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
              <FormInput
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                disabled={isPending}
                aria-describedby="confirmPassword-error"
                className={
                  state?.errors?.confirmPassword ? "border-red-500" : ""
                }
              />
              {state?.errors?.confirmPassword && (
                <p id="confirmPassword-error" className="text-sm text-red-500">
                  {state.errors.confirmPassword[0]}
                </p>
              )}
            </FormGroup>

            <div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Creating account..." : "Sign up"}
              </Button>
            </div>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-foreground hover:text-primary"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
