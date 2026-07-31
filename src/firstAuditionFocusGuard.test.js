import {
  installFirstAuditionFocusGuard,
  isStaleFirstAuditionFocusTarget,
} from "./firstAuditionFocusGuard";

function makeHarness({ activeElementIsButton = true } = {}) {
  let focusInHandler = null;
  let timeoutHandler = null;
  const button = {
    id: "audition-current-position",
    isConnected: true,
    focus: jest.fn(),
  };
  const readerHeading = { id: "iphone-reader-heading" };
  const documentRef = {
    activeElement: activeElementIsButton ? button : { id: "another-control" },
    addEventListener: jest.fn((type, handler) => {
      if (type === "focusin") {
        focusInHandler = handler;
      }
    }),
    removeEventListener: jest.fn(),
  };
  const windowRef = {
    setTimeout: jest.fn((handler) => {
      timeoutHandler = handler;
      return 17;
    }),
    clearTimeout: jest.fn(),
  };

  return {
    button,
    readerHeading,
    documentRef,
    windowRef,
    getFocusInHandler: () => focusInHandler,
    getTimeoutHandler: () => timeoutHandler,
  };
}

describe("first audition focus guard", () => {
  test("recognizes only the stale reader and test-build headings", () => {
    const forwardedHeading = { id: "custom-reader-heading" };

    expect(
      isStaleFirstAuditionFocusTarget(forwardedHeading, forwardedHeading)
    ).toBe(true);
    expect(
      isStaleFirstAuditionFocusTarget(
        { id: "iphone-reader-heading" },
        forwardedHeading
      )
    ).toBe(true);
    expect(
      isStaleFirstAuditionFocusTarget(
        { id: "test-build-heading" },
        forwardedHeading
      )
    ).toBe(true);
    expect(
      isStaleFirstAuditionFocusTarget(
        { id: "next-position" },
        forwardedHeading
      )
    ).toBe(false);
    expect(isStaleFirstAuditionFocusTarget(null, forwardedHeading)).toBe(false);
  });

  test("restores the audition button once after a stale heading receives focus", async () => {
    const harness = makeHarness();

    installFirstAuditionFocusGuard({
      button: harness.button,
      readerHeading: harness.readerHeading,
      documentRef: harness.documentRef,
      windowRef: harness.windowRef,
    });

    const focusInHandler = harness.getFocusInHandler();
    expect(typeof focusInHandler).toBe("function");

    focusInHandler({ target: harness.readerHeading });
    await Promise.resolve();

    expect(harness.button.focus).toHaveBeenCalledTimes(1);
    expect(harness.button.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(harness.documentRef.removeEventListener).toHaveBeenCalledWith(
      "focusin",
      focusInHandler,
      true
    );
    expect(harness.windowRef.clearTimeout).toHaveBeenCalledWith(17);

    focusInHandler({ target: harness.readerHeading });
    await Promise.resolve();
    expect(harness.button.focus).toHaveBeenCalledTimes(1);
  });

  test("clears without restoring when focus intentionally moves to another control", async () => {
    const harness = makeHarness();

    installFirstAuditionFocusGuard({
      button: harness.button,
      readerHeading: harness.readerHeading,
      documentRef: harness.documentRef,
      windowRef: harness.windowRef,
    });

    const focusInHandler = harness.getFocusInHandler();
    focusInHandler({ target: { id: "next-position" } });
    await Promise.resolve();

    expect(harness.button.focus).not.toHaveBeenCalled();
    expect(harness.documentRef.removeEventListener).toHaveBeenCalledWith(
      "focusin",
      focusInHandler,
      true
    );
  });

  test("expires quietly when no focus displacement occurs", () => {
    const harness = makeHarness();

    installFirstAuditionFocusGuard({
      button: harness.button,
      readerHeading: harness.readerHeading,
      documentRef: harness.documentRef,
      windowRef: harness.windowRef,
    });

    const focusInHandler = harness.getFocusInHandler();
    harness.getTimeoutHandler()();

    expect(harness.button.focus).not.toHaveBeenCalled();
    expect(harness.documentRef.removeEventListener).toHaveBeenCalledWith(
      "focusin",
      focusInHandler,
      true
    );
  });

  test("does not arm unless the audition button currently owns DOM focus", () => {
    const harness = makeHarness({ activeElementIsButton: false });

    const cleanup = installFirstAuditionFocusGuard({
      button: harness.button,
      readerHeading: harness.readerHeading,
      documentRef: harness.documentRef,
      windowRef: harness.windowRef,
    });

    expect(harness.documentRef.addEventListener).not.toHaveBeenCalled();
    expect(harness.windowRef.setTimeout).not.toHaveBeenCalled();
    expect(() => cleanup()).not.toThrow();
  });
});
