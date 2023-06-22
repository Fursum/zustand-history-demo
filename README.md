# History queue with zustand

### Expected behavior
- Undo queue starts from last action towards the target, skipping undone elements if there aren't any undoable elements between.
- Redo queue starts from the earliest redoable action towards the target. Target is invalid if there are new actions after it.

The goal is to have an easy and typesafe way to store and use actions.

## Folder structure
The main element is the `states/history.ts` file. You can check examples for:
- Adding actions - `components/TodoDisplay.tsx` -> `handleDelete` and `handleCheck`
- Undo and redo - `components/HistoryDisplay.tsx` -> `handleUndo` and `handleRedo`

![image](https://github.com/Fursum/zustand-history-demo/assets/16888264/ce2e6e4f-a13a-44d6-989a-823f54aaabae)
