import React, { useState } from "react";
import { useContext } from "react";
import './App.css';
// import "./@types/index.d.ts";
import * as MD from "./lib/music-data";
import "tone";
import ProjectSettingsContext from "./components/ProjectSettingsContext";
import FretNote from "./components/FretNote";
import NoteBucket from "./components/NoteBucket";

const indexedNotes = MD.generateNoteIndexes();

let defaultFrets : number[] = [];
for (let i = 0; i < 25; i++) {
  defaultFrets.push(i);
}

const markedFrets = [3, 5, 7, 9, 12, 15, 17, 19, 22, 24];

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
    <div className="monospaced max-width-100 overflow-x-auto flex-column-start">
      <div className="t-130" style={{ background: "rgb(164 117 79 / 80%)" }}>
        { 
          guitarTuning.map((note, gtrStr) => (
            <div className="flex-centered string" key={`${note}-string`}>
              { MD.getNotesFrom(note, frets.length, indexedNotes).map(([i, note], fret) => <FretNote key={note} note={note} fret={fret} string={gtrStr} />) }
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
      <div>
        Root:
        <select onChange={e => setRoot(e.target.value as Music.NoteName)}>
          {MD.ROOTS.map((noteName) => (
            <option key={noteName} value={noteName}>
              {noteName}
            </option>
          ))}
        </select>
        Mode:
        <select onChange={e => setMode(e.target.value as Music.Mode)}>
          {
            (Object.keys(MD.MODES) as Music.BaseScale[]).map((baseScale: Music.BaseScale) =>
              <optgroup key={baseScale} label={baseScale}>
                { MD.MODES[baseScale].map((mode) => (
                  <option key={mode} value={mode}>
                    {mode}
                  </option>
                  ))
                }
              </optgroup>
            )
          }
        </select>
      </div>
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

const synths : Audio.SynthMap = {
  "default": new Tone.Synth().toDestination()
};

const APP_VERSION = "v0.5.0";

const App = () => {
  const [ root, setRoot ] = useState<Music.NoteName>("C");
  const [ mode, setMode ] = useState<Music.Mode>(MD.MODES_ALL[0][0]);
  const [ showOctaves, setShowOctaves ] = useState(true);
  const [ whiteKeysOnly, setWhiteKeysOnly ] = useState(false);
  const [ modalNotesOnly, setModalNotesOnly ] = useState(false);
  const [ noteBucket, setNoteBucket ] = useState<Project.NoteBucket>([ null, [] ]);
  const modalNotes = MD.modalNotes(root, mode, MD.MODES_ALL, indexedNotes);
  return (
    <ProjectSettingsContext.Provider value={{ root, mode, indexedNotes, modalNotes, showOctaves, whiteKeysOnly, modalNotesOnly, noteBucket, synths, setNoteBucket }}>
      <h1><a href="/">ZanderNoriega.com</a> - Music Theory Tool Suite ({APP_VERSION})</h1>
      <h2>The modes on the guitar fretboard</h2>
      <div>The notes for <strong>{root} {mode}</strong> are highlighted:</div>
      <Fretboard />
      <NoteBucket />
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
