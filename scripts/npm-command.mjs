/** Invoke npm's JavaScript entry on Windows, without batch files or a shell. */
import { existsSync } from 'node:fs'
import { dirname, join, delimiter } from 'node:path'
import { spawnSync } from 'node:child_process'

export function npmInvocation(args, { platform = process.platform, env = process.env, execPath = process.execPath, exists = existsSync } = {}) {
  if (platform !== 'win32') return { file: 'npm', args }
  const searchPath = Object.entries(env).find(([key]) => key.toLowerCase() === 'path')?.[1] ?? ''
  const directories = [dirname(execPath), ...searchPath.split(platform === 'win32' ? ';' : delimiter)]
  const candidates = [
    ...(env.npm_execpath?.replaceAll('\\', '/').endsWith('/npm-cli.js') ? [env.npm_execpath] : []),
    ...directories.filter(Boolean).map(dir => join(dir, 'node_modules', 'npm', 'bin', 'npm-cli.js')),
  ]
  const cli = candidates.find(exists)
  if (!cli) throw Error('Cannot locate npm-cli.js beside Node or on PATH; install npm with this Node runtime.')
  return { file: execPath, args: [cli, ...args] }
}

export function npmSync(args, options = {}) {
  const { file, args: argv } = npmInvocation(args, { env: options.env ?? process.env })
  return spawnSync(file, argv, { encoding: 'utf8', timeout: 120_000, ...options, shell: false })
}

export function checkedNpm(args, options = {}) {
  const result = npmSync(args, options)
  if (result.error || result.status !== 0) throw Error(`npm ${args[0]} failed: ${result.error?.message ?? result.stderr}`)
  return result.stdout
}
