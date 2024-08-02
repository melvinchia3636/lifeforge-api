import type BasePBCollection from './pocketbase_interfaces.js'

interface IMusicEntry extends BasePBCollection {
    name: string
    author: string
    duration: string
    file: string
    is_favourite: boolean
}

export type { IMusicEntry }
