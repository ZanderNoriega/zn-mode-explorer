import React, { useCallback, useContext, useMemo, useState, memo } from "react";
import ProjectSettingsContext from "./ProjectSettingsContext";
import ConfigurableRangeInput from "./ConfigurableRangeInput";

const VERSION = "v0.1.0";

type EffectToggles = { FeedbackDelay: boolean, Distortion: boolean };

const SynthSettings = memo(() => {
  const projectSettings = useContext(ProjectSettingsContext);
  const audioEnvironment : Audio.Environment = useMemo(
    () => projectSettings!.audioEnvironment || { synths: {}, effects: {}, setEnvelope: () => {} },
    [ projectSettings ]
  );

  const attack = audioEnvironment.synths.default.envelope.attack * 1000;
  const decay = audioEnvironment.synths.default.envelope.decay * 1000;
  const sustain = audioEnvironment.synths.default.envelope.sustain * 1000;
  const release = audioEnvironment.synths.default.envelope.release * 1000;

  const distortion = audioEnvironment.effects.default[0].distortion;

  const delayTime : number = audioEnvironment.effects.default[1].delayTime.value * 1000;
  const feedback : number = audioEnvironment.effects.default[1].feedback.value * 100;

  const onChangeAttack = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newAttack : number = +e.target.value / 1000;
    audioEnvironment.synths.default.envelope.attack = newAttack;
  }, [ audioEnvironment ]);

  const onChangeDecay = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newDecay : number = +e.target.value / 1000;
    audioEnvironment.synths.default.envelope.decay = newDecay;
  }, [ audioEnvironment ]);

  const onChangeSustain = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSustain : number = +e.target.value / 1000;
    audioEnvironment.synths.default.envelope.sustain = newSustain;
  }, [ audioEnvironment ]);

  const onChangeRelease = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newRelease : number = +e.target.value / 1000;
    audioEnvironment.synths.default.envelope.release = newRelease;
  }, [ audioEnvironment ]);

  const onChangeDistortion = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDistortion : number = +e.target.value;
    audioEnvironment.effects.default[0].distortion = newDistortion;
  };

  const onChangeDelayTime = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue : number = +e.target.value / 1000;
    audioEnvironment.effects.default[1].delayTime.value = newValue;
  }, [ audioEnvironment ]);

  const onChangeDelayFeedback = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue : number = +e.target.value / 100;
    audioEnvironment.effects.default[1].feedback.value = newValue;
  }, [ audioEnvironment ]);

  const [ effectToggles, setEffectToggles ] = useState<EffectToggles>({ FeedbackDelay: false, Distortion: true });
  const onToggleEffect = (effectName: keyof EffectToggles) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked : boolean = e.target.checked;
    console.log("onToggleEffect", effectName, checked);
    if (checked && !effectToggles[effectName]) {
      audioEnvironment.effects.default.forEach((x: Tone.AudioNode<any>) => {
        if (x.name === effectName) {
          x.toDestination();
        }
      });
    } else if (!checked && effectToggles[effectName]) {
      audioEnvironment.effects.default.forEach((x: Tone.AudioNode<any>) => {
        if (x.name === effectName) {
          x.disconnect();
        }
      });
    }
    setEffectToggles((prev: EffectToggles) => ({ ...prev, [effectName]: !prev[effectName] }));
  };

  return (
    <>
      <h3>Synth Settings ({VERSION})</h3>
      <ConfigurableRangeInput label="Attack (ms)" defaultValue={attack} defaultMax={1000} onChange={onChangeAttack}/>
      <ConfigurableRangeInput label="Decay (ms)" defaultValue={decay} defaultMax={1000} onChange={onChangeDecay}/>
      <ConfigurableRangeInput label="Sustain (ms)" defaultValue={sustain} defaultMax={1000} onChange={onChangeSustain}/>
      <ConfigurableRangeInput label="Release (ms)" defaultValue={release} defaultMax={1000} onChange={onChangeRelease}/>
      <ConfigurableRangeInput label="Distortion (amount)" defaultValue={distortion} defaultMax={1} onChange={onChangeDistortion} min="0.001" step="0.001"/>
      <div>Delay <input type="checkbox" checked={effectToggles.FeedbackDelay} onChange={onToggleEffect("FeedbackDelay")} /> </div>
      <ConfigurableRangeInput label="Delay time (ms)" defaultValue={delayTime} defaultMax={1000} onChange={onChangeDelayTime} min="0" step="0.001"/>
      <ConfigurableRangeInput label="Delay feedback (%)" defaultValue={feedback} defaultMax={100} onChange={onChangeDelayFeedback} min="0" step="0.1"/>
    </>
  );
});

export default SynthSettings;
