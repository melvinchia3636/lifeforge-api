import * as s from 'superstruct'

const BasePBCollectionSchema = s.object({
    id: s.string(),
    collectionId: s.string(),
    collectionName: s.string(),
    created: s.string(),
    updated: s.string()
})

type BasePBCollection = s.Infer<typeof BasePBCollectionSchema>

type WithoutPBDefault<T> = Omit<T, keyof BasePBCollection>

export default BasePBCollection

export { WithoutPBDefault, BasePBCollectionSchema }
