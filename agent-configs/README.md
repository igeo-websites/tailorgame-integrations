# Public coding-assistant configuration

Optional, local configuration for coding against Tailorgame's public read-only API. These MIT-licensed files do not configure credentials, install executable tools, enable MCP connections, or authorize account operations. Their public distribution is authorized; they are not marketplace listings.

The repository root provides the portable `plugin.json`, canonical `skills/tailorgame-public/SKILL.md`, Claude compatibility `.claude-plugin/plugin.json`, repository instructions `.claude/CLAUDE.md`, and `.cursor/rules/tailorgame-public.mdc`. See the [root installation instructions](../README.md#install-the-public-skill) for Skills CLI installation or loading the whole checkout as a plugin. The copies below remain available for standalone setup.

## Claude Code project skill

Copy the reviewed `.claude/skills/tailorgame-public/` directory into your own project's `.claude/skills/`. This creates `/tailorgame-public` and makes the skill discoverable for relevant public integration tasks. Preserve any existing project skill of the same name rather than overwriting it without review.

Example request: “Use /tailorgame-public to add a public game picker with a playable-only filter and empty/error states.”

## Portable Agent Plugin

The standalone `plugin/plugin.json` declares Agent Plugins 1.0.0 using `https://agent-plugins.org/schemas/1.0.0/plugin.schema.json`. Compatible clients discover its skill from `plugin/skills/`. The portable manifest contains identity metadata only; no connections, hooks, permissions, or private actions are configured. Client support and installation are separate from manifest validation.

## Claude Code plugin

Alternatively, load `plugin/` for one session with `claude --plugin-dir /absolute/path/to/plugin`. The skill is then `/tailorgame-public:tailorgame-public`. The plugin uses the documented `.claude-plugin/plugin.json` manifest and standard `skills/` discovery. It has no hooks, tools, commands, agents, or permission grants. Choose the project skill or plugin to avoid duplicate instructions.

## Cursor rule

Copy the reviewed `.cursor/rules/tailorgame-public.mdc` into your project's `.cursor/rules/`. The rule uses a description with `alwaysApply: false`, so Cursor can select it for related tasks; it can also be explicitly mentioned. It does not apply to unrelated coding work. No global Cursor settings are changed.

## Validation and source references

Schemas were checked against the official guides on November 6, 2026:

- [Agent Plugins 1.0 specification](https://agent-plugins.org/specification) and [canonical manifest schema](https://agent-plugins.org/schemas/1.0.0/plugin.schema.json)
- [Claude Code project instructions](https://code.claude.com/docs/en/memory)
- [Claude Code skills](https://code.claude.com/docs/en/skills)
- [Plugin manifest reference](https://code.claude.com/docs/en/plugins/manifest-reference)
- [Local plugin loading](https://code.claude.com/docs/en/plugins/create)
- [Cursor project rules](https://cursor.com/docs/rules)

The files intentionally use only the fields needed here. A valid local manifest is not proof of installation, marketplace acceptance, or runtime behavior in either app.
