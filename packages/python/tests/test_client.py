import io
import json
import unittest
from email.message import Message
from tailorgame import TailorgameClient, TailorgameError, VERSION


class Response(io.BytesIO):
    def __init__(self, payload):
        super().__init__(json.dumps(payload).encode())
        self.headers = Message()
        self.headers["Content-Type"] = "application/json"


class ClientTests(unittest.TestCase):
    def test_public_projection_and_request(self):
        client = TailorgameClient()
        game = dict(id="id/with spaces", name="Neon Bowling", description="A timing challenge", category="Arcade", players="1", status="playable", tags=["bowling"], image="/images/bowling.webp", playCount=1, visibility="public", ownerId="must-not-leak")

        class Opener:
            def open(inner_self, request, timeout):
                self.assertEqual(request.full_url, "https://tailorgame.com/api/v1/games")
                self.assertEqual(request.get_method(), "GET")
                self.assertIsNone(request.get_header("Authorization"))
                self.assertIsNone(request.get_header("Cookie"))
                self.assertEqual(timeout, 10)
                return Response({"games": [game, dict(game, id="private", visibility="private")]})

        client._opener = Opener()
        result = client.list_games(query="bowling", category="Arcade", limit=5)
        self.assertEqual(len(result["games"]), 1)
        self.assertEqual(result["games"][0]["url"], "https://tailorgame.com/games?play=id%2Fwith%20spaces")
        self.assertNotIn("must-not-leak", json.dumps(result))

    def test_bounds_before_network(self):
        client = TailorgameClient()
        for limit in (0, 51, True):
            with self.assertRaises(ValueError):
                client.list_games(limit=limit)
        with self.assertRaises(ValueError):
            client._read("/api/profile")
        with self.assertRaises(ValueError):
            TailorgameClient("https://user:password@tailorgame.com")
        self.assertEqual(VERSION, "1.0.0")

    def test_invalid_rankings_payload(self):
        client = TailorgameClient()

        class Opener:
            def open(self, request, timeout):
                return Response({"unexpected": "private diagnostic detail"})

        client._opener = Opener()
        with self.assertRaises(TailorgameError) as caught:
            client.get_rankings()
        self.assertEqual(caught.exception.code, "INVALID_RESPONSE")
        self.assertNotIn("private diagnostic", str(caught.exception))


if __name__ == "__main__":
    unittest.main()
