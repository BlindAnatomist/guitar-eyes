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
path.write_text(text, encoding="utf-8")
print("track selection checkpoint script prepared")
