import { spawn } from 'child_process'

function downloadVideo(
    url: string,
    output: string,
    progressCallback: (progress: number) => void
) {
    return new Promise((resolve, reject) => {
        const ytDlp = spawn(`${process.cwd()}/src/bin/yt-dlp`, [
            '--newline', // Ensures that each line of output is printed immediately
            '-S',
            'ext:mp4:m4a',
            '-o',
            output, // Output format
            '--write-thumbnail', // Write thumbnail to file
            url // Video URL
        ])

        ytDlp.stdout.on('data', data => {
            const output = data.toString()

            const progressMatch = output.match(/\[download\]\s+(\d+\.\d+)%/)
            if (progressMatch) {
                const progress = parseFloat(progressMatch[1])
                progressCallback(progress)
            }
        })

        ytDlp.on('error', err => {
            console.error(`yt-dlp error: ${err}`)
            reject(err)
        })

        ytDlp.stderr.on('data', data => {
            console.error(`yt-dlp error: ${data}`)
            reject(data)
        })

        ytDlp.on('close', code => {
            resolve('done')
        })
    })
}

export default downloadVideo
