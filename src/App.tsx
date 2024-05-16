import React, { useState } from "react";
import { useContext } from "react";
import './App.css';
// import "./@types/index.d.ts";
import * as MD from "./lib/music-data";
import "tone";
import ProjectSettingsContext from "./components/ProjectSettingsContext";
import FretNote from "./components/FretNote";
import NoteBucket from "./components/NoteBucket";
import SynthSettings from "./components/SynthSettings";

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
    <>
      <h3>Guitar fretboard (v0.1.0)</h3>
      <div className="monospaced max-width-100 overflow-x-auto flex-column-start">
        <div className="t-130 non-hl-bg">
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
    </>
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
      <h3>Global Settings</h3>
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

const distortion = new Tone.Distortion(0.2).toDestination();
const synths : Audio.SynthMap = {
  // "default": new Tone.Synth().toDestination()
  "default": new Tone.Synth().connect(distortion)
};

const setEnvelope = (synthID: keyof (typeof synths), envelope: Audio.Envelope): void => {
  const attack = envelope.attack * 2 / 100;
  const decay = envelope.decay * 2 / 100;
  const sustain = envelope.sustain * 1 / 100;
  const release = envelope.release * 5 / 100;
  const newEnvelope = { attack, decay, sustain, release };
  synths[synthID].envelope = newEnvelope;
};

console.log(synths.default);

const APP_VERSION = "v0.9.0";

const App = () => {
  const [ root, setRoot ] = useState<Music.NoteName>("C");
  const [ mode, setMode ] = useState<Music.Mode>(MD.MODES_ALL[0][0]);
  const [ showOctaves, setShowOctaves ] = useState(true);
  const [ whiteKeysOnly, setWhiteKeysOnly ] = useState(false);
  const [ modalNotesOnly, setModalNotesOnly ] = useState(false);
  const [ noteBucket, setNoteBucket ] = useState<Project.NoteBucket>([ null, [] ]);
  const modalNotes = MD.modalNotes(root, mode, MD.MODES_ALL, indexedNotes);
  const audioEnvironment = { synths, setEnvelope, effects: { default: [ distortion ] } };
  return (
    <ProjectSettingsContext.Provider value={{ root, mode, indexedNotes, modalNotes, showOctaves, whiteKeysOnly, modalNotesOnly, noteBucket, audioEnvironment, setNoteBucket }}>
      <h2><strong>Music Theory Tool Suite ({APP_VERSION})</strong></h2>
      <div>The notes for <strong>{root} {mode}</strong> are highlighted:</div>
      <Fretboard />
      <NoteBucket />
      <SynthSettings />
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
