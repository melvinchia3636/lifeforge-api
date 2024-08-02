import type BasePBCollection from './pocketbase_interfaces.js'

interface IGuitarTabsEntry extends BasePBCollection {
    name: string
    author: string
    file: string
    thumbnail: string
    pageCount: number
}

export default IGuitarTabsEntry
