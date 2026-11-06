# Tailorgame integration repository

This repository distributes the public JavaScript/TypeScript client, Node CLI, Python client, and assistant guidance. Read README.md for installation and PUBLISHING.md for current release status. Keep account APIs, credentials, application backend code, and deployment settings outside this public repository.

Preserve fixed public GET endpoints, omitted credentials, rejected redirects, and the clients' 2 MiB response limit. Test error, empty, and coming-soon responses with fixtures; only perform live checks when the task calls for them. Practice rankings are client-reported, not verified competition results.

SDK implementations mirror the website's public downloads. When an authorized application checkout is available, use scripts/sync-public-clients.mjs with its explicit --source-root argument; review the resulting five-file diff. Do not introduce independent implementation changes that leave those sources out of sync.

From the repository root, validate client changes with:

```sh
npm --prefix packages/javascript test
PYTHONPATH=packages/python/src python3 -m unittest discover -s packages/python/tests
```

Use Node.js 24.12+ and Python 3.9+. Keep root plugin.json metadata consistent with .claude-plugin/plugin.json and the standalone agent-configs/plugin/ copies. Keep the canonical skills/tailorgame-public/SKILL.md and standalone skill copies synchronized. Inspect package file lists before release; distinguish local validation, GitHub downloads, and npm/PyPI publication in reports.
