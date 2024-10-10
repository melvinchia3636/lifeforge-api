import Pocketbase from 'pocketbase'
import dotenv from 'dotenv'

dotenv.config({
    path: '.env.local'
})

const PBClient = new Pocketbase(process.env.PB_HOST)
await PBClient.admins.authWithPassword(
    process.env.PB_EMAIL!,
    process.env.PB_PASSWORD!
)

const user = await PBClient.collection('users').getFirstListItem(
    `email = "${process.env.PB_EMAIL}"`
)

const { token: PBAuthToken } = await fetch(
    `${process.env.PB_HOST}/auth/get-token/${user.id}`,
    {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${PBClient.authStore.token}`
        }
    }
).then(res => res.json())

export { PBClient, PBAuthToken }
