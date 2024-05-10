namespace Music {
  type NoteLetter = "C" | "D" | "E" | "F" | "G" | "A" | "B";
  type NoteOctave = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
  type NoteAccidental = "#" | "b" | "";
  type NoteName = `${Music.NoteLetter}${Music.NoteAccidental}`;
  type MIDIIndex = number;
  type Note = `${NoteName}${NoteOctave}`;
  type Mode = 
    "ionian" |
    "dorian" |
    "phrygian" |
    "lydian" |
    "mixolydian" |
    "aeolian" |
    "locrian";
  type SemitoneDistance = number;
}

namespace MusicData {
  type IndexedNote = [ number, Music.Note ]
}

namespace Instrument {
  type Tuning = Music.Note[];
  type Fret = number;
}
