interface BasePBCollection {
    id: string
    collectionId: string
    collectionName: string
    created: string
    updated: string
}

type WithoutPBDefault<T> = Omit<T, keyof BasePBCollection>

export default BasePBCollection

export { WithoutPBDefault }
