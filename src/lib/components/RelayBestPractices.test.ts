import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import RelayBestPractices from './RelayBestPractices.svelte'

describe('RelayBestPractices', () => {
  it('renders the best practices guidance', () => {
    const { getByText } = render(RelayBestPractices)
    
    expect(getByText('Relay List Best Practices')).toBeTruthy()
    expect(getByText('Recommendations for maintaining an effective relay list')).toBeTruthy()
    
    expect(getByText('Keep the list small')).toBeTruthy()
    expect(getByText(/2-4 relays is typically sufficient/)).toBeTruthy()
    
    expect(getByText('Choose quality relays')).toBeTruthy()
    expect(getByText(/Prefer geographically close, high-uptime relays with strong reputations/)).toBeTruthy()
    
    expect(getByText("Include at least one 'big indexer'")).toBeTruthy()
    expect(getByText(/Maximizes discoverability of your content/)).toBeTruthy()
    
    expect(getByText('Review periodically')).toBeTruthy()
    expect(getByText(/Drop relays that become unreliable or censorious/)).toBeTruthy()
  })
}) 