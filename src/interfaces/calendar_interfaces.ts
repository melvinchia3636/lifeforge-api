import type BasePBCollection from './pocketbase_interfaces.js'

interface ICalendarEvent extends BasePBCollection {
    title: string
    start: string | Date
    end: string | Date
    category: string
}

interface ICalendarCategory extends BasePBCollection {
    color: string
    icon: string
    name: string
    amount: number
}

export type { ICalendarEvent, ICalendarCategory }
