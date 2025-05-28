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
import { toast } from "sonner"
import { signIn, type ActionResponse } from "@/app/actions/auth"
import { ThemeToggle } from "@/app/components/theme-toggle"
import { FileText } from "lucide-react"

const initialState: ActionResponse = {
  success: false,
  message: "",
  errors: undefined,
}

export default function SignInPage() {
  const router = useRouter()

  const [rawState, formAction, isPending] = useActionState<
    ActionResponse,
    FormData
  >(async (prevState: ActionResponse, formData: FormData) => {
    try {
      const result = await signIn(formData)

      if (result.success) {
        toast.success("Signed in successfully")
        router.push("/dashboard")
        router.refresh()
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

  const state = rawState || initialState

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">DocChat</h1>
        </div>
        <h2 className="text-center text-2xl font-semibold text-foreground">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Chat with your documents using AI
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-6 shadow-lg sm:rounded-xl sm:px-10 border border-border">
          <Form action={formAction} className="space-y-6">
            {state?.message && !state.success && (
              <FormError>{state.message}</FormError>
            )}

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
                className={state?.errors?.email ? "border-destructive" : ""}
              />
              {state?.errors?.email?.map((err, i) => (
                <p
                  key={i}
                  id="email-error"
                  className="text-sm text-destructive"
                >
                  {err}
                </p>
              ))}
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="password">Password</FormLabel>
              <FormInput
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                disabled={isPending}
                aria-describedby="password-error"
                className={state?.errors?.password ? "border-destructive" : ""}
              />
              {state?.errors?.password?.map((err, i) => (
                <p
                  key={i}
                  id="password-error"
                  className="text-sm text-destructive"
                >
                  {err}
                </p>
              ))}
            </FormGroup>

            <div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </Form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-primary hover:text-primary/80"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
