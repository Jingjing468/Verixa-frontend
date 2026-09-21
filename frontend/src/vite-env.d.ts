/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_GOOGLE_CLIENT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

type GoogleCredentialResponse = {
  credential?: string
}

interface Window {
  google?: {
    accounts: {
      id: {
        initialize(options: {
          client_id: string
          callback(response: GoogleCredentialResponse): void
        }): void
        renderButton(
          parent: HTMLElement,
          options: {
            theme?: 'outline' | 'filled_blue' | 'filled_black'
            size?: 'large' | 'medium' | 'small'
            type?: 'standard' | 'icon'
            text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin'
            shape?: 'rectangular' | 'pill' | 'circle' | 'square'
            width?: number
          }
        ): void
      }
    }
  }
}
