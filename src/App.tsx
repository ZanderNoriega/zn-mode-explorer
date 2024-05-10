import React, { useState } from "react";
import { createContext, useContext } from "react";
import './App.css';
// import "./@types/index.d.ts";
import * as MD from "./lib/music-data";

// console.log(MD.getNextFrom("A4", 12, xs));
const indexedNotes = MD.generateNoteIndexes();

type ProjectSettings = { 
  mode: Music.Mode,
  indexedNotes: MusicData.IndexedNote[],
  showOctaves: boolean,
  whiteKeysOnly: boolean,
};
const ProjectSettingsContext = createContext<ProjectSettings | null>(null);

let defaultFrets : number[] = [];
for (let i = 0; i < 23; i++) {
  defaultFrets.push(i);
}

const markedFrets = [3, 5, 7, 9, 12, 15, 17, 19, 22];

type FretNoteProps = { note: Music.Note, fret: Instrument.Fret };

const FretNote = (props: FretNoteProps) => {
  const { fret, note } = props;
  const projectSettings = useContext(ProjectSettingsContext);
  const markedFretClass = markedFrets.indexOf(fret) !== -1 ? "bold" : "";
  const nutClass = fret === 0 ? "bold" : "";
  const innerFretClass = fret === 0 ? "" : "t-50";
  const formattedNote = projectSettings!.showOctaves ? note : note.replace(/[0-9]|-/, "");

  return (
    <div key={note} className={`w2-h2 hoverable centered-text flex-centered ${nutClass} ${markedFretClass} border-right cursor-pointer`}>
      <div className={`${innerFretClass}`}>{projectSettings!.whiteKeysOnly ? ( MD.hasAccidental(note) ? "" : formattedNote) : formattedNote }</div>
    </div>
  );
};

const Fretboard = () => {
  const [guitarTuning, setGuitar] = useState<Instrument.Tuning>([
    "E4",
    "B3",
    "G3",
    "D3",
    "A2",
    "E2",
  ]);
  const [guitarStrings, setGuitarStrings] = useState(6);
  const [neckLength, setNeckLength] = useState(24);

  const [frets, setFrets] = useState(defaultFrets);

  return (
    <>
      <div className="border" style={{ width: "100%", background: "#ac6227" }}>
        { 
          guitarTuning.map(note => (
            <div className="flex-centered string" key={`${note}-string`}>
              { MD.getNextFrom(note, frets.length, indexedNotes).map(([i, note], fret) => <FretNote key={note} note={note} fret={fret} />) }
            </div>
          ))
        }
      </div>
      <div className="flex-centered">
        { frets.map(n =>
            <div key={`fret-${n}`} className="w2-h2 hoverable centered-text flex-centered border-right">
              <div className="t-50">{ n }</div>
            </div>
          )
        }
      </div>
    </>
  );
};

const MODES : Music.Mode[] = [
  "ionian",
  "dorian",
  "phrygian",
  "lydian",
  "mixolydian",
  "aeolian",
  "locrian",
];

type ProjectSettingsFormProps = {
  setMode: (m: Music.Mode) => void
  setShowOctaves: (b: boolean) => void
  setWhiteKeysOnly: (b: boolean) => void
};
const ProjectSettingsForm = (props: ProjectSettingsFormProps) => {
  const { setMode, setShowOctaves, setWhiteKeysOnly } = props;
  const projectSettings = useContext(ProjectSettingsContext);
  return (
    <div>
      <h2>Settings</h2>
      Mode <select onChange={e => setMode(e.target.value as Music.Mode)}>
        {MODES.map((mode) => (
          <option key={mode} value={mode}>
            {mode}
          </option>
        ))}
      </select>
      <div>
        Show octaves <input type="checkbox" checked={projectSettings!.showOctaves} onChange={e => setShowOctaves(e.target.checked)} />
      </div>
      <div>
        White keys only <input type="checkbox" checked={projectSettings!.whiteKeysOnly} onChange={e => setWhiteKeysOnly(e.target.checked)} />
      </div>
    </div>
  );
};

const App = () => {
  const [ mode, setMode ] = useState<Music.Mode>("ionian");
  const [ showOctaves, setShowOctaves ] = useState(true);
  const [ whiteKeysOnly, setWhiteKeysOnly ] = useState(false);
  return (
    <ProjectSettingsContext.Provider value={{ mode, indexedNotes, showOctaves, whiteKeysOnly }}>
      <div>Studying the <strong>{mode}</strong> mode.</div>
      <h2>Guitar</h2>
      <Fretboard />
      <ProjectSettingsForm
        setMode={setMode}
        setShowOctaves={setShowOctaves}
        setWhiteKeysOnly={setWhiteKeysOnly} />
    </ProjectSettingsContext.Provider>
  );
};

export default App;
