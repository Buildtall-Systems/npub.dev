import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/svelte/svelte5'
import { page } from '$app/stores'
import Shell from './Shell.svelte'
import * as authStore from '$lib/stores/authStore'

vi.mock('$app/stores', () => {
  const page = {
    url: { pathname: '/relays' },
    subscribe: vi.fn(fn => {
      fn({ url: { pathname: '/relays' } })
      return () => {}
    })
  }
  return { page }
})

describe('Shell', () => {
  beforeEach(() => {
    vi.spyOn(authStore, 'authStore', 'get').mockReturnValue({
      subscribe: vi.fn(fn => {
        fn({ pubkey: 'test-pubkey', npub: 'test-npub', signerType: 'test-signer' })
        return () => {}
      }),
      set: vi.fn(),
      update: vi.fn()
    } as any)
  })

  it('renders the shell with navigation when authenticated', () => {
    const { getByText, getByTestId } = render(Shell)
    
    expect(getByText('Dashboard')).toBeTruthy()
    expect(getByTestId('relays-nav-link')).toBeTruthy()
    expect(getByText('Relay List')).toBeTruthy()
  })

  it('just renders the slot content when not authenticated', () => {
    vi.spyOn(authStore, 'authStore', 'get').mockReturnValue({
      subscribe: vi.fn(fn => {
        fn({ pubkey: '', npub: '', signerType: '' })
        return () => {}
      }),
      set: vi.fn(),
      update: vi.fn()
    } as any)

    const { queryByText } = render(Shell)
    
    expect(queryByText('Dashboard')).toBeNull()
  })
}) 