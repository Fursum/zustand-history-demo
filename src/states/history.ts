import { create } from "zustand";
import { devtools } from "zustand/middleware";

// Added delay to show the order
const UNDO_REDO_DELAY = 250;

type ActionHistoryElement = {
  id: number;
  description: { title: string; content: string | string[] };
  onUndo: () => void;
  onRedo: () => void;
  isUndoable: boolean; // Also represents redoable
};

type ActionHistoryStore = {
  actions: ActionHistoryElement[];
  addAction: (action: Omit<ActionHistoryElement, "isUndoable" | "id">) => void;
  undoHistory: (id: number) => Promise<void>;
  redoHistory: (id: number) => Promise<void>;
  clearActions: () => void;
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
      const { actions } = get();
      let index = actions.length - 1;
      do {
        const currentAction = actions[index];
        if (currentAction.isUndoable) currentAction.onUndo();
        currentAction.isUndoable = false;
        index--;
        await new Promise((resolve) => setTimeout(resolve, UNDO_REDO_DELAY));
      } while (index >= 0 && actions[index].id !== id);
    },
    // Redo from the first element until the same id is found
    redoHistory: async (id) => {
      const { actions } = get();
      let index = 0;
      do {
        const currentAction = actions[index];
        if (currentAction.isUndoable) currentAction.onRedo();
        currentAction.isUndoable = true;
        index++;
        await new Promise((resolve) => setTimeout(resolve, UNDO_REDO_DELAY));
      } while (index < actions.length && actions[index].id !== id);
    },
  }))
);
