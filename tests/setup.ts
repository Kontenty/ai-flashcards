import "@testing-library/jest-dom";
import { server } from "./mocks/server";
import { beforeAll, afterEach, afterAll } from "vitest";

// Disable empty-function rule for ResizeObserver stub
/* eslint-disable @typescript-eslint/no-empty-function */
// Stub ResizeObserver for jsdom in Vitest
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserver;

// Stub matchMedia for jsdom in Vitest
/* eslint-disable @typescript-eslint/no-empty-function */
Object.defineProperty(globalThis, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
/* eslint-enable @typescript-eslint/no-empty-function */
// Establish API mocking before all tests.
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
// Reset any request handlers that are declared as a part of our tests (i.e. for testing one-time error scenarios)
afterEach(() => server.resetHandlers());
// Clean up after the tests are finished.
afterAll(() => server.close());
