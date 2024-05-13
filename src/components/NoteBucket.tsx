import React, { useContext, useCallback, useRef, useState } from "react";
import ProjectSettingsContext from "./ProjectSettingsContext";

const VERSION = "v0.2.0";

const NoteBucket = () => {
  const [ lastPlayed, setLastPlayed ] = useState<number>(-1);
  const projectSettings = useContext(ProjectSettingsContext);
  const noteBucket : MusicData.IdentifiedNote<string>[] = projectSettings!.noteBucket[1] || [];
  const hasNotes = noteBucket.length > 0;
  const noteBucketIndex = useRef(0);
  const onPlay = useCallback((dir : "prev" | "next") => () => {
    const noteBucket : MusicData.IdentifiedNote<string>[] = projectSettings!.noteBucket[1] || [];

    const iNote: MusicData.IdentifiedNote<string> = noteBucket[noteBucketIndex.current];

    const synth : Tone.BaseSynth | undefined = projectSettings!.synths["default"];
    synth!.triggerAttackRelease(iNote[1], "16n");
    setLastPlayed(noteBucketIndex.current);

    if (dir === "prev") {
      noteBucketIndex.current = (noteBucketIndex.current - 1) < 0 ? noteBucket.length - 1 : noteBucketIndex.current - 1;
    } else {
      noteBucketIndex.current = (noteBucketIndex.current + 1) % noteBucket.length;
    }

    const [ lastPlayed, noteBucketNotes ] = projectSettings!.noteBucket || [ null, [] ];
    const setNoteBucket = projectSettings!.setNoteBucket || (() => {});
    setNoteBucket([ iNote, noteBucketNotes ]);
  }, [ projectSettings ]);
  const onClear = useCallback(() => {
    const setNoteBucket = projectSettings!.setNoteBucket || (() => {});
    setNoteBucket([ null, [] ]);
    setLastPlayed(-1);
    noteBucketIndex.current = 0;
  }, [ projectSettings ]);
  return (
    <>
      <h3>Note bucket ({VERSION})</h3>
      <div className="flex-centered flex-wrap margin-h-xs monospaced">
        { !hasNotes && <p>Add notes by touching a fret. <br/>Then you can play them here.</p> }
        { noteBucket.map(([noteID, note], i) => {
            const isLastPlayed = lastPlayed === i;
            const borderClass = isLastPlayed ? "border-xl hl-text border-radius" : "border-radius border-transparent-xl";
            const modalNotes = projectSettings!.modalNotes || [];
            const isModalNote = modalNotes.map(mn => mn[1]).indexOf(note) !== -1;
            const modalClass = isModalNote ? "hl-bg" : "non-hl-bg";
            const boldClass = isLastPlayed ? "bold" : "";
            return (<div className={`fixed-width-3 t-85 flex-centered margin-xs ${modalClass} ${borderClass} ${boldClass}`} key={`${noteID}${i}`}><span>{ note }</span></div>);
          })
        }
      </div>
      { (noteBucket.length > 0) && (<div className="flex-centered spaced-children-h">
          <button onClick={onPlay("prev")}  disabled={!hasNotes}>{"<"}</button>
          <button onClick={onPlay("next")}  disabled={!hasNotes}>{">"}</button>
          <button onClick={onClear} disabled={!hasNotes}>Clear</button>
        </div>) 
      }
    </>
  );
}

export default NoteBucket;
