import React, { useState } from "react";
import { createContext, useContext } from "react";
import './App.css';
// import "./@types/index.d.ts";
import * as MD from "./lib/music-data";

// console.log(MD.getNextFrom("A4", 12, xs));
const indexedNotes = MD.generateNoteIndexes();

type ProjectSettings = { 
  root: Music.NoteName,
  mode: Music.Mode,
  indexedNotes: MusicData.IndexedNote[],
  modalNotes: MusicData.IndexedNote[],
  showOctaves: boolean,
  whiteKeysOnly: boolean,
  modalNotesOnly: boolean,
};
const ProjectSettingsContext = createContext<ProjectSettings | null>(null);

let defaultFrets : number[] = [];
for (let i = 0; i < 25; i++) {
  defaultFrets.push(i);
}

const markedFrets = [3, 5, 7, 9, 12, 15, 17, 19, 22, 24];

type FretNoteProps = { note: Music.Note, fret: Instrument.Fret };

const FretNote = (props: FretNoteProps) => {
  const { fret, note } = props;
  const projectSettings = useContext(ProjectSettingsContext);
  const modalNotes = projectSettings!.modalNotes || [];
  const formattedNote = projectSettings!.showOctaves ? note : note.replace(/[0-9]|-/, "");
  const isModalNote = modalNotes.map(mn => mn[1]).indexOf(note) !== -1;

  const nutClass = fret === 0 ? "bold" : "";
  const innerFretClass = fret === 0 ? "" : "t-50";
  const modalNoteClass = isModalNote ? "hl-bg bold" : "";

  const shouldBeHidden = (projectSettings!.whiteKeysOnly && MD.hasAccidental(note))
    || (projectSettings!.modalNotesOnly && !isModalNote)

  return (
    <div key={note} className={`w2-h2 hoverable centered-text flex-centered ${nutClass} border-right cursor-pointer ${modalNoteClass}`}>
      <div className={`${innerFretClass}`}>{ shouldBeHidden ? "" : formattedNote }</div>
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
    <div className="max-width-100 overflow-x-auto flex-column-start">
      <div className="border t-130" style={{ background: "rgb(164 117 79 / 80%)" }}>
        { 
          guitarTuning.map(note => (
            <div className="flex-centered string" key={`${note}-string`}>
              { MD.getNextFrom(note, frets.length, indexedNotes).map(([i, note], fret) => <FretNote key={note} note={note} fret={fret} />) }
            </div>
          ))
        }
      </div>
      <div className="flex-centered border t-130">
        { frets.map(n => {
            const markedFretClass = markedFrets.indexOf(n) !== -1 ? "bold" : "";
            return (<div key={`fret-${n}`} className={`w2-h2 hoverable centered-text flex-centered border-right ${markedFretClass}`}>
              <div className="t-50">{ n }</div>
            </div>);
            }
          )
        }
      </div>
    </div>
  );
};

type ProjectSettingsFormProps = {
  setRoot: (x: Music.NoteName) => void,
  setMode: (x: Music.Mode) => void,
  setShowOctaves: (x: boolean) => void,
  setWhiteKeysOnly: (x: boolean) => void,
  setModalNotesOnly: (x: boolean) => void,
};
const ProjectSettingsForm = (props: ProjectSettingsFormProps) => {
  const { setRoot, setMode, setShowOctaves, setWhiteKeysOnly, setModalNotesOnly } = props;
  const projectSettings = useContext(ProjectSettingsContext);
  return (
    <div>
      <h2>Settings</h2>
      Mode
      <select onChange={e => setRoot(e.target.value as Music.NoteName)}>
        {MD.ROOTS.map((noteName) => (
          <option key={noteName} value={noteName}>
            {noteName}
          </option>
        ))}
      </select>
      <select onChange={e => setMode(e.target.value as Music.Mode)}>
        {MD.MODES.map((mode) => (
          <option key={mode} value={mode}>
            {mode}
          </option>
        ))}
      </select>
      <div>
        Show octaves <input type="checkbox" checked={projectSettings!.showOctaves} onChange={e => setShowOctaves(e.target.checked)} />
      </div>
      <div>
        Show white keys only <input type="checkbox" checked={projectSettings!.whiteKeysOnly} onChange={e => setWhiteKeysOnly(e.target.checked)} />
      </div>
      <div>
        Show modal notes only <input type="checkbox" checked={projectSettings!.modalNotesOnly} onChange={e => setModalNotesOnly(e.target.checked)} />
      </div>
    </div>
  );
};

const App = () => {
  const [ root, setRoot ] = useState<Music.NoteName>("C");
  const [ mode, setMode ] = useState<Music.Mode>("ionian");
  const [ showOctaves, setShowOctaves ] = useState(true);
  const [ whiteKeysOnly, setWhiteKeysOnly ] = useState(false);
  const [ modalNotesOnly, setModalNotesOnly ] = useState(false);
  const modalNotes = MD.modalNotes(root, mode, indexedNotes);
  return (
    <ProjectSettingsContext.Provider value={{ root, mode, indexedNotes, modalNotes, showOctaves, whiteKeysOnly, modalNotesOnly }}>
      <h1>Zander Noriega - Music Education Tool Suite (v0.1)</h1>
      <h2>The modes on the guitar fretboard</h2>
      <div>The notes for <strong>{root} {mode}</strong> are highlighted:</div>
      <Fretboard />
      <ProjectSettingsForm
        setRoot={setRoot}
        setMode={setMode}
        setShowOctaves={setShowOctaves}
        setWhiteKeysOnly={setWhiteKeysOnly}
        setModalNotesOnly={setModalNotesOnly} />
    </ProjectSettingsContext.Provider>
  );
};

export default App;
