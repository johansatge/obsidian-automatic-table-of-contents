import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import esbuild from 'esbuild'
import manifest from './manifest.json' assert { type: 'json' }

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const srcDir = path.join(__dirname, 'src')

build()
const isWatching = process.argv.includes('--watch')
if (isWatching) buildOnChange()

async function buildOnChange(): Promise<void> {
  console.log(`Watching ${srcDir}`)
  fs.watch(srcDir, { recursive: true }, (evtType, file) => {
    console.log(`Event ${evtType} on ${file}, building...`)
    build()
  })
}

async function build(): Promise<void> {
  try {
    const startTime = new Date().getTime()
    await buildJs()
    const endTime = new Date().getTime()
    console.log(`Built in ${endTime - startTime}ms`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const stack = error instanceof Error ? error.stack : ''
    console.log(message)
    console.log(stack)
    if (!isWatching) {
      process.exit(1)
    }
  }
}

async function buildJs(): Promise<void> {
  const result = await esbuild.build({
    entryPoints: [path.join(srcDir, 'main.ts')],
    format: 'cjs',
    bundle: true,
    minify: true,
    entryNames: '[name]',
    external: ['obsidian'],
    outdir: __dirname,
    banner: {
      js: `// ${manifest.name} ${manifest.version} (${manifest.authorUrl})`,
    },
  })
  if (result.errors.length > 0) {
    throw new Error(result.errors[0].text)
  }
}
