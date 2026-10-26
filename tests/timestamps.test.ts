import { expect, mock, test } from 'claude-code/testing'

// The kit cannot fire session.append (it skips any stub that answers it), so
// recording is checked live; these cover drawing. 'placeholder' is the one id
// the mod stamps without a stored row.

const site = (component, requestId: string, props) => ({
  plugin: 'timestamps', component, surface: 'terminal', requestId,
  viewport: { columns: 100, rows: 30 }, props,
}) as const
const user = (id: string) => site('UserMessage', id, { text: 'hi', origin: { kind: 'composer' }, isExpanded: false })
const reply = (id: string, isFirstOfReply = true, text = 'hello') => site('AssistantMessage', id, { text, isFirstOfReply })

const STAMP = /^\[\d\d:\d\d\]$/
const NONE = '[--:--]'

function stubs(on) {
  on('ui.render', ($, e) => ({ type: 'Text', props: {}, children: [e.props.text] }))
  return mock.clock(on, { now: Date.UTC(2026, 9, 5, 12, 0) })
}

async function drawn($, s) {
  const ui = await $.ui.mount(s)
  const t = await ui.find({ type: 'Text' })
  await ui.unmount()
  return String(t?.children?.[0])
}
const stampOf = async ($, s) => (await drawn($, s)).match(/^\[[\d-]{2}:[\d-]{2}\]/)?.[0]

test('a row this session never stored gets no time', async ($, on) => {
  stubs(on)
  expect(await stampOf($, user('history'))).toBe(NONE)
  expect(await stampOf($, reply('history'))).toBe(NONE)
})

test('the unstored prompt placeholder gets the current time', async ($, on) => {
  stubs(on)
  expect(await stampOf($, user('placeholder'))).toMatch(STAMP)
})

test('only the first block of a reply is stamped', async ($, on) => {
  stubs(on)
  expect(await stampOf($, reply('placeholder', false))).toBeUndefined()
})

test('a reply that opens with a heading gets the stamp on its own line', async ($, on) => {
  stubs(on)
  expect(await drawn($, reply('placeholder', true, '# Title'))).toMatch(/^\[\d\d:\d\d\]\n# Title$/)
})
