import { cn } from '@/lib/utils'
import { Link, router } from '@inertiajs/react'
import { ReactNode, useState, useEffect } from 'react'
import { motion } from 'motion/react'

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

  const transitionSettings = { duration: 0.7, ease: "easeInOut" }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <motion.div
          className="auth-form-container auth-sign-up left-0 flex flex-col items-center justify-center bg-card text-card-foreground"
          initial={false}
          animate={{
            x: isActive ? '100%' : '0%',
            opacity: isActive ? 1 : 0,
            zIndex: isActive ? 5 : 1,
          }}
          transition={transitionSettings}
        >
          {signUpForm}
        </motion.div>

        <motion.div
          className="auth-form-container auth-sign-in left-0 flex flex-col items-center justify-center bg-card text-card-foreground"
          initial={false}
          animate={{
            x: isActive ? '100%' : '0%',
            opacity: isActive ? 0 : 1,
            zIndex: isActive ? 1 : 2,
          }}
          transition={transitionSettings}
        >
          {signInForm}
        </motion.div>

        <motion.div
          className="auth-overlay-container z-[100]"
          initial={false}
          animate={{
            x: isActive ? '-100%' : '0%',
            borderTopLeftRadius: isActive ? 0 : 120,
            borderBottomLeftRadius: isActive ? 0 : 40,
            borderTopRightRadius: isActive ? 120 : 0,
            borderBottomRightRadius: isActive ? 40 : 0,
          }}
          transition={transitionSettings}
          style={{
            borderTopLeftRadius: 120,
            borderBottomLeftRadius: 40,
          }}
        >
          <motion.div
            className="auth-overlay"
            initial={false}
            animate={{
              x: isActive ? '50%' : '0%',
            }}
            transition={transitionSettings}
          >
            <motion.div
              className="auth-overlay-panel"
              initial={false}
              animate={{
                x: isActive ? '0%' : '-20%',
              }}
              transition={transitionSettings}
            >
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
            </motion.div>

            <motion.div
              className="auth-overlay-panel auth-overlay-right"
              initial={false}
              animate={{
                x: isActive ? '20%' : '0%',
              }}
              transition={transitionSettings}
            >
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
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
