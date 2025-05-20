import { render, within } from "@testing-library/svelte";
import { relayListStore } from "../stores/relayListStore";
import RelayListView from "./RelayListView.svelte";

it("splits relays into columns", () => {
  relayListStore.set([
    { url: "wss://a", read: true, write: false },
    { url: "wss://b", read: false, write: true },
    { url: "wss://c", read: true, write: true },
  ]);
  const { getByTestId } = render(RelayListView);
  const readList = getByTestId("read-list");
  const writeList = getByTestId("write-list");
  expect(within(readList).getByText("wss://a")).toBeTruthy();
  expect(within(writeList).getByText("wss://b")).toBeTruthy();
  expect(within(readList).getByText("wss://c")).toBeTruthy();
  expect(within(writeList).getByText("wss://c")).toBeTruthy();
});
