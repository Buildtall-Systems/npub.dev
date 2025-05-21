import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/svelte'
import RelayListView from './RelayListView.svelte'
import * as relayStore from '$lib/stores/relayListStore'

describe('RelayListView', () => {
  it('renders empty state when no relays are present', () => {
    vi.spyOn(relayStore, 'relayListStore', 'get').mockReturnValue({
      subscribe: fn => {
        fn([])
        return { unsubscribe: () => {} }
      }
    })
    
    render(RelayListView)
    
    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    expect(screen.getByText('No Relay List Configured')).toBeInTheDocument()
    expect(screen.getByText('Your NIP-65 relay list helps others find your content on Nostr')).toBeInTheDocument()
    expect(screen.getByText('Improved discoverability')).toBeInTheDocument()
    expect(screen.getByText('Better performance')).toBeInTheDocument()
  })

  it('renders relay lists when relays are present', () => {
    vi.spyOn(relayStore, 'relayListStore', 'get').mockReturnValue({
      subscribe: fn => {
        fn([
          { url: 'wss://relay1.com', read: true, write: false },
          { url: 'wss://relay2.com', read: false, write: true }
        ])
        return { unsubscribe: () => {} }
      }
    })
    
    render(RelayListView)
    
    expect(screen.getByTestId('read-list')).toBeInTheDocument()
    expect(screen.getByTestId('write-list')).toBeInTheDocument()
    expect(screen.getByText('wss://relay1.com')).toBeInTheDocument()
    expect(screen.getByText('wss://relay2.com')).toBeInTheDocument()
  })
})
