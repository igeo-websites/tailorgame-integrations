/** Declarations for the public Tailorgame SDK. The SDK exposes public reads only. */
export declare const VERSION: '1.0.0'
export type GameCategory = 'Arcade' | 'Cards' | 'Strategy' | 'Racing'
export type DocumentationTopic = 'overview' | 'authentication' | 'pricing' | 'games' | 'api'
export type TailorgameErrorCode = 'HTTP_ERROR' | 'INVALID_RESPONSE' | 'TIMEOUT' | 'NETWORK_ERROR'
export interface PublicGame {
  id: string
  name: string
  description: string
  category: GameCategory
  instructions?: string
  image: string
  players: string
  tags: string[]
  status: 'playable' | 'coming-soon'
  playCount: number
  uniquePlayerCount?: number
  loveCount?: number
  url: string
}
export interface RankedGame { id: string; name: string; image: string; category: GameCategory; uniquePlayerCount: number; playCount: number; loveCount: number; rank: number }
export interface RankedPlayer { id: string; name: string; gamesPlayed: number; bestScore: number; rank: number }
export interface Rankings { mostPlayedGames: RankedGame[]; mostLovedGames: RankedGame[]; mostActivePlayers: RankedPlayer[]; highestScoringPlayers: RankedPlayer[] }
export interface ClientOptions { baseUrl?: string; timeoutMs?: number }
export interface GameFilters { query?: string; category?: GameCategory; limit?: number }
export declare class TailorgameError extends Error {
  readonly code: TailorgameErrorCode
  readonly status: number | undefined
  constructor(code: TailorgameErrorCode, message: string, status?: number)
}
export declare class TailorgameClient {
  constructor(options?: ClientOptions)
  readonly baseUrl: string
  /** Fetch the public catalog; filter locally. Defaults to 20 results, maximum 50. */
  listGames(options?: GameFilters): Promise<{ games: PublicGame[] }>
  getRankings(): Promise<Rankings>
  getDocumentation(topic?: DocumentationTopic): Promise<string>
}
