
export const nextNoteNameDiatonic = (name: Music.NoteName): Music.NoteName => {
  switch (name) {
    case "C":
      return "D";
    case "D":
      return "E";
    case "E":
      return "F";
    case "F":
      return "G";
    case "G":
      return "A";
    case "A":
      return "B";
    case "B":
      return "C";
    default:
      return name;
  }
}

export const nextNoteNameChromaticSharps = (name: Music.NoteName): Music.NoteName => {
  switch (name) {
    case "C":
      return "C#";
    case "C#":
      return "D";
    case "D":
      return "D#";
    case "D#":
      return "E";
    case "E":
      return "F";
    case "F":
      return "F#";
    case "F#":
      return "G";
    case "G":
      return "G#";
    case "G#":
      return "A";
    case "A":
      return "A#";
    case "A#":
      return "B";
    case "B":
      return "C";
    default:
      return name;
  }
}

export const majorScaleDistances : Music.SemitoneDistance[] = [
  2, 2, 1, 2, 2, 2, 1
];

