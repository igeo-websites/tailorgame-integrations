#!/usr/bin/env node
// Copies only the already-public clients; never copies application source or configuration.
import { readFile, writeFile, chmod } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
if (args.length !== 2 || args[0] !== '--source-root') {
  console.error('Usage: node scripts/sync-public-clients.mjs --source-root /path/to/source-checkout')
  process.exit(2)
}
const sourceRoot = resolve(args[1])
const destinationRoot = fileURLToPath(new URL('../', import.meta.url))
const files = [
  ['public/sdk/javascript/tailorgame.mjs', 'packages/javascript/tailorgame.mjs'],
  ['public/sdk/javascript/tailorgame.d.mts', 'packages/javascript/tailorgame.d.mts'],
  ['public/sdk/javascript/tailorgame.d.ts', 'packages/javascript/tailorgame.d.ts'],
  ['public/sdk/python/tailorgame.py', 'packages/python/src/tailorgame.py'],
  ['public/cli/tailorgame.mjs', 'packages/javascript/bin/tailorgame.mjs'],
]
// Read all source files before writing anything; a missing source cannot produce a partial update.
const contents = await Promise.all(files.map(async ([source, target]) => {
  let content = await readFile(resolve(sourceRoot, source), 'utf8')
  if (source.startsWith('public/cli/')) {
    const oldNotice = 'This is a direct download; no npm package is required or published.'
    if (!content.includes(oldNotice)) throw new Error('Review the public CLI help before adapting its distribution notice.')
    content = content.replaceAll('node cli/tailorgame.mjs', 'tailorgame')
      .replace('Show the downloadable SDK/CLI version', 'Show the SDK/CLI version')
      .replace(oldNotice, 'Included in the Tailorgame SDK package. Public reads need no account.')
  }
  return [target, content]
}))
for (const [target, content] of contents) await writeFile(resolve(destinationRoot, target), content)
await chmod(resolve(destinationRoot, 'packages/javascript/bin/tailorgame.mjs'), 0o755)
console.log(`Synchronized ${contents.length} public client files. Review, test and repack before release.`)
