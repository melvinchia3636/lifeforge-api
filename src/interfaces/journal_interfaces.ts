import type BasePBCollection from './pocketbase_interfaces.js'

interface IJournalEntry extends BasePBCollection {
    date: string
    title: string
    content: string
    raw?: string
    summary?: string
    mood: {
        text: string
        emoji: string
    }
    photos: string[]
    token?: string
}

export type { IJournalEntry }
