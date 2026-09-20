import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const iconsPath = path.join(root, 'node_modules/@iconify-json/solar/icons.json')

if (!fs.existsSync(iconsPath)) {
  throw new Error('@iconify-json/solar is not installed, so icon names cannot be verified')
}

const solar = JSON.parse(fs.readFileSync(iconsPath, 'utf8'))

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

const missing = new Set()
for (const file of files) {
  const source = fs.readFileSync(file, 'utf8')
  for (const match of source.matchAll(/solar:([a-z0-9-]+)/g)) {
    if (!solar.icons[match[1]]) missing.add(match[1])
  }
}

if (missing.size) throw new Error(`Unknown Solar icons: ${[...missing].join(', ')}`)
console.log(`Verified Solar icon names across ${files.length} files.`)
