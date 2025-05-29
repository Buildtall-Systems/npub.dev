import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/svelte/svelte5'
import { page } from '$app/stores'
import RelaysPage from './+page.svelte'
import * as authStore from '$lib/stores/authStore'
import * as relayStore from '$lib/stores/relayListStore'

vi.mock('$app/stores', () => {
  const page = {
    subscribe: vi.fn()
  }
  return { page }
})

describe('RelaysPage', () => {
  beforeEach(() => {
    vi.spyOn(authStore, 'authStore', 'get').mockReturnValue({
      subscribe: vi.fn(fn => {
        fn({ pubkey: 'test-pubkey', npub: 'test-npub', signerType: 'test-signer' })
        return () => {}
      }),
      set: vi.fn(),
      update: vi.fn()
    } as any)
    
    vi.spyOn(relayStore, 'relayListStore', 'get').mockReturnValue({
      subscribe: vi.fn(fn => {
        fn([
          { url: 'wss://relay1.com', read: true, write: false }
        ])
        return () => {}
      }),
      set: vi.fn(),
      update: vi.fn()
    } as any)
  })

  it('renders the relay page with RelayListView component', () => {
    const { getByTestId, getByText } = render(RelaysPage)
    
    expect(getByTestId('relay-page')).toBeTruthy()
    expect(getByText('Your Relay List')).toBeTruthy()
  })
}) 