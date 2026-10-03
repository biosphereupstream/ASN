import { argon2id } from 'hash-wasm'

function b64ToUint8(b64: string): Uint8Array {
  let padded = b64
  while (padded.length % 4 !== 0) padded += '='
  if (typeof Buffer !== 'undefined') {
    return Uint8Array.from(Buffer.from(padded, 'base64'))
  }
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export async function hashPassword(password: string): Promise<string> {
  if (typeof Bun !== 'undefined' && Bun.password?.hash) {
    return await Bun.password.hash(password, {
      algorithm: 'argon2id',
      memoryCost: 19456,
      timeCost: 2
    })
  }

  const salt = new Uint8Array(16)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(salt)
  } else {
    for (let i = 0; i < 16; i++) {
      salt[i] = Math.floor(Math.random() * 256)
    }
  }

  return await argon2id({
    password,
    salt,
    iterations: 2,
    memorySize: 19456,
    parallelism: 1,
    hashLength: 32,
    outputType: 'encoded'
  })
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (typeof Bun !== 'undefined' && Bun.password?.verify) {
    return await Bun.password.verify(password, hash).catch(() => false)
  }

  try {
    const parts = hash.split('$')
    if (parts.length < 6 || !parts[1]?.startsWith('argon2')) {
      return false
    }

    const params = Object.fromEntries(
      parts[3].split(',').map((kv) => {
        const [k, v] = kv.split('=')
        return [k, parseInt(v, 10)]
      })
    )

    const m = params.m || 19456
    const t = params.t || 2
    const p = params.p || 1
    const salt = b64ToUint8(parts[4])

    const recomputed = await argon2id({
      password,
      salt,
      iterations: t,
      memorySize: m,
      parallelism: p,
      hashLength: 32,
      outputType: 'encoded'
    })

    return recomputed === hash
  } catch {
    return false
  }
}
