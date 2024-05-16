import React, { useContext, useCallback, useRef, useState, useEffect, useMemo } from "react";
import ProjectSettingsContext from "./ProjectSettingsContext";

const VERSION = "v0.4.0";

type EditingState = "initial" | "replace-note" | "delete-note";

const NoteBucket = () => {
  const [ lastPlayed, setLastPlayed ] = useState<number>(-1);
  const [ loop, setLoop ] = useState(false);
  const [ noteDuration, setNoteDuration ] = useState(200);
  const [ editingState, setEditingState ] = useState<EditingState>("initial");
  const projectSettings = useContext(ProjectSettingsContext);
  const noteBucket : Project.NoteBucket = useMemo(() => projectSettings!.noteBucket || [ null, [] ], [ projectSettings ]); 
  const noteBucketNotes : MusicData.IdentifiedNote<string>[] = useMemo(() => noteBucket[1], [ noteBucket ]);
  const hasNotes = noteBucketNotes.length > 0;
  const noteBucketIndex = useRef(0);

  const onPlay = useCallback((dir : "prev" | "next") => () => {
    const noteBucket : MusicData.IdentifiedNote<string>[] = projectSettings!.noteBucket[1] || [];

    if (noteBucket.length === 0) {
      return;
    }

    const iNote: MusicData.IdentifiedNote<string> = noteBucket[noteBucketIndex.current];

    const synth : Tone.BaseSynth | undefined = projectSettings!.audioEnvironment!.synths["default"];
    synth!.triggerAttackRelease(iNote[1], "16n");
    setLastPlayed(noteBucketIndex.current);

    if (dir === "prev") {
      noteBucketIndex.current = (noteBucketIndex.current - 1) < 0 ? noteBucket.length - 1 : noteBucketIndex.current - 1;
    } else {
      noteBucketIndex.current = (noteBucketIndex.current + 1) % noteBucket.length;
    }

    const [ , noteBucketNotes ] = projectSettings!.noteBucket || [ null, [] ];
    const setNoteBucket = projectSettings!.setNoteBucket || (() => {});
    setNoteBucket([ iNote, noteBucketNotes ]);
  }, [ projectSettings ]);

  const onPlayLoop = useCallback(() => {
    setLoop(prev => !prev);
  }, [ ]);

  const onClear = useCallback(() => {
    const setNoteBucket = projectSettings!.setNoteBucket || (() => {});
    setNoteBucket([ null, [] ]);
    setLastPlayed(-1);
    noteBucketIndex.current = 0;
    setLoop(false);
  }, [ projectSettings ]);

  const onChangeNoteDuration = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNoteDuration(+e.target.value)
  }, [ ]);

  useEffect(() => {
    if (loop && noteBucketNotes.length > 0) {
      const intervalID = setInterval(() => {
        onPlay("next")();
      }, noteDuration);
      return () => {
        clearInterval(intervalID);
      }
    } else {
    }
  }, [ noteBucketNotes, loop, noteDuration, onPlay ]);

  const onDeleteMode = useCallback(() => {
    setEditingState(prev => prev !== "delete-note" ? "delete-note" : "initial");
  }, []);

  const onClickNote = useCallback((clickedINote: MusicData.IdentifiedNote<string>, clickedIndex: number) => () => {
    if (editingState === "delete-note") {
      const noteBucketNotes = projectSettings!.noteBucket![1] || [];
      if (noteBucketNotes.length - 1 === 0) {
        setLoop(false);
      }

      // noteBucketIndex.current is used by the loop playback logic.
      // reset it to 0 when deleting any note.
      // (loop playback logic should abort its operation when noteBucket is empty,
      // so treating noteBucketIndex.current = 0 as the reset value should be fine.)
      // TODO: maybe something fancier like making it the next or previous note,
      // but I don't wanna deal with bugs arising from that fanciness right now.
      // (empty array case, array out of bounds case, etc.)
      noteBucketIndex.current = 0;

      const setNoteBucket = projectSettings!.setNoteBucket || ((x: Project.NoteBucket) => {});

      setNoteBucket(([, xs]: Project.NoteBucket) => {
        return [ null, xs.filter((bucketNote, i) => i !== clickedIndex) ];
      });

    }
  }, [ editingState, projectSettings ]);

  return (
    <>
      <h3>Note bucket ({VERSION})</h3>
      { !hasNotes && <p className="centered-text">Add notes by touching a fret. <br/>Then you can play them here.</p> }
      <div className="flex-centered flex-wrap margin-v-xs monospaced">
        { noteBucketNotes.map(([noteID, note], i) => {
            const isLastPlayed = lastPlayed === i;
            const borderClass = isLastPlayed ? "border-xl hl-text border-radius" : "border-radius border-transparent-xl border-on-hover";
            const modalNotes = projectSettings!.modalNotes || [];
            const isModalNote = modalNotes.map(mn => mn[1]).indexOf(note) !== -1;
            const modalClass = isModalNote ? "hl-bg" : "non-hl-bg";
            const boldClass = isLastPlayed ? "bold" : "";
            return (<div className={`fixed-width-3 t-85 flex-centered margin-xs ${modalClass} ${borderClass} ${boldClass} cursor-pointer`} key={`${noteID}${i}`} onClick={onClickNote([noteID, note], i)}><span>{ note }</span></div>);
          })
        }
      </div>
      { hasNotes && <div className="centered-text margin-v-xs">
          { editingState === "initial" ? <div><strong>DEFAULT MODE:</strong> Click "loop" to play your notes.</div> : null }
          { editingState === "delete-note" ? <div><strong>DELETE MODE:</strong> Click on a note to delete it.</div> : null }
        </div>
      }
      { hasNotes && (<div className="flex-centered spaced-children-h">
          <label htmlFor="noteDuration">Note duration (ms)</label>
          <input placeholder="Note duration (ms)" type="number" value={noteDuration} onChange={onChangeNoteDuration} />
          <input type="range" name="noteDuration" min="1" max="500" step="1" value={noteDuration} onChange={onChangeNoteDuration} />
          <button onClick={onPlayLoop}  disabled={!hasNotes}>{loop ? "unloop" : "loop"}</button>
          <button onClick={onPlay("prev")}  disabled={!hasNotes}>{"<"}</button>
          <button onClick={onPlay("next")}  disabled={!hasNotes}>{">"}</button>
          <button onClick={onClear} disabled={!hasNotes}>Clear</button>
          <button onClick={onDeleteMode} disabled={!hasNotes}>{ editingState === "delete-note" ? "Exit delete mode" : "Enter delete mode" }</button>
        </div>) 
      }
    </>
  );
}

export default NoteBucket;
