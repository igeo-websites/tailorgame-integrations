# Tailorgame Python SDK

Public read-only Tailorgame client for Python 3.9+. Uses only the standard library; no runtime dependencies, account, or API key. Distribution name: `tailorgame-sdk`. Import name: `tailorgame`.

**MIT release candidate: publication authorized, not yet published to PyPI.** The approved source repository is [igeo-websites/tailorgame-integrations](https://github.com/igeo-websites/tailorgame-integrations). Registry publishing still requires the owner's authenticated release setup.

## Install locally

Build a wheel from this directory with `python -m build`, then install that wheel into your application's virtual environment:

```sh
python -m pip install /absolute/path/to/dist/tailorgame_sdk-1.0.0-py3-none-any.whl --no-deps
```

`build` and the configured setuptools backend are development-time tools; installed SDK code has no dependencies. See the integration distribution README for the offline build command when setuptools is already available.

```python
from tailorgame import TailorgameClient, TailorgameError

client = TailorgameClient()
try:
    result = client.list_games(query="bowling", category="Arcade", limit=5)
    for game in result["games"]:
        print(game["name"], game["status"], game["url"])
    print(client.get_rankings())
    print(client.get_documentation("pricing"))
except TailorgameError as error:
    print(error.code, error.status)
```

| Method | Result |
| --- | --- |
| `list_games(query="", category=None, limit=20)` | `{ "games": [...] }`; client-side filtering of public `/api/v1/games` |
| `get_rankings()` | Four public practice-ranking lists from `/api/v1/rankings` |
| `get_documentation(topic="overview")` | Markdown; `overview`, `authentication`, `pricing`, `games`, or `api` |

Categories are `Arcade`, `Cards`, `Strategy`, `Racing`. Query length is at most 200 characters. Limit range: 1–50. Check each game's `status`: `coming-soon` does not mean playable. Practice results are client-reported and are not verified competition scores.

## Configuration and errors

`TailorgameClient(base_url="https://tailorgame.com", timeout=10.0)` accepts an HTTPS origin or an HTTP loopback origin such as `http://127.0.0.1:3107`. The origin cannot include credentials, a path, query, or fragment. Timeout is a socket-operation timeout in seconds, range 0.1–60; it is not a whole-response deadline.

Requests use fixed GET endpoints, a separate opener with no cookies/auth handlers, disabled environment proxies, no redirect following, verified TLS, and a 2 MiB response limit. There are no custom headers or auth parameters. Retries are caller-managed. `TailorgameError` exposes `code` (`HTTP_ERROR`, `INVALID_RESPONSE`, `TIMEOUT`, `NETWORK_ERROR`) and optional HTTP `status`. Invalid arguments raise `ValueError`.

This package cannot access private profiles, rooms, briefs, generation, credits, or account mutations. It does not authorize delegated agents or perform payments.

[Developer guide](https://tailorgame.com/docs) · [OpenAPI](https://tailorgame.com/openapi.json) · [Authentication](https://tailorgame.com/auth.md)
