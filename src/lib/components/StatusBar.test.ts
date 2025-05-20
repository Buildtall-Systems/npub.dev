import { render } from "@testing-library/svelte";
import { expect, it } from "vitest";
import StatusBar from "./StatusBar.svelte";

it("shows npub and signer type", () => {
  const { getByText } = render(StatusBar, {
    props: { npub: "n", signerType: "NIP-07" },
  });
  expect(getByText("n")).toBeTruthy();
  expect(getByText("NIP-07")).toBeTruthy();
});
