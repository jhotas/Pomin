import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, expect, test } from "vitest";
import { useDocumentTitle } from "./use-document-title";

beforeEach(() => {
  document.title = "pomoapp";
});

test("sets the title and restores it when done", () => {
  const { rerender, unmount } = renderHook(
    ({ title }: { title: string | null }) => useDocumentTitle(title),
    { initialProps: { title: "18:42 · Focus · pomoapp" as string | null } },
  );
  expect(document.title).toBe("18:42 · Focus · pomoapp");
  rerender({ title: null });
  expect(document.title).toBe("pomoapp");
  unmount();
});

test("keeps its title when the framework writes the route's title later", async () => {
  renderHook(() => useDocumentTitle("Guitar · pomoapp"));
  document.title = "Skill · pomoapp";
  await waitFor(() => expect(document.title).toBe("Guitar · pomoapp"));
});

test("leaves a newer page's title alone when it unmounts", () => {
  const { unmount } = renderHook(() => useDocumentTitle("Guitar · pomoapp"));
  // The next page sets its title in the same commit that unmounts this one.
  document.title = "Skills · pomoapp";
  unmount();
  expect(document.title).toBe("Skills · pomoapp");
});
