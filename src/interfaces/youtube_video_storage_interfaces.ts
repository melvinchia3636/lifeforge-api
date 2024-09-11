import BasePBCollection from './pocketbase_interfaces.js'

interface IYoutubeVidesStorageEntry extends BasePBCollection {
    youtube_id: string
    title: string
    upload_date: string
    channel?: {
        id: string
        name: string
        thumbnail: string
    }
    duration: number
    width: number
    height: number
    filesize: number
}

interface IYoutubePlaylistVideoEntry {
    id: string
    title: string
    duration: number
    uploader: string
    uploaderUrl: string
    thumbnail: string
    viewCount: number
}

interface IYoutubePlaylistEntry {
    title: string
    total_videos: number
    thumbnail: string
    views: number
    channel: string
    entries: IYoutubePlaylistVideoEntry[]
}

export { IYoutubeVidesStorageEntry, IYoutubePlaylistEntry }
