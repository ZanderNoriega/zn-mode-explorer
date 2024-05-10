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
