import type BasePBCollection from './pocketbase_interfaces.js'

interface IMusicEntry extends BasePBCollection {
    name: string
    author: string
    duration: string
    file: string
    is_favourite: boolean
}

interface IYoutubeData {
    title: string
    uploadDate: string
    uploader: string
    duration: string
    viewCount: number
    likeCount: number
    thumbnail: string
}

export type { IMusicEntry, IYoutubeData }
