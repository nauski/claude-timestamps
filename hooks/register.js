import { atom, read, update } from 'claude-code'

// Row uuid -> epoch ms when this session stored the row. In $.state so a
// reload keeps it; /clear, /resume and /branch reset it.
// ponytail: rows stored before this session (resumed history) show [--:--];
// the transcript JSONL has their real timestamps if that ever matters.
const times = atom({ plugin: 'timestamps', key: 'times' }, {})

const hhmm = (ms) => {
  const d = new Date(ms)
  return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0')
}

export function register(on) {
  // Fires once per row the main conversation stores, never for a redraw
  on('session.append', async ($, e, next) => {
    const kind = e.message.type
    if (!e.agentId && (kind === 'user' || kind === 'assistant')) {
      const now = await $.clock.now()
      await update($, times, (m) => ({ ...m, [e.uuid]: now }))
    }
    return next(e)
  })

  on('ui.render', { component: ['UserMessage', 'AssistantMessage'] }, async ($, e, next) => {
    // A reply has one row per text block; stamp only the first
    if (e.component === 'AssistantMessage' && !e.props.isFirstOfReply) return next(e)
    const stored = (await read($, times))[e.requestId]
    // The prompt row Claude Code draws before storing it is 'placeholder'
    const t = stored ?? (e.requestId === 'placeholder' ? await $.clock.now() : null)
    const stamp = t == null ? '[--:--]' : '[' + hhmm(t) + ']'
    // Stamp the text, not a wrapper Box: the engine's row opens with a spacer
    // line, and a Box puts the stamp beside the spacer instead of the message.
    // A reply that opens with a block (heading, fence, list, table, quote)
    // gets the stamp on its own line so the markdown still parses.
    const block = e.component === 'AssistantMessage' && /^(#|```|[-*+] |\d+\. |\||>)/.test(e.props.text)
    return next({ ...e, props: { ...e.props, text: stamp + (block ? '\n' : ' ') + e.props.text } })
  })
}
