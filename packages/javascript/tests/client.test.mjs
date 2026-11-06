import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { test } from 'node:test'
import { TailorgameClient, TailorgameError, VERSION } from '../tailorgame.mjs'

test('packaged SDK filters public results and omits account fields without credentials', async () => {
  const originalFetch = globalThis.fetch
  const game = { id: 'id/with spaces', name: 'Neon Bowling', description: 'A timing challenge', category: 'Arcade', players: '1', status: 'playable', tags: ['bowling'], image: '/images/bowling.webp', playCount: 1, visibility: 'public', ownerId: 'must-not-leak', generationId: 'must-not-leak' }
  let requests = 0
  globalThis.fetch = async (url, options) => {
    requests++
    assert.equal(url, 'https://tailorgame.com/api/v1/games')
    assert.equal(options.method, 'GET')
    assert.equal(options.credentials, 'omit')
    assert.equal(options.redirect, 'error')
    assert.deepEqual(options.headers, { Accept: 'application/json' })
    return new Response(JSON.stringify({ games: [game, { ...game, id: 'private', visibility: 'private' }] }), { headers: { 'Content-Type': 'application/json' } })
  }
  try {
    const result = await new TailorgameClient().listGames({ query: 'bowling', category: 'Arcade', limit: 5 })
    assert.equal(result.games.length, 1)
    assert.equal(result.games[0].url, 'https://tailorgame.com/games?play=id%2Fwith%20spaces')
    assert.equal(JSON.stringify(result).includes('must-not-leak'), false)
    assert.equal(requests, 1)
  } finally { globalThis.fetch = originalFetch }
})

test('packaged SDK reports HTTP errors without response contents and rejects auth options', async () => {
  assert.throws(() => new TailorgameClient({ token: 'not-supported' }), TypeError)
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response('private diagnostic detail', { status: 503 })
  try {
    await assert.rejects(new TailorgameClient().getRankings(), error => error instanceof TailorgameError && error.code === 'HTTP_ERROR' && error.status === 503 && !error.message.includes('private diagnostic'))
  } finally { globalThis.fetch = originalFetch }
})

test('self-contained executable works without the SDK import or a network request', () => {
  const cli = new URL('../bin/tailorgame.mjs', import.meta.url)
  for (const flag of ['--help', '--version']) {
    const result = spawnSync(process.execPath, [cli.pathname, flag], { encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr)
    assert.ok(result.stdout.includes(flag === '--version' ? VERSION : 'tailorgame catalog'))
  }
  const rejected = spawnSync(process.execPath, [cli.pathname, 'delete-account'], { encoding: 'utf8' })
  assert.equal(rejected.status, 2)
  assert.match(rejected.stderr, /USAGE_ERROR/)
})
