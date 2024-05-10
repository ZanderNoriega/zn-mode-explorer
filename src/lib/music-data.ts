import * as M from "./music";

export const generateNoteIndexes = (): MusicData.IndexedNote[] => {
  let xs: MusicData.IndexedNote[] = [];
  let currentName : Music.NoteName = "C";
  for (let i = 0, octave = -1; i < 128; i++) {
    if (i % 12 === 0 && i > 0) {
      octave++;
    }
    xs.push([ i, `${currentName}${octave as Music.NoteOctave}` ]);
    currentName = M.nextNoteNameChromaticSharps(currentName);
  }
  return xs;
}

export const getNextFrom = (from: Music.Note, count: number, iNotes: MusicData.IndexedNote[]):  MusicData.IndexedNote[] => {
  let xs : MusicData.IndexedNote[] = [];
  let grab : boolean = false;
  for (let i = 0; i < iNotes.length && xs.length < count; i++) {
    const [ index, note ] = iNotes[i];
    if (note === from) {
      grab = true;
    }
    if (grab && xs.length < count) {
      xs.push([ index, note ]);
    }
  }
  return xs;
}

export const hasAccidental = (note: Music.Note): boolean =>
  note.indexOf("b") !== -1 || note.indexOf("#") !== -1

export const MODES : Music.Mode[] = [
  "ionian",
  "dorian",
  "phrygian",
  "lydian",
  "mixolydian",
  "aeolian",
  "locrian",
];

export const ROOTS : Music.NoteName[] = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export const modalNotes = (root: Music.NoteName, mode: Music.Mode, indexedNotes: MusicData.IndexedNote[]): MusicData.IndexedNote[] => {

  // start from the right indexedNotes index
  let startingIndex = 0;
  for (let i = 0; i < indexedNotes.length; i++) {
    startingIndex = i;
    const [ , noteName ] : MusicData.IndexedNote =  indexedNotes[i];
    if (noteName.indexOf(root) !== -1) {
      break;
    }
  }

  // so we start from the right distance element
  const modeIndex = MODES.reduce((acc, m, i) => {
    return m === mode ? i : acc;
  }, 0);
  let distanceIndex = modeIndex;
  const xs : MusicData.IndexedNote[] = [];
  for (let i = startingIndex; i < indexedNotes.length;) {
    const distance = M.majorScaleDistances[distanceIndex];
    xs.push(indexedNotes[i]);
    i = i + distance;
    distanceIndex = (distanceIndex + 1) % M.majorScaleDistances.length;
  }

  return xs;
}
