import type BasePBCollection from './pocketbase_interfaces.js'

interface IAchievementEntry extends BasePBCollection {
    title: string
    thoughts: string
    difficulty: 'easy' | 'medium' | 'hard' | 'impossible'
}

export type { IAchievementEntry }
