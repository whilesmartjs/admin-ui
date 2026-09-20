import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const target = path.join(root, 'messages/en.json')

const files = []
function collect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
    const item = path.join(directory, entry.name)
    if (entry.isDirectory()) collect(item)
    else if (/\.(vue|ts)$/.test(entry.name)) files.push(item)
  }
}
for (const directory of ['components', 'composables', 'pages']) collect(path.join(root, directory))

// Only literal calls are collected. A computed key cannot be listed here, so admin strings
// are always written out in full at the call site.
const found = new Set()
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8')
  for (const match of source.matchAll(/\bt\(\s*(["'])((?:[^\\]|\\.)*?)\1/g)) {
    found.add(match[2].replace(/\\(['"])/g, '$1'))
  }
}

const messages = Object.fromEntries([...found].sort().map((text) => [text, text]))

if (process.argv.includes('--write')) {
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, `${JSON.stringify(messages, null, 2)}\n`)
  console.log(`Wrote ${Object.keys(messages).length} messages to messages/en.json`)
} else {
  const current = fs.existsSync(target) ? JSON.parse(fs.readFileSync(target, 'utf8')) : {}
  const missing = Object.keys(messages).filter((key) => !(key in current))
  const stale = Object.keys(current).filter((key) => !(key in messages))
  if (missing.length || stale.length) {
    throw new Error(
      `messages/en.json is out of date, run "npm run messages".\nMissing: ${JSON.stringify(missing)}\nStale: ${JSON.stringify(stale)}`,
    )
  }
  console.log(`Verified ${Object.keys(messages).length} messages against messages/en.json`)
}
