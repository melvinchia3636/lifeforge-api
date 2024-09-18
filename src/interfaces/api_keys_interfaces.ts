import BasePBCollection from './pocketbase_interfaces.js'

interface IAPIKeyEntry extends BasePBCollection {
    keyId: string
    name: string
    description: string
    icon: string
    key: string
}

export type { IAPIKeyEntry }
