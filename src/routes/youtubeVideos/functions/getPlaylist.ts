import { exec } from 'child_process'
import { IYoutubePlaylistEntry } from '../../../interfaces/youtube_video_storage_interfaces.js'

function getPlaylist(url: string): Promise<IYoutubePlaylistEntry> {
    return new Promise((resolve, reject) => {
        exec(
            `${process.cwd()}/src/bin/yt-dlp --flat-playlist --dump-single-json ${url}`,
            (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`)
                    reject(error)
                }

                try {
                    const playlist = JSON.parse(stdout)
                    const final = {
                        title: playlist.title,
                        total_videos: playlist.entries.length,
                        thumbnail:
                            playlist.thumbnails[playlist.thumbnails.length - 1]
                                .url,
                        views: playlist.view_count,
                        channel: playlist.channel,
                        entries: playlist.entries.map((e: any) => ({
                            id: e.id,
                            title: e.title,
                            duration: e.duration,
                            uploader: e.uploader,
                            uploaderUrl: e.uploader_url,
                            thumbnail:
                                e.thumbnails[e.thumbnails.length - 1].url,
                            viewCount: e.view_count
                        }))
                    }
                    resolve(final)
                } catch (err) {
                    console.error(`Error parsing JSON: ${err}`)
                    reject(err)
                }
            }
        )
    })
}

export default getPlaylist
