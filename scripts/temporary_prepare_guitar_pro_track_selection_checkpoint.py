from pathlib import Path

path = Path("scripts/temporary_guitar_pro_track_selection_checkpoint.py")
text = path.read_text(encoding="utf-8")

selection_marker = 'selection_test = textwrap.dedent(\n'
start = text.index('text = insert_after_once(\n', text.index(selection_marker))
end_marker = 'write(path, text)\n\n# Reader coordinator:'
end = text.index(end_marker, start)
replacement = '''anchor = '  test("rejects unsupported string counts and percussion-only scores", () => {'
assert text.count(anchor) == 1
text = text.replace(anchor, selection_test + "\\n" + anchor, 1)
write(path, text)

# Reader coordinator:'''
text = text[:start] + replacement + text[end + len('write(path, text)\n\n# Reader coordinator:'):]

start = text.index('old_focus = textwrap.dedent(\n')
end = text.index('\n\nshow_selection = textwrap.dedent(', start)
replacement = '''focus_start = text.index('        const target =\\n')
focus_end = text.index('\\n\\n        if (!target)', focus_start)
new_focus = (
    '        const target =\\n'
    '          pendingIphoneFocusTargetRef.current === "reader"\\n'
    '            ? iphoneHeadingRef.current\\n'
    '            : pendingIphoneFocusTargetRef.current === "track-selection"\\n'
    '              ? trackSelectionHeadingRef.current\\n'
    '              : errorHeadingRef.current;'
)
text = text[:focus_start] + new_focus + text[focus_end:]'''
text = text[:start] + replacement + text[end:]

path.write_text(text, encoding="utf-8")
print("track selection checkpoint script prepared")
