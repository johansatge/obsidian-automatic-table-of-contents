const fs = require('node:fs')
const fsp = require('node:fs').promises
const path = require('node:path')
const manifest = require('./manifest.json')
const esbuild = require('esbuild')

const srcDir = path.join(__dirname, 'src')
const distDir = path.join(__dirname, 'dist')

build()
const isWatching = process.argv.includes('--watch')
if (isWatching) buildOnChange()

async function buildOnChange() {
  console.log(`Watching ${srcDir}`)
  fs.watch(srcDir, { recursive: true }, (evtType, file) => {
    console.log(`Event ${evtType} on ${file}, building...`)
    build()
  })
}

async function build() {
  try {
    const startTime = new Date().getTime()
    try {
      await fsp.rm(distDir, { recursive: true })
    } catch {
      // nothing
    }
    await fsp.mkdir(distDir, { recursive: true })
    await fsp.writeFile(path.join(distDir, 'manifest.json'), JSON.stringify(manifest), 'utf8')
    await fsp.writeFile(path.join(distDir, '.hotreload'), '', 'utf8')
    await buildJs()
    const endTime = new Date().getTime()
    console.log(`Built in ${endTime - startTime}ms`)
  } catch (error) {
    console.log(error.message)
    console.log(error.stack)
    if (!isWatching) {
      process.exit(1)
    }
  }
}

async function buildJs() {
  const result = await esbuild.build({
    entryPoints: [path.join(srcDir, 'main.js')],
    format: 'cjs',
    bundle: true,
    minify: true,
    entryNames: '[name]',
    external: ['obsidian'],
    outdir: distDir,
    banner: {
      js: `// ${manifest.name} ${manifest.version} (${manifest.authorUrl})`,
    },
  })
  if (result.errors.length > 0) {
    throw new Error(result.errors[0])
  }
}
