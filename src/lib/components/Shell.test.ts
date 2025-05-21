import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/svelte'
import { page } from '$app/stores'
import Shell from './Shell.svelte'
import * as authStore from '$lib/stores/authStore'

vi.mock('$app/stores', () => {
  const page = {
    url: { pathname: '/relays' },
    subscribe: fn => {
      fn({ url: { pathname: '/relays' } })
      return () => {}
    }
  }
  return { page }
})

describe('Shell', () => {
  beforeEach(() => {
    vi.spyOn(authStore, 'authStore', 'get').mockReturnValue({
      subscribe: fn => {
        fn({ pubkey: 'test-pubkey', npub: 'test-npub', signerType: 'test-signer' })
        return () => {}
      }
    })
  })

  it('renders the shell with navigation when authenticated', () => {
    const { getByText, getByTestId } = render(Shell, {
      props: {
        $$slots: {
          default: () => '<div data-testid="slot-content">Test Content</div>'
        }
      }
    })
    
    expect(getByText('Dashboard')).toBeTruthy()
    expect(getByTestId('relays-nav-link')).toBeTruthy()
    expect(getByText('Relay List')).toBeTruthy()
    expect(getByTestId('slot-content')).toBeTruthy()
  })

  it('just renders the slot content when not authenticated', () => {
    vi.spyOn(authStore, 'authStore', 'get').mockReturnValue({
      subscribe: fn => {
        fn({ pubkey: '', npub: '', signerType: '' })
        return () => {}
      }
    })

    const { queryByText, getByTestId } = render(Shell, {
      props: {
        $$slots: {
          default: () => '<div data-testid="slot-content">Test Content</div>'
        }
      }
    })
    
    expect(queryByText('Dashboard')).toBeNull()
    expect(getByTestId('slot-content')).toBeTruthy()
  })
}) 