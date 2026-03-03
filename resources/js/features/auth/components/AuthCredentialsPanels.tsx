import { AuthBrandButton } from '@/features/auth/components/AuthBrandButton'
import { AuthMorphLayout } from '@/features/auth/components/AuthMorphLayout'
import { AuthSocialRow } from '@/features/auth/components/AuthSocialRow'
import { AuthTextField } from '@/features/auth/components/AuthTextField'
import { LoginFormData, RegisterFormData } from '@/features/auth/types/forms'
import { PageProps } from '@/types'
import { Link, useForm, usePage } from '@inertiajs/react'
import type { FormEventHandler } from 'react'

interface AuthCredentialsPanelsProps {
  rightPanelActive?: boolean
  canResetPassword?: boolean
  status?: string
}

export function AuthCredentialsPanels({
  rightPanelActive = false,
  canResetPassword = true,
  status,
}: AuthCredentialsPanelsProps) {
  const {
    props: { appEnv },
  } = usePage<PageProps>()

  const {
    data: signInData,
    setData: setSignInData,
    post: signInPost,
    processing: signInProcessing,
    errors: signInErrors,
    reset: signInReset,
  } = useForm<LoginFormData>({
    email: '',
    password: '',
    remember: false,
  })

  const {
    data: signUpData,
    setData: setSignUpData,
    post: signUpPost,
    processing: signUpProcessing,
    errors: signUpErrors,
    reset: signUpReset,
  } = useForm<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })

  const submitSignIn: FormEventHandler = (event) => {
    event.preventDefault()

    signInPost(route('login'), {
      onFinish: () => signInReset('password'),
    })
  }

  const submitSignUp: FormEventHandler = (event) => {
    event.preventDefault()

    signUpPost(route('register'), {
      onFinish: () => signUpReset('password', 'password_confirmation'),
    })
  }

  return (
    <AuthMorphLayout
      rightPanelActive={rightPanelActive}
      signUpForm={
        <>
          <h1 className="mb-6 text-[32px] font-bold text-foreground">Create Account</h1>
          <AuthSocialRow />
          <p className="mb-6 text-center text-[14px] text-muted-foreground">or use your email for registration</p>

          <form onSubmit={submitSignUp} className="w-full space-y-4">
            <AuthTextField
              id="register-name"
              label=""
              value={signUpData.name}
              placeholder="Name"
              onChange={(value) => setSignUpData('name', value)}
              error={signUpErrors.name}
              inputClassName="auth-input"
            />
            <AuthTextField
              id="register-email"
              label=""
              type="email"
              value={signUpData.email}
              placeholder="Email"
              onChange={(value) => setSignUpData('email', value)}
              error={signUpErrors.email}
              inputClassName="auth-input"
            />
            <AuthTextField
              id="register-password"
              label=""
              type="password"
              value={signUpData.password}
              placeholder="Password"
              onChange={(value) => setSignUpData('password', value)}
              error={signUpErrors.password}
              inputClassName="auth-input tracking-widest"
            />
            <AuthTextField
              id="register-password-confirmation"
              label=""
              type="password"
              value={signUpData.password_confirmation}
              placeholder="Confirm Password"
              onChange={(value) => setSignUpData('password_confirmation', value)}
              error={signUpErrors.password_confirmation}
              inputClassName="auth-input tracking-widest"
            />

            <AuthBrandButton className="mt-7 w-full" type="submit" disabled={signUpProcessing}>
              Sign Up
            </AuthBrandButton>
          </form>
        </>
      }
      signInForm={
        <>
          <h1 className="mb-6 text-[32px] font-bold text-foreground">Sign In</h1>
          {status ? (
            <div className="mb-4 w-full rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary">
              {status}
            </div>
          ) : null}
          <AuthSocialRow />
          <p className="mb-6 text-[14px] text-muted-foreground text-center">or use your email & password</p>

          <form onSubmit={submitSignIn} className="w-full space-y-4">
            <AuthTextField
              id="login-email"
              label=""
              type="email"
              value={signInData.email}
              placeholder="AsmrProg"
              onChange={(value) => setSignInData('email', value)}
              error={signInErrors.email}
              inputClassName="auth-input"
            />
            <AuthTextField
              id="login-password"
              label=""
              type="password"
              value={signInData.password}
              placeholder="........"
              onChange={(value) => setSignInData('password', value)}
              error={signInErrors.password}
              inputClassName="auth-input tracking-widest"
            />

            {canResetPassword ? (
              <Link
                href={route('password.request')}
                className="my-4 block text-right text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Forget Your Password?
              </Link>
            ) : null}

            <AuthBrandButton className="mt-2 w-full" type="submit" disabled={signInProcessing}>
              Sign In
            </AuthBrandButton>
          </form>

          {(appEnv === 'demo' || appEnv === 'local') && (
            <div className="mt-6 w-full border-t border-border pt-4">
              <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                One-Click Demo Access
              </p>
              <div className="grid grid-cols-3 gap-2">
                <AuthBrandButton
                  type="button"
                  className="px-3"
                  onClick={() => {
                    setSignInData('email', 'admin@example.com')
                    setSignInData('password', 'password')
                  }}
                >
                  Admin
                </AuthBrandButton>
                <AuthBrandButton
                  type="button"
                  className="px-3"
                  onClick={() => {
                    setSignInData('email', 'teacher@example.com')
                    setSignInData('password', 'password')
                  }}
                >
                  Teacher
                </AuthBrandButton>
                <AuthBrandButton
                  type="button"
                  className="px-3"
                  onClick={() => {
                    setSignInData('email', 'student@example.com')
                    setSignInData('password', 'password')
                  }}
                >
                  Student
                </AuthBrandButton>
              </div>
            </div>
          )}
        </>
      }
    />
  )
}
