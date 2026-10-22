export type ManagedKey = { name: string; file: string; savedAt: number }

// The key being entered in the pane. The typed value is never kept here.
export type Form = {
  source: 'claude' | 'user'
  name: string
  file: string
  purpose?: string
  isUnignored: boolean
  exists: boolean
  // For a key added from the list: the warnings were shown once, so the next save writes.
  isChecked?: boolean
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
