import type { CineProvider, CineRequest, ProviderConfig } from '../provider-types'

export const openaiProvider: CineProvider = {
  name: 'OpenAI',

  async generate(request: CineRequest, config: ProviderConfig): Promise<string> {
    const isBrowser = 'window' in globalThis
    const base = isBrowser ? '/api/openai' : 'https://api.openai.com'
    const url = `${base}/v1/chat/completions`

    const body = {
      model: config.model,
      temperature: request.temperature,
      messages: [
        { role: "system", content: request.systemInstruction },
        {
          role: "user",
          content: [
            { type: "text", text: request.prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${request.imageMimeType};base64,${request.imageBase64}`,
              },
            },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "cinematography_recipe",
          strict: true,
          schema: request.schema,
        },
      },
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`OpenAI API error (${res.status}): ${err}`)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json()
    const text = data.choices?.[0]?.message?.content
    if (!text) throw new Error("No response from OpenAI")
    return JSON.stringify(JSON.parse(text), null, 2)
  },
}
