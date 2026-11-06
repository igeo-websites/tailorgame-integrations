# Tailorgame public Claude Code plugin

One public integration skill, licensed under MIT. Public distribution is authorized; no marketplace publication is claimed. No hooks, background processes, MCP configuration, credential prompts, or automatically approved tools. See LICENSE.

Load this reviewed directory for a single local session:

```sh
claude --plugin-dir /absolute/path/to/plugin
```

Invoke `/tailorgame-public:tailorgame-public` and ask for a public catalog or practice-ranking integration. For a standalone project skill instead, use the `.claude/skills/tailorgame-public/` copy from the parent agent-configs directory; do not install both copies into the same project.

The manifest follows [Claude Code's official plugin manifest format](https://code.claude.com/docs/en/plugins/manifest-reference). The skill lives at the standard `skills/tailorgame-public/SKILL.md` location. Run `claude plugin validate /absolute/path/to/plugin` with an installed Claude Code version that supports plugins; runtime discovery has not been verified merely by creating the manifest.
