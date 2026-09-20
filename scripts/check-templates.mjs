import fs from 'node:fs'
import path from 'node:path'
import { compileTemplate, parse } from 'vue/compiler-sfc'

const root = path.resolve(import.meta.dirname, '..')

// nuxt typecheck reads the script blocks; a template that cannot be parsed only surfaces
// when a host application builds. This compiles every template here instead.
const files = []
function collect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue
    const item = path.join(directory, entry.name)
    if (entry.isDirectory()) collect(item)
    else if (entry.name.endsWith('.vue')) files.push(item)
  }
}
for (const directory of ['components', 'layouts', 'pages']) collect(path.join(root, directory))

const failures = []
for (const file of files) {
  const { descriptor, errors } = parse(fs.readFileSync(file, 'utf8'), { filename: file })
  for (const error of errors) failures.push(`${path.relative(root, file)}: ${error.message}`)
  if (!descriptor.template) continue
  const compiled = compileTemplate({
    source: descriptor.template.content,
    filename: file,
    id: file,
  })
  for (const error of compiled.errors) {
    failures.push(`${path.relative(root, file)}: ${typeof error === 'string' ? error : error.message}`)
  }
}

if (failures.length) throw new Error(`Templates failed to compile:\n${failures.join('\n')}`)
console.log(`Compiled ${files.length} templates.`)
