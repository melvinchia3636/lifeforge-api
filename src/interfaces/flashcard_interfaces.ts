import type BasePBCollection from './pocketbase_interfaces.js'

interface IFlashcardDeck extends BasePBCollection {
    card_amount: number
    name: string
    tag: string
    expand: {
        tag: IFlashcardTag
    }
}

interface IFlashcardTag extends BasePBCollection {
    amount: number
    color: string
    name: string
}

interface IFlashcardCard {
    id?: string
    answer: string
    question: string
}

export type { IFlashcardDeck, IFlashcardTag, IFlashcardCard }
