// https://tonejs.github.io/

declare namespace Tone {
  abstract class AudioNode<T> {
    toDestination: () => AudioNode<T>;
    connect: (x: AudioNode<T>) => AudioNode<T>
  }
  abstract class BaseSynth extends AudioNode<BaseSynth> {
    triggerAttackRelease: (note: string, duration: string) => ISynth;
  }

  class Synth extends BaseSynth { }
  class DuoSynth extends BaseSynth {
  }
  class Distortion extends AudioNode<Distortion> {
    constructor(amount: number) {}
  }
  class Filter {
  }
  class EQ3 {
  }
  class Sequence {
  }
}
