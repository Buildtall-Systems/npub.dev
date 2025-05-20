import { render } from "@testing-library/svelte";
import { expect, it, vi } from "vitest";
import JsonViewer from "./JsonViewer.svelte";

it("displays json and animates", async () => {
  vi.useFakeTimers();
  try {
    const { component, getByTestId } = render(JsonViewer, {
      props: { json: '{"a":1}' },
    });
    const el = getByTestId("json-viewer");
    expect(el.textContent).toBe('{"a":1}');
    component.play();
    vi.advanceTimersByTime(1); // Simulate a short delay
    expect(el.classList.contains("animate-ping")).toBe(true);
  } finally {
    vi.restoreAllMocks();
  }
});

it("updates when prop changes", async () => {
  const { getByTestId, rerender } = render(JsonViewer, {
    props: { json: '{"a":1}' },
  });
  await rerender({ json: '{"b":2}' });
  const el = getByTestId("json-viewer");
  expect(el.textContent).toBe('{"b":2}');
});
