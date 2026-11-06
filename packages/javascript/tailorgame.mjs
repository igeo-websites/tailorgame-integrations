/** Tailorgame public read-only JavaScript SDK. Browser modules and Node.js 24+. No dependencies. */
export const VERSION = '1.0.0'
const CATEGORIES = Object.freeze(['Arcade', 'Cards', 'Strategy', 'Racing'])
const DOCUMENTS = Object.freeze({ overview: '/index.md', authentication: '/auth.md', pricing: '/pricing.md', games: '/docs/games.md', api: '/docs/api.md' })
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024

export class TailorgameError extends Error {
  constructor(code, message, status) {
    super(message)
    this.name = 'TailorgameError'
    this.code = code
    this.status = status
  }
}

function record(value) { return value !== null && typeof value === 'object' && !Array.isArray(value) }
function validOrigin(value) {
  if (typeof value !== 'string') throw new TypeError('baseUrl must be an HTTPS origin or an HTTP loopback origin.')
  let url
  try { url = new URL(value) } catch { throw new TypeError('baseUrl must be an HTTPS origin or an HTTP loopback origin.') }
  const loopback = url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
  if ((!loopback && url.protocol !== 'https:') || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new TypeError('baseUrl must be an HTTPS origin or an HTTP loopback origin, without credentials, path, query or fragment.')
  }
  return url.origin
}

function filters(options) {
  if (!record(options) || Object.keys(options).some(key => !['query', 'category', 'limit'].includes(key))) throw new TypeError('Use only query, category and limit to filter games.')
  const { query = '', category, limit = 20 } = options
  if (typeof query !== 'string' || query.length > 200) throw new TypeError('query must contain at most 200 characters.')
  if (category !== undefined && !CATEGORIES.includes(category)) throw new TypeError('category must be Arcade, Cards, Strategy or Racing.')
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 50) throw new TypeError('limit must be an integer from 1 to 50.')
  return { query: query.trim().toLowerCase(), category, limit }
}

async function readText(response) {
  if (Number(response.headers.get('content-length')) > MAX_RESPONSE_BYTES || !response.body) throw new TailorgameError('INVALID_RESPONSE', 'The public response is empty or exceeds the SDK size limit.')
  const reader = response.body.getReader()
  const chunks = []
  let bytes = 0
  try {
    while (true) {
      const chunk = await reader.read()
      if (chunk.done) break
      bytes += chunk.value.byteLength
      if (bytes > MAX_RESPONSE_BYTES) {
        await reader.cancel()
        throw new TailorgameError('INVALID_RESPONSE', 'The public response exceeds the SDK size limit.')
      }
      chunks.push(chunk.value)
    }
  } finally { reader.releaseLock() }
  const joined = new Uint8Array(bytes)
  let offset = 0
  for (const chunk of chunks) { joined.set(chunk, offset); offset += chunk.byteLength }
  return new TextDecoder('utf-8', { fatal: true }).decode(joined)
}

/** No custom methods, paths, headers or credentials are accepted. */
export class TailorgameClient {
  #baseUrl
  #timeoutMs

  constructor(options = {}) {
    if (!record(options) || Object.keys(options).some(key => !['baseUrl', 'timeoutMs'].includes(key))) throw new TypeError('Use only baseUrl and timeoutMs to configure the public client.')
    this.#baseUrl = validOrigin(options.baseUrl ?? 'https://tailorgame.com')
    this.#timeoutMs = options.timeoutMs ?? 10_000
    if (!Number.isSafeInteger(this.#timeoutMs) || this.#timeoutMs < 100 || this.#timeoutMs > 60_000) throw new TypeError('timeoutMs must be an integer from 100 to 60000.')
  }

  get baseUrl() { return this.#baseUrl }

  async #read(path, markdown = false) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.#timeoutMs)
    try {
      const response = await fetch(`${this.#baseUrl}${path}`, {
        method: 'GET', credentials: 'omit', redirect: 'error', referrerPolicy: 'no-referrer',
        headers: { Accept: markdown ? 'text/markdown, text/plain;q=0.9' : 'application/json' },
        signal: controller.signal,
      })
      if (!response.ok) throw new TailorgameError('HTTP_ERROR', `Tailorgame public request failed (HTTP ${response.status}).`, response.status)
      const contentType = (response.headers.get('content-type') ?? '').split(';')[0].trim().toLowerCase()
      if (markdown ? !['text/markdown', 'text/plain'].includes(contentType) : contentType !== 'application/json') throw new TailorgameError('INVALID_RESPONSE', 'The public endpoint returned an unexpected content type.')
      const text = await readText(response)
      if (markdown) {
        if (!text.trim()) throw new TailorgameError('INVALID_RESPONSE', 'The documentation response is empty.')
        return text
      }
      let data
      try { data = JSON.parse(text) } catch { throw new TailorgameError('INVALID_RESPONSE', 'The public endpoint returned invalid JSON.') }
      if (!record(data)) throw new TailorgameError('INVALID_RESPONSE', 'The public endpoint returned an unexpected response.')
      return data
    } catch (error) {
      if (error instanceof TailorgameError) throw error
      if (controller.signal.aborted) throw new TailorgameError('TIMEOUT', 'The Tailorgame public request timed out.')
      throw new TailorgameError('NETWORK_ERROR', 'The Tailorgame public request could not be completed. Redirects are not followed.')
    } finally { clearTimeout(timer) }
  }

  async listGames(options = {}) {
    const { query, category, limit } = filters(options)
    const data = await this.#read('/api/v1/games')
    if (!Array.isArray(data.games) || data.games.some(game => !record(game) || typeof game.id !== 'string' || typeof game.name !== 'string' || typeof game.description !== 'string' || !Array.isArray(game.tags) || game.tags.some(tag => typeof tag !== 'string') || !CATEGORIES.includes(game.category) || !['playable', 'coming-soon'].includes(game.status))) {
      throw new TailorgameError('INVALID_RESPONSE', 'The public catalog returned an unexpected response.')
    }
    const games = data.games.filter(game => game.visibility === 'public' && (!category || game.category === category) && (!query || `${game.name} ${game.description} ${game.tags.join(' ')}`.toLowerCase().includes(query))).slice(0, limit)
      .map(({ id, name, description, category, players, status, instructions, tags, image, playCount, uniquePlayerCount, loveCount }) => ({
        id, name, description, category, players, status, tags, image, playCount,
        ...(typeof instructions === 'string' && instructions ? { instructions } : {}),
        ...(typeof uniquePlayerCount === 'number' ? { uniquePlayerCount } : {}),
        ...(typeof loveCount === 'number' ? { loveCount } : {}),
        url: `${this.#baseUrl}/games?play=${encodeURIComponent(id)}`,
      }))
    return { games }
  }

  async getRankings() {
    const data = await this.#read('/api/v1/rankings')
    const keys = ['mostPlayedGames', 'mostLovedGames', 'mostActivePlayers', 'highestScoringPlayers']
    if (keys.some(key => !Array.isArray(data[key]))) throw new TailorgameError('INVALID_RESPONSE', 'The public rankings returned an unexpected response.')
    return Object.fromEntries(keys.map(key => [key, data[key]]))
  }

  async getDocumentation(topic = 'overview') {
    if (typeof topic !== 'string' || !Object.hasOwn(DOCUMENTS, topic)) throw new TypeError('topic must be overview, authentication, pricing, games or api.')
    return this.#read(DOCUMENTS[topic], true)
  }
}
