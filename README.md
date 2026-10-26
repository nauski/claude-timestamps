# timestamps

A Claude Code mod that puts an IRC-style `[HH:MM]` in front of each of your messages and each of Claude's replies, so you can see when a session last moved.

The time is when the session stored the message. Messages from before the session started (a resumed conversation) show `[--:--]`. Only the drawing changes; the stored message stays as written.

## Install

At the prompt of a terminal session:

```
/plugin install timestamps --marketplace nauski/claude-timestamps
```

From a shell:

```
claude plugin install timestamps --marketplace nauski/claude-timestamps
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `nauski/claude-timestamps`, then Add plugin.
