import type { CineProvider, CineRequest, ProviderConfig } from '../provider-types'
import type { CineResponseSchema } from '../response-schema'

/**
 * Convert standard JSON Schema (lowercase) to Gemini's format (uppercase types).
 * "object" -> "OBJECT", "string" -> "STRING", etc.
 */
function toGeminiSchema(schema: CineResponseSchema): Record<string, unknown> {
  const result: Record<string, unknown> = {
    type: schema.type.toUpperCase(),
  }
  if (schema.properties) {
    result.properties = Object.fromEntries(
      Object.entries(schema.properties).map(([k, v]) => [k, toGeminiSchema(v)])
    )
  }
  if (schema.items) result.items = toGeminiSchema(schema.items)
  if (schema.required) result.required = schema.required
  if (schema.enum) result.enum = schema.enum
  // Gemini does not use additionalProperties — omit it
  return result
}

export const geminiProvider: CineProvider = {
  name: 'Gemini',

  async generate(request: CineRequest, config: ProviderConfig): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`

    const body = {
      systemInstruction: {
        parts: [{ text: request.systemInstruction }],
      },
      contents: [
        {
          parts: [
            { text: request.prompt },
            {
              inlineData: {
                mimeType: request.imageMimeType,
                data: request.imageBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: toGeminiSchema(request.schema),
        temperature: request.temperature,
      },
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ],
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Gemini API error (${res.status}): ${err}`)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) throw new Error("No response from Gemini")
    return text
  },
}
