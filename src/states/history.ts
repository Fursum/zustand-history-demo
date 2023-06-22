import { create } from "zustand";
import { devtools } from "zustand/middleware";

// Added delay to show the order
const UNDO_REDO_DELAY = 250;

export type ActionHistoryElement = {
  id: number;
  description: { title: string; content: string | string[] };
  onUndo: () => void;
  onRedo: () => void;
  isUndoable: boolean; // Also represents redoable
};

type ActionHistoryStore = {
  actions: ActionHistoryElement[];
  clearActions: () => void;
  addAction: (action: Omit<ActionHistoryElement, "isUndoable" | "id">) => void;
  undoHistory: (id: number) => Promise<void>;
  redoHistory: (id: number) => Promise<void>;
  getRedoables: (id: number) => ActionHistoryElement[];
  getUndoables: (id: number) => ActionHistoryElement[];
};

// make a history store
export const useHistoryStore = create<ActionHistoryStore>((set, get) => ({
  actions: [],
  clearActions: () => set({ actions: [] }),
  addAction: (action) =>
    set((state) => ({
      actions: [
        ...state.actions,
        { ...action, isUndoable: true, id: Date.now() },
      ],
    })),
  // Undo from the last element until the same id is found
  undoHistory: async (id) => {
    const { actions, getUndoables } = get();
    if (getUndoables(id).length === 0) return;

    let index = actions.length - 1;
    while (index >= 0) {
      const currentAction = actions[index];
      if (currentAction.isUndoable) currentAction.onUndo();
      currentAction.isUndoable = false;
      if (currentAction.id === id) break;
      index--;
      set({ actions }); // To update any action related components, not needed
      await new Promise((resolve) => setTimeout(resolve, UNDO_REDO_DELAY));
    }
  },
  // Redo from the first element that is continuously redoable until the same id is found
  redoHistory: async (id) => {
    const { actions, getRedoables } = get();
    if (getRedoables(id).length === 0) return;

    // Get previous redoables starting from the target id
    const redoables = [];
    let index = actions.findIndex((action) => action.id === id);
    if (index === -1) return;
    while (index >= 0 && !actions[index].isUndoable) {
      redoables.push(actions[index]);
      index--;
    }

    redoables.reverse();
    for (const redoable of redoables) {
      redoable.onRedo();
      redoable.isUndoable = true;
      set({ actions }); // To update any action related components, not needed
      await new Promise((resolve) => setTimeout(resolve, UNDO_REDO_DELAY));
    }
  },
  /** Get all redoable actions from the target id, in redo order */
  getRedoables: (id) => {
    const { actions } = get();
    const targetIdx = actions.findIndex((action) => action.id === id);
    if (targetIdx === -1 || actions[targetIdx].isUndoable) return [];

    // If there are any undoables after the target, return empty
    for (let i = targetIdx + 1; i < actions.length; i++)
      if (actions[i].isUndoable) return [];

    // Find the longest chain backwards for redo order
    const redoables = [];
    for (let i = targetIdx; i >= 0; i--) {
      if (!actions[i].isUndoable) redoables.push(actions[i]);
      else break;
    }
    return redoables.reverse();
  },
  /** Get all undoable actions from the target id, in undo order */
  getUndoables: (id) => {
    const { actions } = get();
    const targetIdx = actions.findIndex((action) => action.id === id);
    if (targetIdx === -1 || !actions[targetIdx].isUndoable) return [];

    // Find the latest undoable action from the last action
    let lastUndoableIndex = actions.length - 1;
    while (
      lastUndoableIndex >= 0 &&
      !actions[lastUndoableIndex].isUndoable &&
      lastUndoableIndex > targetIdx
    )
      lastUndoableIndex--;

    // Check if there are any redoables between the target and the latest undoable
    for (let i = targetIdx + 1; i <= lastUndoableIndex; i++)
      if (!actions[i].isUndoable) return [];

    // Get all undoables from the latest undoable action to the target
    const undoables = [];
    for (let i = lastUndoableIndex; i >= 0 && i >= targetIdx; i--) {
      if (actions[i].isUndoable) undoables.push(actions[i]);
    }
    return undoables.reverse();
  },
}));
