import { fireEvent, render, screen } from "@testing-library/react";
import GuitarProTrackSelector from "./GuitarProTrackSelector";

const inventory = {
  supportedItems: [
    {
      id: "guitar-pro-track-1-staff-1",
      trackIndex: 0,
      staffIndex: 0,
      selectionLabel:
        "Lead Guitar. six-string guitar. Tuning high to low: E4, B3, G3, D3, A2, E2. 4 measures.",
    },
    {
      id: "guitar-pro-track-2-staff-1",
      trackIndex: 1,
      staffIndex: 0,
      selectionLabel:
        "Bass. four-string bass. Tuning high to low: G2, D2, A1, E1. 4 measures.",
    },
  ],
  items: [
    {
      id: "guitar-pro-track-1-staff-1",
      trackIndex: 0,
      staffIndex: 0,
      supported: true,
    },
    {
      id: "guitar-pro-track-2-staff-1",
      trackIndex: 1,
      staffIndex: 0,
      supported: true,
    },
    {
      id: "guitar-pro-track-3-staff-1",
      trackName: "Drums",
      staffNumber: 1,
      supported: false,
      reason: "Percussion tracks do not contain fretted tablature coordinates.",
    },
  ],
};

describe("GuitarProTrackSelector", () => {
  test("requires an explicit radio choice before submission", () => {
    const onSubmit = jest.fn();
    render(<GuitarProTrackSelector inventory={inventory} onSubmit={onSubmit} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Choose a Guitar Pro track" })
    ).toBeInTheDocument();
    expect(screen.getByText(/This file contains 2 supported tablature tracks/i)).toHaveTextContent(
      /No track is selected/i
    );
    expect(screen.getByText(/separate Guitar or Bass control does not filter/i)).toBeInTheDocument();

    const lead = screen.getByRole("radio", { name: /Lead Guitar/i });
    const bass = screen.getByRole("radio", { name: /Bass/i });
    const load = screen.getByRole("button", { name: "Load selected track" });

    expect(lead).not.toBeChecked();
    expect(bass).not.toBeChecked();
    expect(load).toBeDisabled();

    fireEvent.click(bass);
    expect(bass).toBeChecked();
    expect(load).toBeEnabled();
    fireEvent.click(load);

    expect(onSubmit).toHaveBeenCalledWith({ trackIndex: 1, staffIndex: 0 });
  });

  test("reports unsupported tracks and disables submission while loading", () => {
    render(
      <GuitarProTrackSelector inventory={inventory} onSubmit={jest.fn()} disabled />
    );

    expect(screen.getByText(/Drums, staff 1/i)).toHaveTextContent(
      /Percussion tracks do not contain fretted tablature coordinates/i
    );
    expect(screen.getByRole("button", { name: "Load selected track" })).toBeDisabled();
  });
});
