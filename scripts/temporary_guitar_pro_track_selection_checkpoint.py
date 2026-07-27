from pathlib import Path
import textwrap


def read(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    Path(path).write_text(text, encoding="utf-8")


def replace_once(text: str, old: str, new: str, label: str) -> str:
    count = text.count(old)
    assert count == 1, (label, count)
    return text.replace(old, new, 1)


def insert_before_once(text: str, anchor: str, insertion: str, label: str) -> str:
    count = text.count(anchor)
    assert count == 1, (label, count)
    return text.replace(anchor, insertion + anchor, 1)


def insert_after_once(text: str, anchor: str, insertion: str, label: str) -> str:
    count = text.count(anchor)
    assert count == 1, (label, count)
    return text.replace(anchor, anchor + insertion, 1)


# Normalizer: retain the no-guess default, but permit one explicit supported
# track/staff selection.
path = "src/guitarProNormalizer.js"
text = read(path)
text = replace_once(
    text,
    "function selectCandidateStaff(tracks) {",
    "function selectCandidateStaff(tracks, selection = null) {",
    "normalizer selector signature",
)
selection_logic = textwrap.dedent(
    '''\

      if (selection !== null) {
        const trackIndex = selection?.trackIndex;
        const staffIndex = selection?.staffIndex;
        if (
          !Number.isInteger(trackIndex) ||
          trackIndex < 0 ||
          !Number.isInteger(staffIndex) ||
          staffIndex < 0
        ) {
          throw new GuitarProImportError(
            "The selected Guitar Pro track coordinates are invalid.",
            "INVALID_GUITAR_PRO_TRACK_SELECTION"
          );
        }

        const selected = supported.find(
          (candidate) =>
            candidate.trackIndex === trackIndex && candidate.staffIndex === staffIndex
        );
        if (!selected) {
          throw new GuitarProImportError(
            "The selected Guitar Pro track is not available in the current four-string bass or six-string guitar profile.",
            "INVALID_GUITAR_PRO_TRACK_SELECTION"
          );
        }

        return {
          ...selected,
          ignoredTrackCount: Math.max(0, tracks.length - 1),
        };
      }
    '''
)
text = insert_before_once(
    text,
    "  if (supported.length > 1) {",
    selection_logic,
    "normalizer explicit selection",
)
text = replace_once(
    text,
    "  { limits = GUITAR_PRO_LIMITS } = {}\n)",
    "  { limits = GUITAR_PRO_LIMITS, selection = null } = {}\n)",
    "normalizer options",
)
text = replace_once(
    text,
    "  const candidate = selectCandidateStaff(tracks);",
    "  const candidate = selectCandidateStaff(tracks, selection);",
    "normalizer selected candidate",
)
text = text.replace("Checkpoint 3A", "Checkpoint 3C")
write(path, text)

path = "src/guitarProNormalizer.test.js"
text = read(path)
selection_test = textwrap.dedent(
    '''\

      test("normalizes the explicitly selected supported track without decoding again", () => {
        const document = normalizeGuitarProIntermediate(
          intermediate([track("First Guitar"), track("Second Guitar")]),
          { selection: { trackIndex: 1, staffIndex: 0 } }
        );

        expect(document.sourceTrackIndex).toBe(1);
        expect(document.sourceStaffIndex).toBe(0);
        expect(document.sourceTrackName).toBe("Second Guitar");
      });

      test("rejects invalid or unsupported explicit track coordinates", () => {
        expectErrorCode(
          () =>
            normalizeGuitarProIntermediate(intermediate(), {
              selection: { trackIndex: 9, staffIndex: 0 },
            }),
          "INVALID_GUITAR_PRO_TRACK_SELECTION"
        );
      });
    '''
)
text = insert_after_once(
    text,
    textwrap.dedent(
        '''\
          test("rejects more than one supported tablature track", () => {
            expectErrorCode(
              () => normalizeGuitarProIntermediate(intermediate([track("Guitar 1"), track("Guitar 2")])),
              "MULTIPLE_SUPPORTED_GUITAR_PRO_TRACKS"
            );
          });'''
    ),
    selection_test,
    "normalizer selection tests",
)
write(path, text)

# Reader coordinator: return a selection request before normalization and reuse
# an already decoded intermediate on continuation.
write(
    "src/guitarProReaderDocuments.js",
    textwrap.dedent(
        '''\
        import { semanticDocumentToDesktopBlocks } from "./desktopSemanticAdapter";
        import { normalizeGuitarProIntermediate } from "./guitarProNormalizer";
        import { buildGuitarProTrackInventory } from "./guitarProTrackInventory";
        import { decodeGuitarProArchiveProofFile } from "./guitarProWorkerClient";

        async function loadBrowserWorkerFactory() {
          const module = await import("./guitarProBrowserWorkerFactory");
          return module.createGuitarProBrowserWorker;
        }

        export async function buildGuitarProArchiveProofReaderDocuments(
          file,
          {
            workerFactory = null,
            decode = decodeGuitarProArchiveProofFile,
            normalize = normalizeGuitarProIntermediate,
            inventory = buildGuitarProTrackInventory,
            intermediate = null,
            selection = null,
          } = {}
        ) {
          let resolvedIntermediate = intermediate;
          if (!resolvedIntermediate) {
            const resolvedWorkerFactory = workerFactory || (await loadBrowserWorkerFactory());
            resolvedIntermediate = await decode(file, {
              workerFactory: resolvedWorkerFactory,
            });
          }

          const trackInventory = inventory(resolvedIntermediate);
          if (trackInventory.requiresSelection && !selection) {
            return {
              desktopBlocks: [],
              desktopSource: "semantic",
              semanticDocument: null,
              semanticError: null,
              requestedInstrument: null,
              resolvedInstrument: null,
              instrumentWasDetected: false,
              supportOutcome: "track-selection-required",
              sourceFormat: "guitar-pro-archive",
              sourceFormatLabel: "Guitar Pro archive tablature",
              requiresTrackSelection: true,
              trackInventory,
              guitarProIntermediate: resolvedIntermediate,
            };
          }

          const resolvedSelection = selection || trackInventory.autoSelection;
          const semanticDocument = normalize(resolvedIntermediate, {
            selection: resolvedSelection,
          });
          const desktopBlocks = semanticDocumentToDesktopBlocks(semanticDocument);

          return {
            desktopBlocks,
            desktopSource: "semantic",
            semanticDocument,
            semanticError: null,
            requestedInstrument: semanticDocument.instrument,
            resolvedInstrument: semanticDocument.instrument,
            instrumentWasDetected: false,
            supportOutcome: "checkpoint-proof",
            sourceFormat: "guitar-pro-archive",
            sourceFormatLabel: "Guitar Pro archive tablature",
            requiresTrackSelection: false,
            trackInventory,
            guitarProIntermediate: null,
          };
        }
        '''
    ),
)

write(
    "src/guitarProReaderDocuments.test.js",
    textwrap.dedent(
        '''\
        import { buildGuitarProArchiveProofReaderDocuments } from "./guitarProReaderDocuments";
        import { describePlayablePosition } from "./positionDescription";

        const STANDARD_GUITAR = [64, 59, 55, 50, 45, 40];
        const STANDARD_BASS = [43, 38, 33, 28];

        const GP8_VERSION_EVIDENCE = Object.freeze({
          schemaVersion: 1,
          archiveFamily: "GUITAR_PRO_SHARED_ZIP",
          rootVersion: "7.0",
          gpVersion: "8.1.3",
          encodingDescription: "GP8",
          sourceVersion: "GP8",
          entryCount: 6,
        });

        function proofTrack(name, tuning = STANDARD_GUITAR, fret = 3) {
          return {
            name,
            shortName: name,
            isPercussion: false,
            staves: [
              {
                tuningMidiHighToLow: tuning,
                bars: [
                  {
                    sourceNumber: 1,
                    timeSignatureNumerator: 4,
                    timeSignatureDenominator: 4,
                    repeatStart: false,
                    repeatCount: 0,
                    alternateEndings: 0,
                    voices: [
                      {
                        index: 0,
                        beats: [
                          {
                            startTicks: 0,
                            displayDurationTicks: 960,
                            durationDenominator: 4,
                            dots: 0,
                            tupletNumerator: -1,
                            tupletDenominator: -1,
                            graceType: "none",
                            isRest: false,
                            techniques: [],
                            notes: [
                              {
                                stringNumberLowToHigh: 1,
                                fret,
                                visible: true,
                                isDead: false,
                                techniques: [],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          };
        }

        function proofIntermediate(tracks = [proofTrack("Proof Guitar")]) {
          return {
            schemaVersion: 1,
            sourceVersion: "GP8",
            versionEvidence: GP8_VERSION_EVIDENCE,
            title: "Reader proof",
            tracks,
          };
        }

        describe("buildGuitarProArchiveProofReaderDocuments", () => {
          test("decodes once and projects one semantic document into both readers", async () => {
            const file = { name: "proof.gp", size: 4, arrayBuffer: jest.fn() };
            const workerFactory = jest.fn(() => ({ postMessage: jest.fn() }));
            const decode = jest.fn(async () => proofIntermediate());

            const result = await buildGuitarProArchiveProofReaderDocuments(file, {
              workerFactory,
              decode,
            });

            expect(decode).toHaveBeenCalledTimes(1);
            expect(decode).toHaveBeenCalledWith(file, { workerFactory });
            expect(result).toMatchObject({
              desktopSource: "semantic",
              semanticError: null,
              requestedInstrument: "guitar",
              resolvedInstrument: "guitar",
              instrumentWasDetected: false,
              supportOutcome: "checkpoint-proof",
              sourceFormat: "guitar-pro-archive",
              sourceFormatLabel: "Guitar Pro archive tablature",
              requiresTrackSelection: false,
            });
            expect(result.trackInventory.autoSelection).toEqual({
              trackIndex: 0,
              staffIndex: 0,
            });
            expect(result.semanticDocument.positions).toHaveLength(1);
            expect(result.desktopBlocks).toHaveLength(1);
            expect(describePlayablePosition(result.semanticDocument, 0)).toContain(
              "Low E string, fret 3."
            );
          });

          test("returns a selection request instead of silently choosing among supported tracks", async () => {
            const ambiguous = proofIntermediate([
              proofTrack("Lead Guitar"),
              proofTrack("Bass", STANDARD_BASS, 5),
            ]);
            const decode = jest.fn(async () => ambiguous);

            const result = await buildGuitarProArchiveProofReaderDocuments(
              { name: "two-tracks.gp", size: 3, arrayBuffer: jest.fn() },
              { workerFactory: jest.fn(), decode }
            );

            expect(decode).toHaveBeenCalledTimes(1);
            expect(result).toMatchObject({
              requiresTrackSelection: true,
              supportOutcome: "track-selection-required",
              semanticDocument: null,
              guitarProIntermediate: ambiguous,
            });
            expect(result.trackInventory.supportedCount).toBe(2);
            expect(result.trackInventory.supportedItems.map((item) => item.trackName)).toEqual([
              "Lead Guitar",
              "Bass",
            ]);
          });

          test("reuses the decoded intermediate and normalizes the explicit second track", async () => {
            const file = { name: "two-tracks.gp", size: 3, arrayBuffer: jest.fn() };
            const decoded = proofIntermediate([
              proofTrack("Lead Guitar"),
              proofTrack("Bass", STANDARD_BASS, 5),
            ]);
            const decode = jest.fn();

            const result = await buildGuitarProArchiveProofReaderDocuments(file, {
              intermediate: decoded,
              selection: { trackIndex: 1, staffIndex: 0 },
              decode,
            });

            expect(decode).not.toHaveBeenCalled();
            expect(result.requiresTrackSelection).toBe(false);
            expect(result.semanticDocument).toMatchObject({
              sourceTrackIndex: 1,
              sourceTrackName: "Bass",
              instrument: "bass",
            });
            expect(describePlayablePosition(result.semanticDocument, 0)).toContain(
              "E string, fret 5."
            );
          });

          test("propagates worker failures without constructing a partial reader document", async () => {
            const failure = Object.assign(new Error("Corrupt Guitar Pro archive"), {
              code: "CORRUPT_GUITAR_PRO_ARCHIVE",
            });
            const decode = jest.fn(async () => {
              throw failure;
            });

            await expect(
              buildGuitarProArchiveProofReaderDocuments(
                { name: "broken.gp", size: 3, arrayBuffer: jest.fn() },
                { workerFactory: jest.fn(), decode }
              )
            ).rejects.toBe(failure);
          });
        });
        '''
    ),
)

# App: add one intermediate selector state and preserve existing upload/read paths.
path = "src/App.js"
text = read(path)
text = replace_once(
    text,
    'import DesktopSemanticReader from "./DesktopSemanticReader";\n',
    'import DesktopSemanticReader from "./DesktopSemanticReader";\nimport GuitarProTrackSelector from "./GuitarProTrackSelector";\n',
    "App selector import",
)
text = text.replace(
    'const TEST_BUILD_LABEL = "Guitar Pro shared-archive proof 3B";',
    'const TEST_BUILD_LABEL = "Guitar Pro track selection proof 3C";',
)
text = insert_after_once(
    text,
    '  const [desktopError, setDesktopError] = useState("");\n',
    '  const [guitarProSelectionSession, setGuitarProSelectionSession] = useState(null);\n',
    "App selector state",
)
text = insert_after_once(
    text,
    "  const errorHeadingRef = useRef(null);\n",
    "  const trackSelectionHeadingRef = useRef(null);\n",
    "App selector ref",
)
old_focus = textwrap.dedent(
    '''\
            const target =
              pendingIphoneFocusTargetRef.current === "reader"
                ? iphoneHeadingRef.current
                : errorHeadingRef.current;
    '''
).rstrip()
new_focus = textwrap.dedent(
    '''\
            const target =
              pendingIphoneFocusTargetRef.current === "reader"
                ? iphoneHeadingRef.current
                : pendingIphoneFocusTargetRef.current === "track-selection"
                  ? trackSelectionHeadingRef.current
                  : errorHeadingRef.current;
    '''
).rstrip()
text = replace_once(text, old_focus, new_focus, "App iPhone selector focus")

show_selection = textwrap.dedent(
    '''\

      const showGuitarProTrackSelection = (file, readerDocuments) => {
        const session = {
          file,
          intermediate: readerDocuments.guitarProIntermediate,
          inventory: readerDocuments.trackInventory,
        };
        const status = `This Guitar Pro archive contains ${readerDocuments.trackInventory.supportedCount} supported tablature tracks. Choose one to continue.`;

        if (readingMode === "iphone") {
          pendingIphoneFocusTargetRef.current = "track-selection";
          flushSync(() => {
            setDesktopBlocks([]);
            setSemanticDocument(null);
            setIphoneError("");
            setDesktopError("");
            setGuitarProSelectionSession(session);
            setIsReadingFile(false);
            setStatusMessage(status);
            setIphoneFocusRequest((current) => current + 1);
          });
          return;
        }

        setDesktopBlocks([]);
        setSemanticDocument(null);
        setIphoneError("");
        setDesktopError("");
        setGuitarProSelectionSession(session);
        setIsReadingFile(false);
        setStatusMessage(status);
        focusSoon(trackSelectionHeadingRef);
      };
    '''
)
text = insert_before_once(
    text,
    "  const finishUnreadableUpload = (message, status) => {",
    show_selection,
    "App selection presenter",
)
text = insert_after_once(
    text,
    "    setDesktopBlocks([]);\n",
    "    setGuitarProSelectionSession(null);\n",
    "App reset selector on upload",
)
text = replace_once(
    text,
    "        readerDocuments = await buildGuitarProArchiveProofReaderDocuments(file);",
    "        readerDocuments = await buildGuitarProArchiveProofReaderDocuments(file);\n        if (readerDocuments.requiresTrackSelection) {\n          showGuitarProTrackSelection(file, readerDocuments);\n          return;\n        }",
    "App selection request",
)

selection_handler = textwrap.dedent(
    '''\

      const handleGuitarProTrackSelection = async (selection) => {
        const session = guitarProSelectionSession;
        if (!session) return;

        setIsReadingFile(true);
        setStatusMessage("Preparing the selected Guitar Pro track.");
        setIphoneError("");
        setDesktopError("");

        let readerDocuments;
        try {
          readerDocuments = await buildGuitarProArchiveProofReaderDocuments(session.file, {
            intermediate: session.intermediate,
            selection,
          });
        } catch (error) {
          setGuitarProSelectionSession(null);
          finishUnreadableUpload(
            messageFromError(
              error,
              "The selected Guitar Pro track could not be prepared for the Guitar Eyes readers."
            ),
            "The selected Guitar Pro track could not be imported."
          );
          return;
        }

        const nextDocument = readerDocuments.semanticDocument;
        const nextDesktopBlocks = readerDocuments.desktopBlocks;
        const resolvedInstrument = readerDocuments.resolvedInstrument;
        setGuitarProSelectionSession(null);

        if (!nextDocument) {
          finishUnreadableUpload(
            "The selected Guitar Pro track did not produce a semantic reader document.",
            "The selected Guitar Pro track could not be imported."
          );
          return;
        }

        const status = `Imported Guitar Pro archive tablature. Loaded ${nextDocument.positions.length} synchronized positions`;
        if (readingMode === "iphone") {
          commitIphoneOutcome({
            target: "reader",
            semanticDocument: nextDocument,
            desktopBlocks: nextDesktopBlocks,
            status: `${status} in iPhone reading mode.`,
            resolvedInstrument,
          });
          return;
        }

        setDesktopBlocks(nextDesktopBlocks);
        setSemanticDocument(nextDocument);
        setIphoneError("");
        setDesktopError("");
        setSelectedInstrument(resolvedInstrument);
        setIsReadingFile(false);
        setStatusMessage(`${status} in desktop semantic reader mode.`);
        desktopFocusPendingRef.current = true;
      };
    '''
)
text = insert_before_once(
    text,
    "  const handleReadingModeChange = (event) => {",
    selection_handler,
    "App selection submit handler",
)
text = replace_once(
    text,
    '    if (nextMode === "iphone") {\n      if (semanticDocument) {',
    '    if (nextMode === "iphone") {\n      if (guitarProSelectionSession) {\n        pendingIphoneFocusTargetRef.current = "track-selection";\n        setIphoneFocusRequest((current) => current + 1);\n      } else if (semanticDocument) {',
    "App iPhone mode selector focus",
)
text = replace_once(
    text,
    "    pendingIphoneFocusTargetRef.current = null;\n    if (semanticDocument || desktopBlocks.length > 0) {",
    "    pendingIphoneFocusTargetRef.current = null;\n    if (guitarProSelectionSession) {\n      focusSoon(trackSelectionHeadingRef);\n    } else if (semanticDocument || desktopBlocks.length > 0) {",
    "App desktop mode selector focus",
)
selector_render = textwrap.dedent(
    '''\

          {guitarProSelectionSession && (
            <GuitarProTrackSelector
              ref={trackSelectionHeadingRef}
              inventory={guitarProSelectionSession.inventory}
              onSubmit={handleGuitarProTrackSelection}
              disabled={isReadingFile}
            />
          )}
    '''
)
text = insert_after_once(
    text,
    '      <div className="status-message" aria-live="polite" aria-atomic="true">\n        {statusMessage}\n      </div>\n',
    selector_render,
    "App selector render",
)
write(path, text)

# App integration test: picker return -> selector -> explicit second track -> reader.
path = "src/App.guitarPro.test.js"
text = read(path)
selection_test = textwrap.dedent(
    '''\

      test("moves VoiceOver focus into track selection and reuses the decoded archive", async () => {
        useTouchDevice();
        const intermediate = {
          schemaVersion: 1,
          sourceVersion: "GP8",
          versionEvidence: GP8_VERSION_EVIDENCE,
          title: "Two-track proof",
          tracks: [],
        };
        const inventory = {
          supportedCount: 2,
          supportedItems: [
            {
              id: "guitar-pro-track-1-staff-1",
              trackIndex: 0,
              staffIndex: 0,
              selectionLabel: "Lead Guitar. six-string guitar. Tuning high to low: E4, B3, G3, D3, A2, E2. 1 measure.",
              supported: true,
            },
            {
              id: "guitar-pro-track-2-staff-1",
              trackIndex: 1,
              staffIndex: 0,
              selectionLabel: "Bass. four-string bass. Tuning high to low: G2, D2, A1, E1. 1 measure.",
              supported: true,
            },
          ],
          items: [],
        };
        buildGuitarProArchiveProofReaderDocuments
          .mockResolvedValueOnce({
            requiresTrackSelection: true,
            trackInventory: inventory,
            guitarProIntermediate: intermediate,
          })
          .mockResolvedValueOnce(proofReaderDocuments());
        render(<App />);

        const file = new File([new Uint8Array([1, 2, 3])], "two-tracks.gp", {
          type: "application/octet-stream",
        });
        fireEvent.change(screen.getByLabelText("Upload tablature file:"), {
          target: { files: [file] },
        });

        const selectorHeading = await screen.findByRole("heading", {
          level: 2,
          name: "Choose a Guitar Pro track",
        });
        fireEvent.focus(window);
        await waitFor(() => expect(document.activeElement).toBe(selectorHeading));

        fireEvent.click(screen.getByRole("radio", { name: /Bass\. four-string bass/i }));
        fireEvent.click(screen.getByRole("button", { name: "Load selected track" }));

        expect(buildGuitarProArchiveProofReaderDocuments).toHaveBeenNthCalledWith(2, file, {
          intermediate,
          selection: { trackIndex: 1, staffIndex: 0 },
        });
        const readerHeading = await screen.findByRole("heading", {
          level: 2,
          name: "iPhone tablature reader",
        });
        await waitFor(() => expect(document.activeElement).toBe(readerHeading));
      });
    '''
)
text = insert_before_once(
    text,
    '  test("routes GP decoder failure through the durable iPhone upload error", async () => {',
    selection_test,
    "App selector integration test",
)
write(path, text)

# Reuse existing layout language and add a compact selector boundary.
path = "src/App.css"
text = read(path)
text = text.replace(
    ".desktop-instructions-control {\n  margin-block: 1rem;\n}",
    ".desktop-instructions-control,\n.guitar-pro-track-selector {\n  margin-block: 1rem;\n}",
)
text = text.replace(
    ".desktop-keyboard-navigator {\n  border: 2px solid currentColor;",
    ".desktop-keyboard-navigator,\n.guitar-pro-track-selector {\n  border: 2px solid currentColor;",
)
text += textwrap.dedent(
    '''\

    .guitar-pro-track-options {
      display: grid;
      gap: 0.75rem;
      margin-block: 0.75rem 1rem;
    }

    .guitar-pro-track-options label {
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      min-height: 44px;
    }

    .guitar-pro-track-options input[type="radio"] {
      width: 1.35rem;
      height: 1.35rem;
      flex: 0 0 auto;
    }
    '''
)
write(path, text)

# Build identity and current status.
for path in ["public/index.html", "src/App.test.js", "src/buildIdentity.test.js"]:
    text = read(path).replace(
        "Guitar Pro shared-archive proof 3B",
        "Guitar Pro track selection proof 3C",
    )
    write(path, text)

path = "docs/implementation-status.md"
text = read(path)
start = text.index("## Current bounded checkpoint:")
end = text.index("## Testing responsibility", start)
section = textwrap.dedent(
    '''\
    ## Current bounded checkpoint: Guitar Pro track selection proof 3C

    Preserve the verified shared-archive GP8 evidence and add explicit track inventory and selection without decoding the file twice.

    Checkpoint 3C must:

    1. build a serializable inventory for every decoded track and staff;
    2. report track name, staff number, percussion status, string count, tuning, measure count, support status, and support reason;
    3. continue automatically only when exactly one supported four-string bass or six-string guitar staff exists;
    4. require explicit track and staff coordinates when more than one supported staff exists;
    5. reuse the decoded intermediate after selection and never rerun alphaTab;
    6. reject invalid or unsupported selection coordinates;
    7. present supported tracks as one accessible radio group and report unsupported tracks separately;
    8. move iPhone VoiceOver focus to the selector heading after picker return and to the reader heading after submission;
    9. preserve all inherited ASCII, MusicXML, shared-archive, desktop, iPhone, speech, timing, resource, and focus tests;
    10. stop before publication and real-iPhone testing.

    The current branch remains an unhosted proof. Playback, teacher mode, looping, bookmarks, pattern analysis, AI work, commercial scraping, a pull request, merge, upstream change, and production publication remain outside this checkpoint.

    '''
)
text = text[:start] + section + text[end:]
write(path, text)

print("Guitar Pro track selection checkpoint source prepared")
