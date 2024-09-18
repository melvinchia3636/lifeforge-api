import Groq from 'groq-sdk'

export async function fetchGroq(
    apiKey: string,
    prompt: string
): Promise<string | null> {
    const groq = new Groq({
        apiKey
    })

    const response = await groq.chat.completions.create({
        messages: [
            {
                role: 'user',
                content: prompt
            }
        ],
        model: 'llama-3.1-70b-versatile'
    })

    const res = response.choices[0]?.message?.content

    if (!res) {
        return null
    }

    return res
}
