# Tailorgame JavaScript SDK and CLI

Read Tailorgame's public game catalog, practice rankings, and documentation from JavaScript, TypeScript, or the command line. No runtime dependencies, account, or API key. ESM and Node.js 24.12+; browser applications can bundle the SDK. The CLI requires Node.js.

**MIT release candidate: publication authorized, not yet published to npm.** Package name: `tailorgame-sdk`; command: `tailorgame`. The approved source repository is [igeo-websites/tailorgame-integrations](https://github.com/igeo-websites/tailorgame-integrations). Registry publishing still requires the owner's authenticated release setup.

## Try the local package

From this directory, run `npm pack --ignore-scripts` to create `tailorgame-sdk-1.0.0.tgz`. In a separate application:

```sh
npm install /absolute/path/to/tailorgame-sdk-1.0.0.tgz --ignore-scripts
```

Use an `.mjs` file or a project with `"type": "module"`:

```js
import { TailorgameClient, TailorgameError } from 'tailorgame-sdk'

const client = new TailorgameClient()
try {
  const { games } = await client.listGames({ query: 'bowling', category: 'Arcade', limit: 5 })
  for (const game of games) console.log(game.name, game.status, game.url)
  console.log(await client.getRankings())
  console.log(await client.getDocumentation('pricing'))
} catch (error) {
  if (error instanceof TailorgameError) console.error(error.code, error.status)
  else throw error
}
```

TypeScript declarations resolve through the package exports. CommonJS `require()` is not part of the exported interface; use ESM import or dynamic `import()`.

## Command line

After local installation, the package installs a `tailorgame` executable in `node_modules/.bin`:

```sh
./node_modules/.bin/tailorgame --help
./node_modules/.bin/tailorgame --version
./node_modules/.bin/tailorgame catalog --query bowling --category Arcade --limit 5
./node_modules/.bin/tailorgame rankings
./node_modules/.bin/tailorgame docs pricing
```

The CLI is self-contained: `node bin/tailorgame.mjs --help` works directly from this source directory. Catalog and rankings print JSON; documentation prints Markdown. Exit codes: 0 success, 1 request failure, 2 invalid usage. `--base-url http://127.0.0.1:3107` targets an explicit local test server.

## Public API

| Method | Result |
| --- | --- |
| `listGames({ query?, category?, limit? })` | `{ games }`; client-side filtering of public `/api/v1/games` |
| `getRankings()` | Four public practice-ranking lists from `/api/v1/rankings` |
| `getDocumentation(topic?)` | Markdown; `overview`, `authentication`, `pricing`, `games`, or `api` |

Categories: `Arcade`, `Cards`, `Strategy`, `Racing`. Query length is at most 200 characters. Default limit is 20; maximum is 50. The catalog includes `coming-soon` entries: inspect `status` before offering play. Rankings use client-reported practice scores, not verified competition results.

`new TailorgameClient({ baseUrl, timeoutMs })` defaults to `https://tailorgame.com` and 10,000 ms. Timeout range: 100–60,000 ms. Base URLs must be HTTPS origins, or HTTP loopback origins, with no credentials, path, query, or fragment. Requests are fixed GETs with credentials omitted, redirects refused, and a 2 MiB response limit. Custom headers, arbitrary paths, and auth options are not accepted. Retries are caller-managed.

`TailorgameError.code` is `HTTP_ERROR`, `INVALID_RESPONSE`, `TIMEOUT`, or `NETWORK_ERROR`; `status` is present for HTTP failures. Invalid arguments throw `TypeError`.

The client cannot access private profiles, rooms, briefs, generation, credits, or account mutations. Checkout and delegated agent credentials are not supplied by this SDK.

[Developer guide](https://tailorgame.com/docs) · [OpenAPI](https://tailorgame.com/openapi.json) · [Authentication](https://tailorgame.com/auth.md)
