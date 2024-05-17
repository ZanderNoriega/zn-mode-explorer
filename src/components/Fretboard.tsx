import React, { useState, useCallback, useMemo, memo } from "react";
import * as MD from "../lib/music-data";
import FretNote from "./FretNote";

type NotesSelectProps = { defaultValue: Music.Note, onChange: (x: Music.Note) => void };

const NotesSelect = memo((props: NotesSelectProps) => {
  const { defaultValue, onChange } = props;
  const [ value, setValue ] = useState<Music.Note>(defaultValue);

  const handleOptionChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value : Music.Note = e.target.value as Music.Note;
    setValue(value);
    onChange(value)
  }, [ setValue, onChange ]);

  return (
    <select value={value} onChange={handleOptionChange}>
      {
        MD.indexedNotes.map(([index, note]) => (
          <option key={`${index}${note}`} value={note}>{ note }</option>
        ))
      }
    </select>
  );
});

type StringSide = "low" | "high";

type FretboardSettingsProps = {
  tuning: Instrument.Tuning,
  setTuning: (x: Instrument.Tuning | ((x: Instrument.Tuning) => Instrument.Tuning)) => void
};
const FretboardSettings = (props: FretboardSettingsProps) => {
  const { tuning, setTuning } = props;
  const reversedTuning = useMemo(() => tuning.concat([]).reverse(), [ tuning ]);
  const onChangeTuning = useCallback((reverseArrayIndex: number) => (note: Music.Note) => {
    const tuningArrayIndex : number = Math.abs(reverseArrayIndex - (reversedTuning.length - 1));
    setTuning((prev: Instrument.Tuning) =>
      prev.map((oldNote : Music.Note, i: number) => i === tuningArrayIndex ? note : oldNote)
    );

  }, [ setTuning, reversedTuning.length ]);

  const onClickAddString = useCallback((side: StringSide) => () => {
    if (side === "low") {
      const currentLowest : Music.Note = reversedTuning[0];
      const currentLowestMusicDataIndex : number = MD.getNoteIndex(currentLowest, MD.indexedNotes) || 0;
      const fifthBelowLowestIndex : number = currentLowestMusicDataIndex - 5;
      const fifthBelowLowest : MusicData.IndexedNote | undefined = MD.indexedNotes[fifthBelowLowestIndex];
      const newString : Music.Note = fifthBelowLowest ? fifthBelowLowest[1] : currentLowest;
      setTuning(prev => prev.concat([ newString ]));
    } else {
      const currentHighest : Music.Note = tuning[0];
      const currentHighestMusicDataIndex : number = MD.getNoteIndex(currentHighest, MD.indexedNotes) || (MD.indexedNotes.length - 1);
      const fourthAboveHighestIndex : number = currentHighestMusicDataIndex + 5;
      const fourthAboveHighest : MusicData.IndexedNote | undefined = MD.indexedNotes[fourthAboveHighestIndex];
      const newString : Music.Note = fourthAboveHighest ? fourthAboveHighest[1] : currentHighest;
      setTuning(prev => [ newString ].concat(prev));
    }
  }, [ reversedTuning, setTuning, tuning ]);

  const onClickRemoveString = useCallback((side: StringSide) => () => {
    if (tuning.length < 2) {
      return;
    }
    if (side === "low") {
      setTuning(prev => prev.slice(0, prev.length - 1));
    } else {
      setTuning(prev => prev.slice(1));
    }
  }, [ setTuning, tuning ]);

  const onClickShiftAll = useCallback((semitones: number) => () => {
    setTuning(prev => {
      return prev.map(note => {
        const maybeMusicDataIndex : number | undefined = MD.getNoteIndex(note, MD.indexedNotes);
        if (maybeMusicDataIndex === undefined) {
          return note;
        } else {
          const musicDataIndex : number = maybeMusicDataIndex;
          const newMusicDataIndex : number = musicDataIndex + semitones;
          if (newMusicDataIndex > (MD.indexedNotes.length - 1) || newMusicDataIndex < 0) {
            return note;
          } else {
            return MD.indexedNotes[newMusicDataIndex][1];
          }
        }
      });
    });
  }, [ setTuning ]);

  return (
    <>
      <h4>Strings & tuning</h4>
      <div className="flex-centered spaced-children-h margin-v-xs">
        <button onClick={onClickAddString("low")}>add</button>
        <button onClick={onClickRemoveString("low")}>remove</button>
        { 
          reversedTuning.map((note, i) => (
            <NotesSelect defaultValue={note} onChange={onChangeTuning(i)} key={`${note}-${i}-${tuning.length}`} />
          ))
        }
        <button onClick={onClickAddString("high")}>add</button>
        <button onClick={onClickRemoveString("high")}>remove</button>
      </div>
      <div className="flex-centered spaced-children-h margin-v-xs">
        <button onClick={onClickShiftAll(-12)}>Octave Down</button>
        <button onClick={onClickShiftAll(12)}>Octave Up</button>
      </div>
    </>
  )
};

let defaultFrets : number[] = [];
for (let i = 0; i < 25; i++) {
  defaultFrets.push(i);
}

const markedFrets = [3, 5, 7, 9, 12, 15, 17, 19, 22, 24];

const VERSION = "v0.2.0";

type FretboardState = "initial" | "configure";

const Fretboard = () => {
  const [ fretboardState, setFretboardState ] = useState<FretboardState>("initial");
  const [ tuning, setTuning] = useState<Instrument.Tuning>([
    "E4",
    "B3",
    "G3",
    "D3",
    "A2",
    "E2",
  ]);
  const [neckLength, setNeckLength] = useState(24);

  const [frets, setFrets] = useState(defaultFrets);

  const onSettingsToggle = useCallback(() => {
    setFretboardState(prev => prev === "configure" ? "initial" : "configure")
  }, [ setFretboardState ]);

  const settingsToggleBtnText = fretboardState === "configure" ? "Hide settings" : "Show settings";

  return (
    <>
      <h3>Fretboard ({VERSION}) <button onClick={onSettingsToggle}>{ settingsToggleBtnText }</button></h3>
      { fretboardState === "configure" && <FretboardSettings tuning={tuning} setTuning={setTuning} /> }
      <div className="monospaced max-width-100 overflow-x-auto flex-column-start">
        <div className="t-130 non-hl-bg">
          { 
             tuning.map((note, gtrStr) => (
              <div className="flex-centered string" key={`${note}-${gtrStr}`}>
                { MD.getNotesFrom(note, frets.length, MD.indexedNotes).map(([i, note], fret) => <FretNote key={note} note={note} fret={fret} string={gtrStr} />) }
              </div>
            ))
          }
        </div>
        <div className="flex-centered t-130">
          { frets.map(n => {
              const markedFretClass = markedFrets.indexOf(n) !== -1 ? "bold" : "";
              return (<div key={`fret-${n}`} className={`w2-h2 border-transparent border-on-hover centered-text flex-centered border-right ${markedFretClass}`}>
                <div className="t-50">{ n }</div>
              </div>);
              }
            )
          }
        </div>
      </div>
    </>
  );
};

export default Fretboard;
