export function isStaleFirstAuditionFocusTarget(target, readerHeading) {
  return (
    target === readerHeading ||
    target?.id === "iphone-reader-heading" ||
    target?.id === "test-build-heading"
  );
}

export function installFirstAuditionFocusGuard({
  button,
  readerHeading = null,
  documentRef = document,
  windowRef = window,
  timeoutMilliseconds = 1500,
}) {
  if (!button || documentRef.activeElement !== button) {
    return () => {};
  }

  let active = true;
  let cleanupTimer = null;
  let firstRestoreFrame = null;
  let secondRestoreFrame = null;
  let browserChromeDisplacement = false;

  const requestFrame =
    typeof windowRef.requestAnimationFrame === "function"
      ? (callback) => windowRef.requestAnimationFrame(callback)
      : (callback) => windowRef.setTimeout(callback, 0);
  const cancelFrame =
    typeof windowRef.cancelAnimationFrame === "function"
      ? (handle) => windowRef.cancelAnimationFrame(handle)
      : (handle) => windowRef.clearTimeout(handle);

  const cancelScheduledRestore = () => {
    if (firstRestoreFrame !== null) {
      cancelFrame(firstRestoreFrame);
      firstRestoreFrame = null;
    }
    if (secondRestoreFrame !== null) {
      cancelFrame(secondRestoreFrame);
      secondRestoreFrame = null;
    }
  };

  const cleanup = () => {
    if (!active) {
      return;
    }

    active = false;
    documentRef.removeEventListener("focusin", handleFocusIn, true);
    documentRef.removeEventListener("focusout", handleFocusOut, true);
    windowRef.removeEventListener?.("blur", handleWindowBlur, true);
    windowRef.removeEventListener?.("focus", handleWindowFocus, true);
    cancelScheduledRestore();
    if (cleanupTimer !== null) {
      windowRef.clearTimeout(cleanupTimer);
      cleanupTimer = null;
    }
  };

  const restoreButton = ({ pulse = false } = {}) => {
    if (!active) {
      return;
    }

    cleanup();
    if (!button.isConnected) {
      return;
    }

    if (pulse && typeof button.blur === "function") {
      button.blur();
    }
    button.focus({ preventScroll: true });
  };

  const scheduleBrowserChromeRestore = () => {
    if (!active || firstRestoreFrame !== null || secondRestoreFrame !== null) {
      return;
    }

    firstRestoreFrame = requestFrame(() => {
      firstRestoreFrame = null;
      secondRestoreFrame = requestFrame(() => {
        secondRestoreFrame = null;
        if (active && browserChromeDisplacement) {
          restoreButton({ pulse: true });
        }
      });
    });
  };

  function handleFocusIn(event) {
    if (!active) {
      return;
    }

    const nextTarget = event.target;
    if (nextTarget === button) {
      return;
    }

    const shouldRestore = isStaleFirstAuditionFocusTarget(
      nextTarget,
      readerHeading
    );
    if (!shouldRestore) {
      cleanup();
      return;
    }

    Promise.resolve().then(() => restoreButton());
  }

  function handleFocusOut(event) {
    if (
      !active ||
      event.target !== button ||
      event.relatedTarget !== null
    ) {
      return;
    }

    browserChromeDisplacement = true;
    scheduleBrowserChromeRestore();
  }

  function handleWindowBlur() {
    if (!active || documentRef.activeElement !== button) {
      return;
    }

    browserChromeDisplacement = true;
    scheduleBrowserChromeRestore();
  }

  function handleWindowFocus() {
    if (!active || !browserChromeDisplacement) {
      return;
    }

    cancelScheduledRestore();
    scheduleBrowserChromeRestore();
  }

  documentRef.addEventListener("focusin", handleFocusIn, true);
  documentRef.addEventListener("focusout", handleFocusOut, true);
  windowRef.addEventListener?.("blur", handleWindowBlur, true);
  windowRef.addEventListener?.("focus", handleWindowFocus, true);
  cleanupTimer = windowRef.setTimeout(cleanup, timeoutMilliseconds);

  return cleanup;
}
