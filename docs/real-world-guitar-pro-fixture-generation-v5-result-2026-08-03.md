# Real-World Guitar Pro Fixture Generation v5 Result

Date: August 3, 2026

Repository: `BlindAnatomist/guitar-eyes`

Branch: `work/real-world-guitar-pro-intake`

Exact feature source:

`5914c6643a6b490e08af159ad387f07cb5fe23f5`

Workflow run:

`30855550336`

Job:

`91825603959`

## Purpose

Apply the complete development-only GP5 page-setup correction:

1. score-size field from i32 to i16;
2. ten page-template strings from int-only length to int-plus-byte length.

## Exact result

Authority passed. The run stopped before compilation, generation, or alphaTab.

The Python patch script searched for the score-size writer using one indentation-sensitive multiline literal and reported:

`expected exactly one GP5 score-size i32 writer`

The pinned source contains the intended writer, but its whitespace did not match the workflow literal exactly.

## Classification

This is a patch-matcher failure only. It provides no new evidence about GP3, GP4, GP5, GPX, GP7, alphaTab, or Guitar Eyes runtime behavior.

The next operation must use a whitespace-tolerant regular expression and require exactly:

1. one score-size writer replacement;
2. ten page-template writer replacements.

No external writer rule, Guitar Eyes source file, musical specimen, or semantic assertion may change.

## Repository authority

The temporary v5 workflow was removed after inspection. Fork `main` was restored and independently verified identical to:

`60c2e5de0887b1bcdd426d932632946edd07d3c3`

No pull request, merge, deployment, publication, or upstream modification occurred.