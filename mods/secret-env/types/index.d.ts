export type ManagedKey = { name: string; file: string; savedAt: number }

// The key being entered in the pane. The typed value is never kept here.
export type Form = {
  source: 'claude' | 'user'
  name: string
  file: string
  purpose?: string
  isUnignored: boolean
  exists: boolean
  // For a key added from the list: the file:name the warnings were shown for, so saving it again writes.
  checked?: string
  error?: string
}

export type Saved = { name: string; file: string }

declare module 'claude-code' {
  interface PluginState {
    'secret-env': {
      form: Form | null
      saved: Saved | null
      keys: ManagedKey[]
      deleting: string | null
    }
  }
}
