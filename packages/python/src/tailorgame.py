"""Tailorgame public read-only Python SDK. Python 3.9+, standard library only."""
import json
import socket
import ssl
import urllib.error
import urllib.parse
import urllib.request
from typing import Any, Dict, Optional

VERSION = "1.0.0"
_MAX_RESPONSE_BYTES = 2 * 1024 * 1024
_CATEGORIES = ("Arcade", "Cards", "Strategy", "Racing")
_DOCUMENTS = {"overview": "/index.md", "authentication": "/auth.md", "pricing": "/pricing.md", "games": "/docs/games.md", "api": "/docs/api.md"}
_READ_PATHS = ("/api/v1/games", "/api/v1/rankings", *_DOCUMENTS.values())


class TailorgameError(Exception):
    def __init__(self, code: str, message: str, status: Optional[int] = None):
        super().__init__(message)
        self.code = code
        self.status = status


class _NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def _origin(value: str) -> str:
    try:
        if not isinstance(value, str) or any(ord(char) < 33 for char in value):
            raise ValueError()
        url = urllib.parse.urlsplit(value)
        port = url.port
        loopback = url.scheme == "http" and url.hostname in ("localhost", "127.0.0.1", "::1")
        if (url.scheme != "https" and not loopback) or not url.hostname or url.username is not None or url.password is not None or url.path not in ("", "/") or url.query or url.fragment:
            raise ValueError()
        host = "[" + url.hostname + "]" if ":" in url.hostname else url.hostname
        return url.scheme + "://" + host + ((":" + str(port)) if port else "")
    except (ValueError, TypeError, AttributeError):
        raise ValueError("base_url must be an HTTPS origin or an HTTP loopback origin, without credentials, path, query or fragment.") from None


class TailorgameClient:
    """Fixed GET endpoints, no credentials, no redirects and bounded responses."""

    def __init__(self, base_url: str = "https://tailorgame.com", timeout: float = 10.0):
        self._base_url = _origin(base_url)
        if isinstance(timeout, bool) or not isinstance(timeout, (int, float)) or not 0.1 <= timeout <= 60:
            raise ValueError("timeout must be between 0.1 and 60 seconds.")
        self._timeout = timeout
        # A separate opener cannot inherit a caller's global cookie/auth handlers.
        # Disable environment proxy credentials as well as redirect following.
        self._opener = urllib.request.build_opener(_NoRedirect(), urllib.request.ProxyHandler({}), urllib.request.HTTPSHandler(context=ssl.create_default_context()))

    @property
    def base_url(self) -> str:
        return self._base_url

    @property
    def timeout(self) -> float:
        return self._timeout

    def _read(self, path: str, markdown: bool = False) -> Any:
        if path not in _READ_PATHS:
            raise ValueError("Only fixed public read endpoints are supported.")
        accept = "text/markdown, text/plain;q=0.9" if markdown else "application/json"
        request = urllib.request.Request(self.base_url + path, headers={"Accept": accept, "User-Agent": "TailorgamePublicSDK/" + VERSION}, method="GET")
        try:
            with self._opener.open(request, timeout=self.timeout) as response:
                content_type = response.headers.get_content_type()
                if content_type not in (("text/markdown", "text/plain") if markdown else ("application/json",)):
                    raise TailorgameError("INVALID_RESPONSE", "The public endpoint returned an unexpected content type.")
                raw = response.read(_MAX_RESPONSE_BYTES + 1)
                if len(raw) > _MAX_RESPONSE_BYTES:
                    raise TailorgameError("INVALID_RESPONSE", "The public response exceeds the SDK size limit.")
                try:
                    text = raw.decode("utf-8")
                except UnicodeError:
                    raise TailorgameError("INVALID_RESPONSE", "The public endpoint returned invalid text.") from None
                if markdown:
                    if not text.strip():
                        raise TailorgameError("INVALID_RESPONSE", "The documentation response is empty.")
                    return text
                try:
                    data = json.loads(text)
                except ValueError:
                    raise TailorgameError("INVALID_RESPONSE", "The public endpoint returned invalid JSON.") from None
                if not isinstance(data, dict):
                    raise TailorgameError("INVALID_RESPONSE", "The public endpoint returned an unexpected response.")
                return data
        except urllib.error.HTTPError as error:
            status = error.code
            error.close()
            raise TailorgameError("HTTP_ERROR", "Tailorgame public request failed (HTTP " + str(status) + "). Redirects are not followed.", status) from None
        except (socket.timeout, TimeoutError):
            raise TailorgameError("TIMEOUT", "The Tailorgame public request timed out.") from None
        except urllib.error.URLError as error:
            if isinstance(error.reason, (socket.timeout, TimeoutError)):
                raise TailorgameError("TIMEOUT", "The Tailorgame public request timed out.") from None
            raise TailorgameError("NETWORK_ERROR", "The Tailorgame public request could not be completed.") from None
        except (OSError, UnicodeError):
            raise TailorgameError("NETWORK_ERROR", "The Tailorgame public request could not be completed.") from None

    def list_games(self, query: str = "", category: Optional[str] = None, limit: int = 20) -> Dict[str, Any]:
        if not isinstance(query, str) or len(query) > 200:
            raise ValueError("query must contain at most 200 characters.")
        if category is not None and category not in _CATEGORIES:
            raise ValueError("category must be Arcade, Cards, Strategy or Racing.")
        if isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= 50:
            raise ValueError("limit must be an integer from 1 to 50.")
        data = self._read("/api/v1/games")
        games = data.get("games")
        if not isinstance(games, list) or any(not isinstance(game, dict) or not all(isinstance(game.get(key), str) for key in ("id", "name", "description")) or not isinstance(game.get("tags"), list) or any(not isinstance(tag, str) for tag in game["tags"]) or game.get("category") not in _CATEGORIES or game.get("status") not in ("playable", "coming-soon") for game in games):
            raise TailorgameError("INVALID_RESPONSE", "The public catalog returned an unexpected response.")
        query = query.strip().lower()
        visible = [game for game in games if game.get("visibility") == "public" and (not category or game["category"] == category) and (not query or query in (game["name"] + " " + game["description"] + " " + " ".join(game["tags"])).lower())][:limit]
        fields = ("id", "name", "description", "category", "players", "status", "tags", "image", "playCount")
        projected = []
        for game in visible:
            public = {key: game[key] for key in fields if key in game}
            if isinstance(game.get("instructions"), str) and game["instructions"]:
                public["instructions"] = game["instructions"]
            for key in ("uniquePlayerCount", "loveCount"):
                if isinstance(game.get(key), (int, float)) and not isinstance(game[key], bool):
                    public[key] = game[key]
            public["url"] = self.base_url + "/games?play=" + urllib.parse.quote(game["id"], safe="")
            projected.append(public)
        return {"games": projected}

    def get_rankings(self) -> Dict[str, Any]:
        data = self._read("/api/v1/rankings")
        keys = ("mostPlayedGames", "mostLovedGames", "mostActivePlayers", "highestScoringPlayers")
        if any(not isinstance(data.get(key), list) for key in keys):
            raise TailorgameError("INVALID_RESPONSE", "The public rankings returned an unexpected response.")
        return {key: data[key] for key in keys}

    def get_documentation(self, topic: str = "overview") -> str:
        if not isinstance(topic, str) or topic not in _DOCUMENTS:
            raise ValueError("topic must be overview, authentication, pricing, games or api.")
        return self._read(_DOCUMENTS[topic], markdown=True)
