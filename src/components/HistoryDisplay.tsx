import { useMemo, useState } from "react";
import { ActionHistoryElement, useHistoryStore } from "@/states/history";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import styles from "./style.module.scss";

const HistoryDisplay = () => {
  const { actions, undoHistory, redoHistory, getRedoables, getUndoables } =
    useHistoryStore();

  const [selectedAction, setSelectedAction] =
    useState<ActionHistoryElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [listRef] = useAutoAnimate({ easing: "ease-out", duration: 200 });

  const undoQueue = useMemo(() => {
    if (!selectedAction) return [];
    return getUndoables(selectedAction.id);
  }, [isLoading, selectedAction, getUndoables]); // eslint-disable-line react-hooks/exhaustive-deps
  // isLoading is needed to update the queue

  const redoQueue = useMemo(() => {
    if (!selectedAction) return [];
    return getRedoables(selectedAction.id);
  }, [isLoading, selectedAction, getRedoables]); // eslint-disable-line react-hooks/exhaustive-deps
  // isLoading is needed to update the queue

  const isUndo = undoQueue.length > 0;
  const isRedo = redoQueue.length > 0;

  let actionQueue: ActionHistoryElement[] = [];
  if (undoQueue.length > 0) actionQueue = undoQueue;
  else actionQueue = redoQueue;

  const getHistoryElementClass = (action: ActionHistoryElement) => {
    let classNames = [];
    if (!action.isUndoable) classNames.push(styles.redoable);

    // queue
    if (actionQueue.find((e) => e.id === action.id))
      classNames.push(styles.inQueue);

    // target
    if (action.id === selectedAction?.id) {
      if (isUndo || isRedo) classNames.push(styles.target);
      else classNames.push(styles.invalid);
    }
    return classNames.join(" ");
  };

  const handleRedo = () => {
    setIsLoading(true);
    redoHistory(selectedAction!.id).then(() => setIsLoading(false));
  };

  const handleUndo = () => {
    setIsLoading(true);
    undoHistory(selectedAction!.id).then(() => setIsLoading(false));
  };

  return (
    <div className={styles.historyDisplay}>
      <h1>Action History</h1>
      <div className={styles.buttons}>
        <button
          className={styles.edit}
          disabled={!isUndo || isLoading}
          onClick={handleUndo}
        >
          Undo
        </button>
        <button
          className={styles.edit}
          disabled={!isRedo || isLoading}
          onClick={handleRedo}
        >
          Redo
        </button>
      </div>
      <ul ref={listRef}>
        {actions.map((action) => (
          <li key={action.id}>
            <button
              onClick={() => setSelectedAction(action)}
              className={getHistoryElementClass(action)}
            >
              <h2>{action.description.title}</h2>
              <div>
                {convertToArray(action.description.content).map(
                  (content, i) => (
                    <div key={`${action.id}-content-${i}`}>{content}</div>
                  )
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HistoryDisplay;

function convertToArray(obj: string | string[]) {
  if (Array.isArray(obj)) {
    return obj;
  } else {
    return [obj];
  }
}
