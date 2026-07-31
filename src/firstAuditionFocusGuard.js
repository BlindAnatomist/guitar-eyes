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

  const cleanup = () => {
    if (!active) {
      return;
    }

    active = false;
    documentRef.removeEventListener("focusin", handleFocusIn, true);
    if (cleanupTimer !== null) {
      windowRef.clearTimeout(cleanupTimer);
      cleanupTimer = null;
    }
  };

  const handleFocusIn = (event) => {
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
    cleanup();

    if (!shouldRestore) {
      return;
    }

    Promise.resolve().then(() => {
      if (button.isConnected) {
        button.focus({ preventScroll: true });
      }
    });
  };

  documentRef.addEventListener("focusin", handleFocusIn, true);
  cleanupTimer = windowRef.setTimeout(cleanup, timeoutMilliseconds);

  return cleanup;
}
