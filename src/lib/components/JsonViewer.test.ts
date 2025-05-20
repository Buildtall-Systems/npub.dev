import { render } from "@testing-library/svelte";
import { expect, it } from "vitest";
import JsonViewer from "./JsonViewer.svelte";

it("displays json and animates", async () => {
  const { component, getByTestId } = render(JsonViewer, {
    props: { json: '{"a":1}' },
  });
  const el = getByTestId("json-viewer");
  expect(el.textContent).toBe('{"a":1}');
  component.play();
  await new Promise((r) => setTimeout(r, 0));
  expect(el.classList.contains("animate-ping")).toBe(true);
});

it("updates when prop changes", async () => {
  const { getByTestId, rerender } = render(JsonViewer, {
    props: { json: '{"a":1}' },
  });
  await rerender({ json: '{"b":2}' });
  const el = getByTestId("json-viewer");
  expect(el.textContent).toBe('{"b":2}');
});
