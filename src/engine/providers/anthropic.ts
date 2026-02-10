import type { CineProvider, CineRequest, ProviderConfig } from '../provider-types'

export const anthropicProvider: CineProvider = {
  name: 'Anthropic',

  async generate(request: CineRequest, config: ProviderConfig): Promise<string> {
    const isBrowser = 'window' in globalThis
    const base = isBrowser ? '/api/anthropic' : 'https://api.anthropic.com'
    const url = `${base}/v1/messages`

    const body = {
      model: config.model,
      max_tokens: 4096,
      temperature: request.temperature,
      system: request.systemInstruction,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: request.imageMimeType,
                data: request.imageBase64,
              },
            },
            { type: "text", text: request.prompt },
          ],
        },
      ],
      tools: [
        {
          name: "cinematography_recipe",
          description: "Output the cinematography recipe as structured JSON",
          input_schema: request.schema,
        },
      ],
      tool_choice: { type: "tool", name: "cinematography_recipe" },
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": config.apiKey,
        "anthropic-version": "2023-06-01",
        ...(isBrowser ? {} : { "anthropic-dangerous-direct-browser-access": "true" }),
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Anthropic API error (${res.status}): ${err}`)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json()
    const toolBlock = data.content?.find(
      (block: { type: string }) => block.type === "tool_use"
    )
    if (!toolBlock?.input) throw new Error("No structured response from Anthropic")
    return JSON.stringify(toolBlock.input, null, 2)
  },
}
