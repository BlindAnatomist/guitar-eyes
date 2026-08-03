import {
  installFirstAuditionFocusGuard,
  isStaleFirstAuditionFocusTarget,
} from "./firstAuditionFocusGuard";

function makeHarness({ activeElementIsButton = true } = {}) {
  const documentHandlers = new Map();
  const windowHandlers = new Map();
  let timeoutHandler = null;
  let nextFrameId = 30;
  const frames = new Map();
  const button = {
    id: "audition-current-position",
    isConnected: true,
    blur: jest.fn(),
    focus: jest.fn(),
  };
  const readerHeading = { id: "iphone-reader-heading" };
  const documentRef = {
    activeElement: activeElementIsButton ? button : { id: "another-control" },
    addEventListener: jest.fn((type, handler) => {
      documentHandlers.set(type, handler);
    }),
    removeEventListener: jest.fn((type, handler) => {
      if (documentHandlers.get(type) === handler) {
        documentHandlers.delete(type);
      }
    }),
  };
  const windowRef = {
    addEventListener: jest.fn((type, handler) => {
      windowHandlers.set(type, handler);
    }),
    removeEventListener: jest.fn((type, handler) => {
      if (windowHandlers.get(type) === handler) {
        windowHandlers.delete(type);
      }
    }),
    setTimeout: jest.fn((handler) => {
      timeoutHandler = handler;
      return 17;
    }),
    clearTimeout: jest.fn(),
    requestAnimationFrame: jest.fn((handler) => {
      nextFrameId += 1;
      frames.set(nextFrameId, handler);
      return nextFrameId;
    }),
    cancelAnimationFrame: jest.fn((handle) => {
      frames.delete(handle);
    }),
  };

  const runNextFrame = () => {
    const entry = frames.entries().next();
    if (entry.done) {
      throw new Error("No animation frame is scheduled");
    }
    const [id, handler] = entry.value;
    frames.delete(id);
    handler();
  };

  return {
    button,
    readerHeading,
    documentRef,
    windowRef,
    getDocumentHandler: (type) => documentHandlers.get(type),
    getWindowHandler: (type) => windowHandlers.get(type),
    getTimeoutHandler: () => timeoutHandler,
    runNextFrame,
    pendingFrameCount: () => frames.size,
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

    const focusInHandler = harness.getDocumentHandler("focusin");
    expect(typeof focusInHandler).toBe("function");

    focusInHandler({ target: harness.readerHeading });
    await Promise.resolve();

    expect(harness.button.blur).not.toHaveBeenCalled();
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

  test("pulses focus back after the audition button leaves web content for browser chrome", () => {
    const harness = makeHarness();

    installFirstAuditionFocusGuard({
      button: harness.button,
      readerHeading: harness.readerHeading,
      documentRef: harness.documentRef,
      windowRef: harness.windowRef,
    });

    const focusOutHandler = harness.getDocumentHandler("focusout");
    expect(typeof focusOutHandler).toBe("function");

    focusOutHandler({ target: harness.button, relatedTarget: null });
    expect(harness.pendingFrameCount()).toBe(1);

    harness.runNextFrame();
    harness.runNextFrame();

    expect(harness.button.blur).toHaveBeenCalledTimes(1);
    expect(harness.button.focus).toHaveBeenCalledTimes(1);
    expect(harness.button.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(harness.getDocumentHandler("focusin")).toBeUndefined();
    expect(harness.getDocumentHandler("focusout")).toBeUndefined();
  });

  test("uses window blur as a bounded fallback when browser chrome receives focus", () => {
    const harness = makeHarness();

    installFirstAuditionFocusGuard({
      button: harness.button,
      readerHeading: harness.readerHeading,
      documentRef: harness.documentRef,
      windowRef: harness.windowRef,
    });

    const windowBlurHandler = harness.getWindowHandler("blur");
    expect(typeof windowBlurHandler).toBe("function");

    windowBlurHandler();
    harness.runNextFrame();
    harness.runNextFrame();

    expect(harness.button.blur).toHaveBeenCalledTimes(1);
    expect(harness.button.focus).toHaveBeenCalledTimes(1);
    expect(harness.getWindowHandler("blur")).toBeUndefined();
    expect(harness.getWindowHandler("focus")).toBeUndefined();
  });

  test("does not treat an ordinary DOM focus destination as browser chrome", async () => {
    const harness = makeHarness();

    installFirstAuditionFocusGuard({
      button: harness.button,
      readerHeading: harness.readerHeading,
      documentRef: harness.documentRef,
      windowRef: harness.windowRef,
    });

    const nextControl = { id: "next-position" };
    harness.getDocumentHandler("focusout")({
      target: harness.button,
      relatedTarget: nextControl,
    });
    harness.getDocumentHandler("focusin")({ target: nextControl });
    await Promise.resolve();

    expect(harness.pendingFrameCount()).toBe(0);
    expect(harness.button.blur).not.toHaveBeenCalled();
    expect(harness.button.focus).not.toHaveBeenCalled();
  });

  test("clears without restoring when focus intentionally moves to another control", async () => {
    const harness = makeHarness();

    installFirstAuditionFocusGuard({
      button: harness.button,
      readerHeading: harness.readerHeading,
      documentRef: harness.documentRef,
      windowRef: harness.windowRef,
    });

    const focusInHandler = harness.getDocumentHandler("focusin");
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

    const focusInHandler = harness.getDocumentHandler("focusin");
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
    expect(harness.windowRef.addEventListener).not.toHaveBeenCalled();
    expect(harness.windowRef.setTimeout).not.toHaveBeenCalled();
    expect(() => cleanup()).not.toThrow();
  });
});
