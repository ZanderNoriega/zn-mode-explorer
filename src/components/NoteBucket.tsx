import React, { useContext, useCallback, useRef, useState } from "react";
import ProjectSettingsContext from "./ProjectSettingsContext";

const VERSION = "v0.2.0";

const NoteBucket = () => {
  const [ lastPlayed, setLastPlayed ] = useState<number>(-1);
  const projectSettings = useContext(ProjectSettingsContext);
  const noteBucket : MusicData.IdentifiedNote<string>[] = projectSettings!.noteBucket[1] || [];
  const hasNotes = noteBucket.length > 0;
  const noteBucketIndex = useRef(0);
  const onPlay = useCallback(() => {
    const noteBucket : MusicData.IdentifiedNote<string>[] = projectSettings!.noteBucket[1] || [];

    const iNote: MusicData.IdentifiedNote<string> = noteBucket[noteBucketIndex.current];

    const synth : Tone.BaseSynth | undefined = projectSettings!.synths["default"];
    synth!.triggerAttackRelease(iNote[1], "16n");
    setLastPlayed(noteBucketIndex.current);
    noteBucketIndex.current = (noteBucketIndex.current + 1) % noteBucket.length;

    const [ lastPlayed, noteBucketNotes ] = projectSettings!.noteBucket || [ null, [] ];
    const setNoteBucket = projectSettings!.setNoteBucket || (() => {});
    setNoteBucket([ iNote, noteBucketNotes ]);
  }, [ projectSettings ]);
  const onClear = useCallback(() => {
    const setNoteBucket = projectSettings!.setNoteBucket || (() => {});
    setNoteBucket([ null, [] ]);
    noteBucketIndex.current = 0;
  }, [ projectSettings ]);
  return (
    <>
      <h3>Note bucket ({VERSION})</h3>
      <div className="flex-centered flex-wrap margin-h-xs">
        { !hasNotes && <p>Add notes by touching a fret. <br/>Then you can play them here.</p> }
        { noteBucket.map(([noteID, note], i) => {
            const innerClass = lastPlayed === i ? "bold border border-radius" : "border-transparent";
            return (<div className={`flex-1 flex-centered`} key={`${noteID}${i}`}><span className={innerClass}>{ note } </span></div>);
          })
        }
      </div>
      { (noteBucket.length > 0) && (<div className="flex-centered">
          <button onClick={onPlay}  disabled={!hasNotes}>Play next note</button>
          <button onClick={onClear} disabled={!hasNotes}>Clear</button>
        </div>) 
      }
    </>
  );
}

export default NoteBucket;
