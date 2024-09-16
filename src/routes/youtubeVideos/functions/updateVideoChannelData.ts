import { execSync } from 'child_process'
import Pocketbase from 'pocketbase'

async function updateVideoChannelData(
    videoId: string,
    uploaderUrl: string,
    pb: Pocketbase
): Promise<void> {
    const video = await pb
        .collection('youtube_video_storage_entry')
        .getFirstListItem(`youtube_id = "${videoId}"`)

    const { thumbnails, channel, id } = JSON.parse(
        execSync(
            `${process.cwd()}/src/bin/yt-dlp ${uploaderUrl} --playlist-items 0 --dump-single-json`
        )
            .toString()
            .trim()
    )

    const { totalItems } = await pb
        .collection('youtube_video_storage_channel')
        .getList(1, 1, {
            filter: `youtube_id = "${id}"`
        })

    if (totalItems !== 0) {
        const { id: channelId } = await pb
            .collection('youtube_video_storage_channel')
            .getFirstListItem(`youtube_id = "${id}"`)
        await pb.collection('youtube_video_storage_entry').update(video.id, {
            channel: channelId
        })
        return
    }

    await fetch(thumbnails[thumbnails.length - 1].url).then(async res => {
        const buffer = await res.arrayBuffer()

        const { id: channelId } = await pb
            .collection('youtube_video_storage_channel')
            .create({
                youtube_id: id,
                name: channel,
                thumbnail: new File([buffer], `${id}.jpg`)
            })

        await pb.collection('youtube_video_storage_entry').update(video.id, {
            channel: channelId
        })
    })
}

export default updateVideoChannelData
