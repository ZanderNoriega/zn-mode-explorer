// https://tonejs.github.io/

declare namespace Tone {
  abstract class BaseSynth {
    triggerAttackRelease: (note: string, duration: string) => ISynth;
    toDestination: () => ISynth;
  }

  class Synth extends BaseSynth { }
  class DuoSynth extends BaseSynth {
  }
  class Distortion {
  }
  class Filter {
  }
  class EQ3 {
  }
  class Sequence {
  }
}
