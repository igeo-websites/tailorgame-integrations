# Tailorgame public integrations

Standalone MIT-licensed release candidates for Tailorgame's existing public, read-only API. The source is published in [igeo-websites/tailorgame-integrations](https://github.com/igeo-websites/tailorgame-integrations), with its [initial public commit](https://github.com/igeo-websites/tailorgame-integrations/commit/37ff3b1ff6a690386eb197deaf64d40076dc273c) verified on November 6, 2026. This directory contains no application backend, deployment configuration, user records, credentials, or private repository history.

**Status: source public under MIT; packages not yet published to npm or PyPI.** The owner approved the public integration files and package name `tailorgame-sdk`. npm and PyPI both returned HTTP 404 for that name on November 6, 2026; this was not a reservation. The application repository remains private and outside this license grant. Publisher authentication and registry setup are still required for registry releases, not for players or public API use; see [publishing setup](PUBLISHING.md).

| Directory | Deliverable |
| --- | --- |
| `packages/javascript/` | `tailorgame-sdk`, ESM JavaScript with TypeScript declarations and self-contained `tailorgame` CLI |
| `packages/python/` | `tailorgame-sdk`, Python 3.9+ standard-library client imported as `tailorgame` |
| `skills/`, `.claude-plugin/`, `.cursor/rules/` | Canonical public skill, root Claude Code plugin, and Cursor rule |
| `agent-configs/` | Standalone copies for manual setup and the minimal plugin ZIP |

## What these clients do

List public games, read public practice rankings, and retrieve public documentation from `https://tailorgame.com`. Calls use fixed GET endpoints without credentials. They do not implement private account access, account mutations, paid generation, or payments. Catalog entries can be `coming-soon`; check their status. Rankings contain client-reported practice results.

The [JavaScript package README](packages/javascript/README.md) and [Python package README](packages/python/README.md) contain working local-install examples, method signatures, timeout limits, and error handling. [Agent setup](agent-configs/README.md) explains optional assistant configuration. The GitHub archives are published downloads. npm/PyPI registry publication remains separate and pending.

## Install the public skill

Use the [Skills CLI](https://skills.sh/docs/cli) to add the public integration skill to a supported coding agent:

```sh
npx skills add igeo-websites/tailorgame-integrations --skill tailorgame-public
```

The canonical skill lives at `skills/tailorgame-public/SKILL.md`. Review the instructions and choose your target agent when prompted. This configures public API guidance; it does not sign in to Tailorgame or install an SDK package.

A local checkout also works directly as a Claude Code plugin:

```sh
claude --plugin-dir /absolute/path/to/tailorgame-integrations
```

The plugin uses the root `.claude-plugin/plugin.json` and `skills/` directory. Invoke `/tailorgame-public:tailorgame-public`. For Cursor, copy `.cursor/rules/tailorgame-public.mdc` into your project's matching directory. Choose one skill installation method to avoid duplicate instructions. The smaller standalone plugin under `agent-configs/plugin/` and its ZIP remain available for manual distribution.

## Package downloads

The [GitHub v1.0.0 release](https://github.com/igeo-websites/tailorgame-integrations/releases/tag/v1.0.0) is published. Both downloads were verified against their reviewed hashes and installed cleanly. No publisher account is needed to install them; npm/PyPI registry publication is still pending.

```sh
npm install --ignore-scripts https://github.com/igeo-websites/tailorgame-integrations/releases/download/v1.0.0/tailorgame-sdk-1.0.0.tgz
./node_modules/.bin/tailorgame --help
python -m pip install https://github.com/igeo-websites/tailorgame-integrations/releases/download/v1.0.0/tailorgame_sdk-1.0.0-py3-none-any.whl
```

## Validate and package locally

Use Node.js 24.12+ for npm and the CLI, Python 3.9+ for the client, and an environment with setuptools 77.0.3+ to build the Python distribution. No application build or production service is required. From this directory:

```sh
npm --prefix packages/javascript test
PYTHONPATH=packages/python/src python3 -m unittest discover -s packages/python/tests
cd packages/javascript
npm pack --dry-run --json --ignore-scripts
npm pack --ignore-scripts
```

The npm tarball includes only the client, declarations, CLI, README, license, and package manifest. Test scripts and repository configuration stay out. For Python, from `packages/python/`:

```sh
# Standard packaging frontend, when build and the backend are installed:
python3 -m build --no-isolation
# Offline wheel build with an already-installed setuptools backend:
python3 -m pip wheel --no-deps --no-build-isolation --no-index --wheel-dir dist .
```

Inspect both tarball and wheel file lists before distributing them. Install the resulting tarball/wheel into a temporary application or virtual environment and test the imports and CLI. Do not add publishing credentials to this directory. No package install or build hook performs network calls.

For GitHub validation without registry credentials, manually run **Publish Tailorgame SDKs** with `registry: verify` (the default) and version `1.0.0`. This runs the build/tests and uploads inspectable package artifacts; both publishing jobs are skipped. See [verify-only CI](PUBLISHING.md#verify-without-registry-authentication).

## Source synchronization

Runtime code is copied from the already-public website downloads: JavaScript `.mjs`, `.d.mts` and `.d.ts`, Python `tailorgame.py`, and the self-contained Node CLI. SDK source and declarations are byte-for-byte copies. The CLI changes only its usage/help text to show the installed `tailorgame` command.

When working alongside the application's source checkout, refresh these five allowlisted files with:

```sh
node integrations/scripts/sync-public-clients.mjs --source-root .
```

If this directory has been exported on its own, run `node scripts/sync-public-clients.mjs --source-root /path/to/source-checkout`. The script reads only the explicit `public/sdk/` and `public/cli/` files. Review the resulting diff, rerun tests, and coordinate package/source versions before release. It never copies backend source or environment files.

## Release handoff

1. Keep the public integrations repository limited to this reviewed source, with build outputs and ignored files omitted. The initial source export is complete. Do not make the application's repository public or publish its history.
2. Complete the owner's npm/PyPI authentication and [trusted publisher setup](PUBLISHING.md). The included manual workflow uses separate `npm` and `pypi` publishing environments and uploads already-built artifacts through OIDC. Environment reviewers are optional unless already required by the organization; this release is authorized. No registry credentials are included.
3. Inspect the exact package contents and the hashes/file lists in `release-manifest.json`. Recheck registry ownership and matching versions before publishing.
4. After successful registry publication, verify a fresh registry install, update install instructions to the registry package, and update any directory listing with the actual package/repository URLs. Until then, continue describing these as authorized release candidates.

## Primary references

- [npm package manifest](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/) and [npm pack](https://docs.npmjs.com/cli/v11/commands/npm-pack/)
- [Python packaging tutorial](https://packaging.python.org/en/latest/tutorials/packaging-projects/), [pyproject.toml guide](https://packaging.python.org/en/latest/guides/writing-pyproject-toml/), and [setuptools configuration](https://setuptools.pypa.io/en/latest/userguide/pyproject_config.html)
- [Tailorgame developer guide](https://tailorgame.com/docs), [OpenAPI contract](https://tailorgame.com/openapi.json), and [documentation index](https://tailorgame.com/llms.txt)
