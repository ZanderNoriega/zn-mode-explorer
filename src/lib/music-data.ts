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

export const MODES : Music.ModesMap = {
  major: [
    "ionian",
    "dorian",
    "phrygian",
    "lydian",
    "mixolydian",
    "aeolian",
    "locrian",
  ],
  // https://en.wikipedia.org/wiki/Harmonic_minor_scale
  harmonicMinor: [
    "aeolian #7",
    "locrian ♮6",
    "augmented major",
    "dorian #11",
    "phrygian dominant",
    "lydian ♯2",
    "super-Locrian double flat7"
  ],
  // https://www.jazzguitar.be/blog/melodic-minor-modes/
  melodicMinor: [
    "jazz minor",
    "dorian b2 (phrygian #6)",
    "lydian augmented",
    "lydian dominant (aka overtone scale)",
    "mixolydian b6",
    "aeolian b5",
    "super-locrian (aka altered)"
  ],
};

export const MODES_ALL : ([ Music.Mode, Music.BaseScale ])[] = (Object.keys(MODES) as Music.BaseScale[]).reduce(
  (acc: ([Music.Mode, Music.BaseScale])[], baseScale: Music.BaseScale) => acc.concat(MODES[baseScale].map(m => [ m, baseScale ])),
  []
);

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

export const BASE_SCALES : ([ Music.BaseScale, string ])[] = [
  [ "major", "Major" ],
  [ "harmonicMinor", "Harmonic minor" ],
  [ "melodicMinor", "Melodic minor" ],
];

export const semitoneDistanceMap : Music.SemitoneDistanceMap = {
  major:         [ 2, 2, 1, 2, 2, 2, 1 ],
  harmonicMinor: [ 2, 1, 2, 2, 1, 3, 1 ],
  melodicMinor:  [ 2, 1, 2, 2, 2, 2, 1 ],
}

export const modalNotes = (
  root: Music.NoteName,
  mode: Music.Mode,
  modes: ([ Music.Mode, Music.BaseScale ])[],
  indexedNotes: MusicData.IndexedNote[]
): MusicData.IndexedNote[] => {

  const baseScale : Music.BaseScale = modes.reduce((acc: Music.BaseScale, m, i) => {
    return m[0] === mode ? m[1] : acc;
  }, "major");
  console.log("baseScale", baseScale);
  const semitoneDistances = semitoneDistanceMap[baseScale];
  console.log("semitoneDistances", semitoneDistances);
  // start from the right indexedNotes index
  let startingIndex = 0;
  for (let i = 0; i < indexedNotes.length; i++) {
    startingIndex = i;
    const [ , noteName ] : MusicData.IndexedNote =  indexedNotes[i];
    if (noteName.indexOf(root) !== -1) {
      break;
    }
  }
  console.log("startingIndex", startingIndex);

  // so we start from the right distance element
  const modeIndex = MODES[baseScale].reduce((acc, m: Music.Mode, i) => {
    return m === mode ? i : acc;
  }, 0);
  let distanceIndex = modeIndex;
  const xs : MusicData.IndexedNote[] = [];
  for (let i = startingIndex; i < indexedNotes.length;) {
    const distance = semitoneDistances[distanceIndex];
    xs.push(indexedNotes[i]);
    i = i + distance;
    console.log("distanceIndex", distanceIndex, semitoneDistances.length);
    distanceIndex = (distanceIndex + 1) % semitoneDistances.length;
  }

  return xs;
}
