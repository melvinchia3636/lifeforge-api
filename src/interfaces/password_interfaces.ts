import type BasePBCollection from './pocketbase_interfaces.js'

interface IPasswordEntry extends BasePBCollection {
    color: string
    icon: string
    name: string
    password: string
    username: string
    website: string
    decrypted?: string
    pinned: boolean
}

export type { IPasswordEntry }
