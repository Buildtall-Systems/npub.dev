import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/svelte/svelte5'
import RelayListView from './RelayListView.svelte'
import * as relayStore from '$lib/stores/relayListStore'

describe('RelayListView', () => {
  it('renders empty state when no relays are present', () => {
    vi.spyOn(relayStore, 'relayListStore', 'get').mockReturnValue({
      subscribe: vi.fn(fn => {
        fn([])
        return () => {}
      }),
      set: vi.fn(),
      update: vi.fn()
    } as any)
    
    render(RelayListView)
    
    expect(screen.getByTestId('empty-state')).toBeTruthy()
    expect(screen.getByText('No Relay List Configured')).toBeTruthy()
    expect(screen.getByText('Your NIP-65 relay list helps others find your content on Nostr')).toBeTruthy()
    expect(screen.getByText('Improved discoverability')).toBeTruthy()
    expect(screen.getByText('Better performance')).toBeTruthy()
  })

  it('renders relay lists when relays are present', () => {
    vi.spyOn(relayStore, 'relayListStore', 'get').mockReturnValue({
      subscribe: vi.fn(fn => {
        fn([
          { url: 'wss://relay1.com', read: true, write: false },
          { url: 'wss://relay2.com', read: false, write: true }
        ])
        return () => {}
      }),
      set: vi.fn(),
      update: vi.fn()
    } as any)
    
    render(RelayListView)
    
    expect(screen.getByTestId('read-list')).toBeTruthy()
    expect(screen.getByTestId('write-list')).toBeTruthy()
    expect(screen.getByText('wss://relay1.com')).toBeTruthy()
    expect(screen.getByText('wss://relay2.com')).toBeTruthy()
  })
})
