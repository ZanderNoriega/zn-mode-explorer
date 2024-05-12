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
    "locrian" |

    "aeolian #7" |
    "locrian ♮6" |
    "augmented major" |
    "dorian #11" |
    "phrygian dominant" |
    "lydian ♯2" |
    "super-Locrian double flat7" |

    "jazz minor" |
    "dorian b2 (phrygian #6)" |
    "lydian augmented" |
    "lydian dominant (aka overtone scale)" |
    "mixolydian b6" |
    "aeolian b5" |
    "super-locrian (aka altered)";

  type SemitoneDistance = number;
  type SemitoneDistanceMap = {
    major: SemitoneDistance[],
    harmonicMinor: SemitoneDistance[],
    melodicMinor: SemitoneDistance[],
  };
  type BaseScale = keyof SemitoneDistanceMap;
  type ModesMap = { 
    major: Mode[],
    harmonicMinor: Mode[],
    melodicMinor: Mode[],
  };

}

namespace MusicData {
  type IndexedNote = [ number, Music.Note ]
}

namespace Instrument {
  type Tuning = Music.Note[];
  type Fret = number;
}

namespace Audio {
  type SynthMap = { [k: string]: BaseSynth };
}

namespace Project {
  type Settings = { 
    root: Music.NoteName,
    mode: Music.Mode,
    indexedNotes: MusicData.IndexedNote[],
    modalNotes: MusicData.IndexedNote[],
    showOctaves: boolean,
    whiteKeysOnly: boolean,
    modalNotesOnly: boolean,
    synths: Audio.SynthMap,
  };
}
