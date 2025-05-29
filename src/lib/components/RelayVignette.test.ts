import { render } from "@testing-library/svelte/svelte5"
import { expect, it } from "vitest"
import RelayVignette from "./RelayVignette.svelte"

it("shows icon when provided", () => {
  const { container, getByText } = render(RelayVignette, {
    props: { url: "wss://a", name: "A", icon_url: "icon.png" }
  })
  const img = container.querySelector("img")
  expect(img?.getAttribute("src")).toBe("icon.png")
  expect(getByText("wss://a")).toBeTruthy()
  expect(getByText("A")).toBeTruthy()
})

it("falls back to initial when no icon", () => {
  const { getByText } = render(RelayVignette, { props: { url: "wss://b" } })
  expect(getByText("W")).toBeTruthy()
})
