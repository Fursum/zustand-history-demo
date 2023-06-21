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
  isUndoable: (id: number) => boolean;
  isRedoable: (id: number) => boolean;
};

// make a history store
export const useHistoryStore = create<ActionHistoryStore>()(
  devtools((set, get) => ({
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
      const { actions, isUndoable } = get();
      if (!isUndoable(id)) return;

      let index = actions.length - 1;
      do {
        const currentAction = actions[index];
        currentAction.onUndo();
        currentAction.isUndoable = false;
        index--;
        await new Promise((resolve) => setTimeout(resolve, UNDO_REDO_DELAY));
      } while (index >= 0 && actions[index].id !== id);
    },
    // Redo from the first element that is continuously redoable until the same id is found
    redoHistory: async (id) => {
      const { actions, isRedoable } = get();
      if (!isRedoable(id)) return;

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
        await new Promise((resolve) => setTimeout(resolve, UNDO_REDO_DELAY));
      }
    },
    /** Check if from the last action to the target id is undoable */
    isUndoable: (id) => {
      const { actions } = get();
      for (let i = actions.length - 1; i >= 0; i--) {
        if (actions[i].id === id) return actions[i].isUndoable;
        if (!actions[i].isUndoable) return false;
      }
      return false; // If id does not exist
    },
    /** Check if every action from the target to the last action is redoable */
    isRedoable: (id) => {
      const { actions } = get();
      const index = actions.findIndex((action) => action.id === id);
      if (index === -1) return false;
      for (let i = index; i < actions.length; i++) {
        if (actions[i].isUndoable) return false;
      }
      return true;
    },
  }))
);
