import { Facebook, Github, Linkedin } from 'lucide-react'
import { AuthSocialIcon } from '@/Components/domain/auth/AuthSocialIcon'

export function AuthSocialRow() {
  return (
    <div className="mb-5 flex space-x-3">
      <AuthSocialIcon>G+</AuthSocialIcon>
      <AuthSocialIcon>
        <Facebook className="h-4 w-4" />
      </AuthSocialIcon>
      <AuthSocialIcon>
        <Github className="h-4 w-4" />
      </AuthSocialIcon>
      <AuthSocialIcon>
        <Linkedin className="h-4 w-4" />
      </AuthSocialIcon>
    </div>
  )
}
