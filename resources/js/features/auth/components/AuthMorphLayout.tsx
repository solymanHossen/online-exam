import { cn } from '@/lib/utils'
import { Link, router } from '@inertiajs/react'
import { ReactNode, useState, useEffect } from 'react'

interface AuthMorphLayoutProps {
  rightPanelActive?: boolean
  signInForm: ReactNode
  signUpForm: ReactNode
}

export function AuthMorphLayout({ rightPanelActive = false, signInForm, signUpForm }: AuthMorphLayoutProps) {
  const [isActive, setIsActive] = useState(rightPanelActive)

  useEffect(() => {
    setIsActive(rightPanelActive)
  }, [rightPanelActive])

  const handleNavigate = (e: React.MouseEvent<HTMLAnchorElement>, href: string, toRight: boolean) => {
    e.preventDefault()
    setIsActive(toRight)
    setTimeout(() => {
      router.visit(href, { preserveScroll: true, preserveState: true })
    }, 600) // Delay to let animation finish before destroying component
  }

  return (
    <div className="auth-page">
      <div className={cn('auth-card', isActive && 'auth-right-panel-active')}>
        <div className="auth-form-container auth-sign-up left-0 z-[1] flex flex-col items-center justify-center bg-card text-card-foreground opacity-0">
          {signUpForm}
        </div>

        <div className="auth-form-container auth-sign-in left-0 z-[2] flex flex-col items-center justify-center bg-card text-card-foreground">
          {signInForm}
        </div>

        <div className="auth-overlay-container z-[100]">
          <div className="auth-overlay">
            <div className="auth-overlay-panel auth-overlay-left">
              <h2 className="mb-5 text-4xl font-bold tracking-wide">Welcome Back!</h2>
              <p className="mb-10 px-4 text-[14px] font-medium leading-relaxed text-primary-foreground/90">
                To keep connected with us please login with your personal info
              </p>
              <a
                href={route('login')}
                onClick={(e) => handleNavigate(e, route('login'), false)}
                className="auth-outline-button inline-flex items-center justify-center"
              >
                Sign In
              </a>
            </div>

            <div className="auth-overlay-panel auth-overlay-right">
              <h2 className="mb-5 text-4xl font-bold tracking-wide">Hello, Friend!</h2>
              <p className="mb-10 px-4 text-[14px] font-medium leading-relaxed text-primary-foreground/90">
                Register with your personal details to use all of site features
              </p>
              <a
                href={route('register')}
                onClick={(e) => handleNavigate(e, route('register'), true)}
                className="auth-outline-button inline-flex items-center justify-center"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
