import React, { useContext, useCallback, useRef, useState, useEffect, useMemo } from "react";
import ProjectSettingsContext from "./ProjectSettingsContext";
import * as MD from "../lib/music-data";

const VERSION = "v0.5.0";

type BucketMode = "play-note" | "replace-note" | "delete-note" | "select-note";

const NoteBucket = () => {
  const [ lastPlayed, setLastPlayed ] = useState<number>(-1);
  const [ loop, setLoop ] = useState(false);
  const [ noteDuration, setNoteDuration ] = useState(200);
  const [ bucketMode, setBucketMode ] = useState<BucketMode>("play-note");
  const [ selectedNotesMap, setSelectedNotesMap ] = useState<{[k: number]: number}>({});
  const projectSettings = useContext(ProjectSettingsContext);
  const noteBucket : Project.NoteBucket = useMemo(() => projectSettings!.noteBucket || [ null, [] ], [ projectSettings ]); 
  const noteBucketNotes : MusicData.IdentifiedNote<string>[] = useMemo(() => noteBucket[1], [ noteBucket ]);
  const hasNotes = noteBucketNotes.length > 0;
  const noteBucketIndex = useRef(0);
  const selectedNotesLength = Object.keys(selectedNotesMap).length;
  const selectedNotesEmpty = selectedNotesLength === 0;

  const playINote = useCallback((iNote: MusicData.IdentifiedNote<string>, clickedIndex: number): void => {
    const synth : Tone.BaseSynth | undefined = projectSettings!.audioEnvironment!.synths["default"];
    synth!.triggerAttackRelease(iNote[1], "16n");
    noteBucketIndex.current = clickedIndex;
    setLastPlayed(noteBucketIndex.current);

    const [ , noteBucketNotes ] = projectSettings!.noteBucket || [ null, [] ];
    const setNoteBucket = projectSettings!.setNoteBucket || (() => {});
    setNoteBucket([ iNote, noteBucketNotes ]);
  }, [ projectSettings ]);

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

  const onClickMode = useCallback((newMode: BucketMode) => () => {
    if (newMode === "delete-note") {
      setSelectedNotesMap({});
    }
    if (newMode !== "select-note") {
      setSelectedNotesMap({});
    }
    setBucketMode(newMode);
  }, [ setBucketMode ]);

  const onClickNote = useCallback((clickedINote: MusicData.IdentifiedNote<string>, clickedIndex: number) => (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (bucketMode === "delete-note") {
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
    } else if (bucketMode === "select-note") {
      if (selectedNotesMap[clickedIndex] === undefined) {
        setSelectedNotesMap(prev => ({ ...prev, [clickedIndex]: clickedIndex }));
      } else {
        setSelectedNotesMap(prev => {
          const newPrev = { ...prev };
          delete newPrev[clickedIndex];
          return newPrev;
        });
      }
    } else if (bucketMode === "play-note") {
      playINote(clickedINote, clickedIndex);
    }
  }, [ bucketMode, projectSettings, setSelectedNotesMap, selectedNotesMap, playINote ]);

  const onClickNoteContainer = () => {
    if (bucketMode === "select-note") {
      setSelectedNotesMap({});
    }
  };

  const onShiftBySemitones = useCallback((semitones: number) => () => {
    const transposedNoteBucketNotes : MusicData.IdentifiedNote<string>[] =
      noteBucketNotes.map((iNote, i) => {
        const isSelected : boolean = selectedNotesMap[i] === i;
        if (!selectedNotesEmpty && !isSelected) {
          return iNote;
        }
        const [ id, note ] = iNote;
        const [ strIndex, fret ] : number[] = id.split("-").map(s => parseInt(s, 10));
        const newFret : number = fret + semitones;
        const newFretIsWithinString : boolean = newFret >= 0 && newFret <= 24;

        if (newFretIsWithinString) {
          const targetNote : Music.Note = MD.findNextBySemitones(semitones, note, MD.indexedNotes);
          return [ `${strIndex}-${newFret}`, targetNote ]
        } else {
          return iNote;
        }
      });
    const setNoteBucket = projectSettings!.setNoteBucket || (() => {});
    setNoteBucket([ noteBucket[0], transposedNoteBucketNotes ]);
  }, [ projectSettings, noteBucketNotes, noteBucket, selectedNotesMap, selectedNotesEmpty ]);

  const onRepeat = useCallback(() => {
    const setNoteBucket = projectSettings!.setNoteBucket || (() => {});
    if (selectedNotesEmpty) {
      setNoteBucket([ noteBucket[0], noteBucketNotes.concat(noteBucketNotes) ]);
    } else {
      const selectedNoteBucketNotes = noteBucketNotes.filter((iNote, i) => selectedNotesMap[i] !== undefined);
      setNoteBucket([ noteBucket[0], noteBucketNotes.concat(selectedNoteBucketNotes) ]);
    }
  }, [ projectSettings, noteBucketNotes, noteBucket, selectedNotesMap, selectedNotesEmpty ]);


  return (
    <>
      <h3>Note bucket ({VERSION})</h3>
      { !hasNotes && <p className="centered-text">Add notes by touching a fret. <br/>Then you can play them here.</p> }
      { hasNotes &&
        <div className="flex-centered margin-v-xs spaced-children-h">
          <button
            onClick={onClickMode("play-note")}
            disabled={!hasNotes}
            className={`${bucketMode === "play-note" ? "border-xl" : "border-transparent-xl"}`}>
            { "Play" }
          </button>
          <button
            onClick={onClickMode("select-note")}
            disabled={!hasNotes}
            className={`${bucketMode === "select-note" ? "border-xl" : "border-transparent-xl"}`}>
            { "Select" }
          </button>
          <button
            onClick={onClickMode("delete-note")}
            disabled={!hasNotes}
            className={`${bucketMode === "delete-note" ? "border-xl" : "border-transparent-xl"}`}>
            { "Delete" }
          </button>
        </div>
      }
      <div className="flex-centered flex-wrap margin-v-xs monospaced" onClick={onClickNoteContainer}>
        { noteBucketNotes.map(([noteID, note], i) => {
            const isLastPlayed = lastPlayed === i;
            const borderClass = isLastPlayed ? "border-xl hl-text border-radius" : "border-radius border-transparent-xl border-on-hover";
            const modalNotes = projectSettings!.modalNotes || [];
            const isModalNote = modalNotes.map(mn => mn[1]).indexOf(note) !== -1;
            const modalClass = isModalNote ? "hl-bg" : "non-hl-bg";
            const boldClass = isLastPlayed ? "bold" : "";
            const isSelected : boolean = selectedNotesMap[i] === i;
            const selectedClass = isSelected ? `sel-bg absolute w-full h-full border-radius` : "";
            return (
              <div
                className={`fixed-width-3 t-85 flex-centered margin-xs ${modalClass} ${borderClass} ${boldClass} cursor-pointer relative`}
                key={`${noteID}${i}`}
                onClick={onClickNote([noteID, note], i)}>
                { isSelected && <span className={`${selectedClass}`}></span> }
                <span>{ note }</span>
              </div>
            );
          })
        }
      </div>
      { hasNotes && <div className="centered-text margin-v-xs">
          <div className="flex-centered margin-v-xs spaced-children-h">
            <small>
              { bucketMode === "play-note" ? <div>Click on a note to play it.</div> : null }
              { bucketMode === "select-note" ? <div>Click on a note to select it for transformation.</div> : null }
              { bucketMode === "delete-note" ? <div>Click on a note to delete it.</div> : null }
            </small>
          </div>
          <div className="flex-centered margin-v-xs spaced-children-h">
            <span>
              Transform
              {" "}
              <strong>
                { selectedNotesEmpty ? "all" : `${selectedNotesLength} selected` }
              </strong>
              {" "}
              note{`${selectedNotesLength > 1 || selectedNotesEmpty ? `s` : ""}`}
            </span>
            <button onClick={onShiftBySemitones(12)} disabled={!hasNotes}>Octave Up</button>
            <button onClick={onShiftBySemitones(1)} disabled={!hasNotes}>Semitone Up</button>
            <button onClick={onShiftBySemitones(-1)} disabled={!hasNotes}>Semitone Down</button>
            <button onClick={onShiftBySemitones(-12)} disabled={!hasNotes}>Octave Down</button>
            <button onClick={onRepeat} disabled={!hasNotes}>Repeat</button>
          </div>
        </div>
      }
      { hasNotes && (<div className="flex-centered spaced-children-h">
          <label htmlFor="noteDuration">Note duration (ms)</label>
          <input placeholder="Note duration (ms)" type="number" value={noteDuration} onChange={onChangeNoteDuration} />
          <input type="range" name="noteDuration" min="1" max="500" step="1" value={noteDuration} onChange={onChangeNoteDuration} />
          <button onClick={onPlayLoop}  disabled={!hasNotes}>{loop ? "stop loop" : "play loop"}</button>
          <button onClick={onPlay("prev")}  disabled={!hasNotes}>{"<"}</button>
          <button onClick={onPlay("next")}  disabled={!hasNotes}>{">"}</button>
          <button onClick={onClear} disabled={!hasNotes}>Clear</button>
        </div>) 
      }
    </>
  );
}

export default NoteBucket;
