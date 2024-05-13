import React, { useContext, useCallback, useRef, useState } from "react";
import ProjectSettingsContext from "./ProjectSettingsContext";

const NoteBucket = () => {
  const [ lastPlayed, setLastPlayed ] = useState<number>(-1);
  const projectSettings = useContext(ProjectSettingsContext);
  const noteBucket : MusicData.IdentifiedNote<string>[] = projectSettings!.noteBucket || [];
  const hasNotes = noteBucket.length > 0;
  const noteBucketIndex = useRef(0);
  const onPlay = useCallback(() => {
    const noteBucket : MusicData.IdentifiedNote<string>[] = projectSettings!.noteBucket || [];

    const iNote: MusicData.IdentifiedNote<string> = noteBucket[noteBucketIndex.current];

    const synth : Tone.BaseSynth | undefined = projectSettings!.synths["default"];
    synth!.triggerAttackRelease(iNote[1], "16n");
    setLastPlayed(noteBucketIndex.current);

    noteBucketIndex.current = (noteBucketIndex.current + 1) % noteBucket.length;
  }, [ projectSettings ]);
  const onClear = useCallback(() => {
    const setNoteBucket = projectSettings!.setNoteBucket || (() => {});
    setNoteBucket([]);
  }, [ projectSettings ]);
  return (
    <>
      <h2>Note bucket</h2>
      <div className="flex-centered">
        { !hasNotes && <p>Add notes by touching a fret. Then you can play them here.</p> }
        { noteBucket.map(([noteID, note], i) => {
            const innerClass = lastPlayed === i ? "bold border border-radius" : "border-transparent";
            return (<div className={`flex-1 flex-centered`} key={noteID}><span className={innerClass}>{ note } </span></div>);
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
