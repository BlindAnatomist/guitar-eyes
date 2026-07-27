from pathlib import Path

path = Path("scripts/temporary_guitar_pro_shared_archive_correction.py")
text = path.read_text(encoding="utf-8")

old = '    original = read(path)\n'
new = (
    '    try:\n'
    '        original = read(path)\n'
    '    except UnicodeDecodeError:\n'
    '        continue\n'
)
assert text.count(old) == 1, text.count(old)
text = text.replace(old, new, 1)

start_marker = 'assert text.count(\'sourceVersion: "GP7",\') == 2\n'
end_marker = 'old_version_test = textwrap.dedent(\n'
assert text.count(start_marker) == 1
assert text.count(end_marker) == 1
start = text.index(start_marker)
end = text.index(end_marker, start)
replacement = "\n".join(
    [
        'helper_start = text.index("function intermediate(")',
        'helper_end = text.index("\n}\n\nfunction expectErrorCode", helper_start) + 2',
        'helper = text[helper_start:helper_end]',
        'helper = replace_once(',
        '    helper,',
        '    \'    sourceVersion: "GP7",\n\',',
        '    \'    sourceVersion: "GP8",\n    versionEvidence: GP8_VERSION_EVIDENCE,\n\',',
        '    "normalizer helper evidence",',
        ')',
        'text = text[:helper_start] + helper + text[helper_end:]',
        'text = replace_once(',
        '    text,',
        '    \'      sourceVersion: "GP7",\n      title: "Guitar Eyes Shared Archive Proof",\',',
        '    \'      sourceVersion: "GP8",\n      title: "Guitar Eyes Shared Archive Proof",\',',
        '    "normalizer expected GP8 version",',
        ')',
        '',
    ]
)
text = text[:start] + replacement + text[end:]

start_marker = 'old_version_test = textwrap.dedent(\n'
end_marker = 'write(path, text)\n\n# Application proof fixture.'
assert text.count(start_marker) == 1
assert text.count(end_marker) == 1
start = text.index(start_marker)
end = text.index(end_marker, start)
replacement = "\n".join(
    [
        'test_start = text.index(\'  test("rejects untested Guitar Pro versions", () => {\')',
        'test_end = text.index(\'\n\n  test("rejects multiple active voices instead of selecting the first"\', test_start)',
        'old_test = text[test_start:test_end]',
        'assert \'sourceVersion: "GP8"\' in old_test',
        'new_test = (',
        '    \'  test("rejects GP7 until direct project evidence is accepted", () => {\n\'',
        '    \'    expectErrorCode(\n\'',
        '    \'      () =>\n\'',
        '    \'        normalizeGuitarProIntermediate(\n\'',
        '    \'          intermediate([track()], {\n\'',
        '    \'            sourceVersion: "GP7",\n\'',
        '    \'            versionEvidence: GP7_VERSION_EVIDENCE,\n\'',
        '    \'          })\n\'',
        '    \'        ),\n\'',
        '    \'      "UNTESTED_GUITAR_PRO_VERSION"\n\'',
        '    \'    );\n\'',
        '    \'  });\'',
        ')',
        'text = text[:test_start] + new_test + text[test_end:]',
        '',
    ]
)
text = text[:start] + replacement + text[end:]

start_marker = "text = replace_once(\n    text,\n    textwrap.dedent(\n        '''\\\n            const intermediate = alphaTabScoreToGuitarProIntermediate(score, {\n"
end_marker = "text = replace_once(\n    text,\n    '      sourceVersion: \"GP7\",',\n"
assert text.count(start_marker) == 1, text.count(start_marker)
assert text.count(end_marker) == 1, text.count(end_marker)
start = text.index(start_marker)
end = text.index(end_marker, start)
replacement = "\n".join(
    [
        "binary_start = text.index('    const intermediate = alphaTabScoreToGuitarProIntermediate(score, {')",
        "binary_end = text.index('\\n    const document = normalizeGuitarProIntermediate(intermediate);', binary_start)",
        "old_binary_block = text[binary_start:binary_end]",
        "assert 'sourceVersion: \"GP7\"' in old_binary_block",
        "new_binary_block = (",
        "    '    const intermediate = alphaTabScoreToGuitarProIntermediate(score, {\\n'",
        "    '      versionEvidence,\\n'",
        "    '    });'",
        ")",
        "text = text[:binary_start] + new_binary_block + text[binary_end:]",
        "",
    ]
)
text = text[:start] + replacement + text[end:]

path.write_text(text, encoding="utf-8")
print("temporary correction script prepared")
