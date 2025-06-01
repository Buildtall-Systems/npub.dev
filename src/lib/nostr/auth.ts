import { nip19 } from 'nostr-tools'

export async function nip07GetPubkey() {
  if (typeof window === 'undefined' || !(window as any).nostr) return null

  let provider: any = (window as any).nostr
  if (typeof provider.enable === 'function') {
    provider = await provider.enable()
  }

  if (typeof provider.getPublicKey !== 'function') return null

  const pk = await provider.getPublicKey()

  if (/^[0-9a-f]{64}$/i.test(pk)) return pk

  try {
    const { data, type } = nip19.decode(pk)
    return type === 'npub' ? data : null
  } catch {
    return null
  }
}

export async function nip46GetPubkey(uri: string) {
  if (!uri.startsWith('nostrconnect://') && !uri.startsWith('bunker://')) return null
  
  try {
    const url = new URL(uri)
    const pubkey = url.hostname
    
    if (/^[0-9a-f]{64}$/i.test(pubkey)) return pubkey
    
    return null
  } catch {
    return null
  }
}
