import React, { useContext, useCallback } from "react";
import ProjectSettingsContext from "./ProjectSettingsContext";
import * as MD from "../lib/music-data";

type FretNoteProps = { note: Music.Note, fret: Instrument.Fret };

const FretNote = (props: FretNoteProps) => {
  const { fret, note } = props;
  const projectSettings : Project.Settings | null = useContext(ProjectSettingsContext);
  const modalNotes = projectSettings!.modalNotes || [];
  const isModalNote = modalNotes.map(mn => mn[1]).indexOf(note) !== -1;

  const shouldBeHidden = (projectSettings!.whiteKeysOnly && MD.hasAccidental(note))
    || (projectSettings!.modalNotesOnly && !isModalNote)

  const nutClass = fret === 0 ? "bold" : "";
  const innerFretClass = fret === 0 || fret === 12 || fret === 24 ? "t-85" : "t-50";
  const modalNoteClass = isModalNote && !shouldBeHidden ? "hl-bg bold" : "";

  const onMouseDown = useCallback((e: any) => {
    const synth : Tone.BaseSynth | undefined = projectSettings!.synths["default"];
    synth!.triggerAttackRelease(note, "16n");
    e.preventDefault();
  }, [ projectSettings, note ]);

  if (shouldBeHidden) {
    return <div key={note} className={`w2-h2 border-on-hover centered-text flex-centered ${nutClass} border-transparent cursor-pointer ${modalNoteClass}`}>
    </div>
  }

  const formattedNote = projectSettings!.showOctaves ? note : note.replace(/[0-9]|-/, "");

  return (
    <div key={note} onMouseDown={onMouseDown} className={`w2-h2 border-on-hover centered-text flex-centered ${nutClass} border-transparent cursor-pointer ${modalNoteClass}`}>
      <div className={`${innerFretClass}`}>{ shouldBeHidden ? "" : formattedNote }</div>
    </div>
  );
};

export default FretNote;
