<script lang="ts">
import * as Card from "$lib/components/ui/card"
</script>

<Card.Root class="w-full">
  <Card.Header>
    <Card.Title>Relay List Best Practices</Card.Title>
    <Card.Description>
      Recommendations for maintaining an effective relay list
    </Card.Description>
  </Card.Header>
  <Card.Content>
    <ul class="list-disc pl-5 space-y-2">
      <li>
        <span class="font-medium">Keep the list small</span> - 2-4 relays is typically sufficient
      </li>
      <li>
        <span class="font-medium">Choose quality relays</span> - Prefer geographically close, high-uptime relays with strong reputations
      </li>
      <li>
        <span class="font-medium">Include at least one 'big indexer'</span> - Maximizes discoverability of your content
      </li>
      <li>
        <span class="font-medium">Review periodically</span> - Drop relays that become unreliable or censorious
      </li>
    </ul>
  </Card.Content>
</Card.Root> 