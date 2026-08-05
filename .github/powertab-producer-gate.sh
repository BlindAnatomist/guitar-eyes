#!/usr/bin/env bash
set -Eeuo pipefail

WORK="$RUNNER_TEMP/powertab-producer-work"
INSTALLER="$WORK/powertabeditor-windows-2.0.22.exe"
WINEPREFIX_DIR="$WORK/wine-prefix"
INSTALL_SCRIPT="$WORK/install-under-wine.sh"
GUI_SCRIPT="$WORK/gui-run.sh"
APP_LOG="$EVIDENCE_DIR/powertabeditor.log"
WINDOW_LOG="$EVIDENCE_DIR/window-inventory.txt"
mkdir -p "$WORK" "$EVIDENCE_DIR"

if command -v wine >/dev/null 2>&1; then
  WINE_BIN="$(command -v wine)"
elif command -v wine64 >/dev/null 2>&1; then
  WINE_BIN="$(command -v wine64)"
elif [ -x /usr/lib/wine/wine64 ]; then
  WINE_BIN=/usr/lib/wine/wine64
else
  echo "Wine launcher was not found on PATH or at /usr/lib/wine/wine64." >&2
  exit 20
fi
printf '%s\n' "$WINE_BIN" > "$EVIDENCE_DIR/wine-launcher-path.txt"

curl --fail --location --retry 3 --retry-delay 2 \
  --output "$INSTALLER" \
  "https://github.com/powertab/powertabeditor/releases/download/2.0.22/powertabeditor-windows-2.0.22.exe"
actual_installer_hash="$(sha256sum "$INSTALLER" | awk '{print $1}')"
printf '%s  %s\n' "$actual_installer_hash" "$(basename "$INSTALLER")" \
  > "$EVIDENCE_DIR/installer-sha256.txt"
if [ "$actual_installer_hash" != "$INSTALLER_SHA256" ]; then
  echo "Installer SHA-256 mismatch: expected $INSTALLER_SHA256, actual $actual_installer_hash" >&2
  exit 21
fi

export WINEARCH=win64
export WINEPREFIX="$WINEPREFIX_DIR"
export WINEDEBUG=-all

cat > "$INSTALL_SCRIPT" <<'INSTALL'
#!/usr/bin/env bash
set -Eeuo pipefail

export WINEARCH=win64
export WINEPREFIX="$WINEPREFIX_DIR"
export WINEDEBUG=-all

if command -v wineboot >/dev/null 2>&1; then
  wineboot --init > "$EVIDENCE_DIR/wineboot.log" 2>&1 || true
else
  "$WINE_BIN" wineboot.exe --init > "$EVIDENCE_DIR/wineboot.log" 2>&1 || true
fi

if command -v winepath >/dev/null 2>&1; then
  INSTALL_LOG_WINDOWS="$(winepath -w "$EVIDENCE_DIR/official-installer.log")"
else
  INSTALL_LOG_WINDOWS="$(python3 - <<'PY'
import os
print("Z:" + (os.environ["EVIDENCE_DIR"] + "/official-installer.log").replace("/", "\\"))
PY
)"
fi

set +e
timeout 300 "$WINE_BIN" "$INSTALLER" \
  /VERYSILENT \
  /SUPPRESSMSGBOXES \
  /NORESTART \
  /SP- \
  /CURRENTUSER \
  '/DIR=C:\PowerTabEditor' \
  "/LOG=$INSTALL_LOG_WINDOWS" \
  > "$EVIDENCE_DIR/official-installer-stdout.log" 2>&1
code=$?
set -e
printf '%s\n' "$code" > "$EVIDENCE_DIR/official-installer-exit-code.txt"
exit "$code"
INSTALL
chmod +x "$INSTALL_SCRIPT"
export WINE_BIN INSTALLER WINEPREFIX_DIR EVIDENCE_DIR
xvfb-run -a -s '-screen 0 1280x900x24' "$INSTALL_SCRIPT"

APP_EXE="$(find "$WINEPREFIX_DIR/drive_c" -type f -iname 'powertabeditor.exe' -print -quit)"
if [ -z "$APP_EXE" ] || [ ! -f "$APP_EXE" ]; then
  echo "Installed powertabeditor.exe was not found." >&2
  find "$WINEPREFIX_DIR/drive_c" -maxdepth 6 -type f | sort > "$EVIDENCE_DIR/installed-file-inventory.txt" || true
  exit 22
fi
find "$(dirname "$APP_EXE")" -maxdepth 3 -type f -printf '%P\t%s\n' | sort \
  > "$EVIDENCE_DIR/installed-application-inventory.txt"
sha256sum "$APP_EXE" > "$EVIDENCE_DIR/powertabeditor-executable-sha256.txt"
printf '%s\n' "$APP_EXE" > "$EVIDENCE_DIR/powertabeditor-executable-path.txt"
printf '%s\n' \
  'Command-line --version probe intentionally omitted after run-three timeout; producer identity is pinned by official installer hash, successful installer log, installed path, and executable hash.' \
  > "$EVIDENCE_DIR/powertabeditor-version-probe.txt"

cp "$FIXTURE_PATH" "$EVIDENCE_DIR/source-derived-input.pt2"
cp "$FIXTURE_PATH" "$EDITOR_FILE"
touch -d '2000-01-01 00:00:00 UTC' "$EDITOR_FILE"
before_mtime="$(stat -c %Y "$EDITOR_FILE")"
before_inode="$(stat -c %i "$EDITOR_FILE")"
before_size="$(stat -c %s "$EDITOR_FILE")"
before_hash="$(sha256sum "$EDITOR_FILE" | awk '{print $1}')"
printf 'mtime=%s\ninode=%s\nsize=%s\nsha256=%s\n' \
  "$before_mtime" "$before_inode" "$before_size" "$before_hash" \
  > "$EVIDENCE_DIR/before-save-stat.txt"

cat > "$GUI_SCRIPT" <<'GUI'
#!/usr/bin/env bash
set -Eeuo pipefail

export WINEARCH=win64
export WINEPREFIX="$WINEPREFIX_DIR"
export WINEDEBUG=-all

if command -v winepath >/dev/null 2>&1; then
  WIN_EDITOR_FILE="$(winepath -w "$EDITOR_FILE")"
else
  WIN_EDITOR_FILE="$(python3 - <<'PY'
import os
print("Z:" + os.environ["EDITOR_FILE"].replace("/", "\\"))
PY
)"
fi
printf '%s\n' "$WIN_EDITOR_FILE" > "$EVIDENCE_DIR/editor-file-windows-path.txt"

"$WINE_BIN" "$APP_EXE" "$WIN_EDITOR_FILE" > "$APP_LOG" 2>&1 &
APP_PID=$!

WINDOW_ID=""
for attempt in $(seq 1 60); do
  WINDOW_ID="$(xdotool search --onlyvisible --name 'Power Tab Editor' 2>/dev/null | tail -n 1 || true)"
  if [ -n "$WINDOW_ID" ]; then
    break
  fi
  if ! kill -0 "$APP_PID" 2>/dev/null; then
    break
  fi
  sleep 1
done

xwininfo -root -tree > "$WINDOW_LOG" 2>&1 || true
import -window root "$EVIDENCE_DIR/before-save.png" \
  2> "$EVIDENCE_DIR/screenshot-before.log" || true

if [ -z "$WINDOW_ID" ]; then
  echo "Power Tab Editor window was not found." >&2
  cat "$APP_LOG" >&2 || true
  exit 23
fi

xdotool getwindowname "$WINDOW_ID" > "$EVIDENCE_DIR/window-title.txt" 2>&1 || true
xdotool windowactivate --sync "$WINDOW_ID"
sleep 5
xdotool key --window "$WINDOW_ID" --clearmodifiers ctrl+s

rewritten=0
for attempt in $(seq 1 25); do
  current_mtime="$(stat -c %Y "$EDITOR_FILE")"
  if [ "$current_mtime" -gt 946684800 ]; then
    rewritten=1
    break
  fi
  sleep 1
done

import -window root "$EVIDENCE_DIR/after-save.png" \
  2> "$EVIDENCE_DIR/screenshot-after.log" || true
xdotool key --window "$WINDOW_ID" --clearmodifiers alt+F4 || true
sleep 3
kill "$APP_PID" 2>/dev/null || true
if command -v wineserver >/dev/null 2>&1; then
  timeout 10 wineserver -w 2>/dev/null || true
fi

if [ "$rewritten" != "1" ]; then
  echo "The graphical Save command produced no observable rewrite." >&2
  exit 24
fi
GUI
chmod +x "$GUI_SCRIPT"
export WINE_BIN APP_EXE APP_LOG WINDOW_LOG WINEPREFIX_DIR EDITOR_FILE EVIDENCE_DIR
xvfb-run -a -s '-screen 0 1280x900x24' timeout 120 "$GUI_SCRIPT"

after_mtime="$(stat -c %Y "$EDITOR_FILE")"
after_inode="$(stat -c %i "$EDITOR_FILE")"
after_size="$(stat -c %s "$EDITOR_FILE")"
after_hash="$(sha256sum "$EDITOR_FILE" | awk '{print $1}')"
printf 'mtime=%s\ninode=%s\nsize=%s\nsha256=%s\n' \
  "$after_mtime" "$after_inode" "$after_size" "$after_hash" \
  > "$EVIDENCE_DIR/after-save-stat.txt"
if [ "$after_mtime" -le 946684800 ]; then
  echo "Rewritten file retained the forced pre-2001 mtime." >&2
  exit 25
fi

python3 .github/powertab-structural-compare.py
printf '%s\n' 'producer-round-trip-passed' > "$EVIDENCE_DIR/producer-status.txt"
