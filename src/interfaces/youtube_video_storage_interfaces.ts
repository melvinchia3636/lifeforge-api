import BasePBCollection from './pocketbase_interfaces.js'

interface IYoutubeVidesStorageEntry extends BasePBCollection {
    youtube_id: string
    title: string
    upload_date: string
    uploader: string
    duration: number
}

export { IYoutubeVidesStorageEntry }
