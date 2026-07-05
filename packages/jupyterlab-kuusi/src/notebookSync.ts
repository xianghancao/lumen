import type { IMarkdownCellModel } from "@jupyterlab/cells";
import type { INotebookModel } from "@jupyterlab/notebook";
import {
  computeNotebookReorderPlan,
  type NotebookCell,
  type OutlineNode,
} from "kuusi-kernel";

export const applyOutlineToNotebook = (
  model: INotebookModel,
  outline: OutlineNode,
  cells: NotebookCell[],
): void => {
  const plan = computeNotebookReorderPlan(outline, cells);
  const cellCount = model.cells.length;

  if (cellCount === 0) {
    return;
  }

  model.sharedModel.transact(() => {
    plan.sourceUpdates.forEach((source, originalIndex) => {
      const cell = model.cells.get(originalIndex);

      if (cell?.type === "markdown") {
        (cell as IMarkdownCellModel).sharedModel.setSource(source);
      }
    });

    const currentOrder = Array.from({ length: cellCount }, (_, index) => index);

    for (let targetIndex = 0; targetIndex < plan.order.length; targetIndex++) {
      const desiredOriginalIndex = plan.order[targetIndex]!;
      const fromIndex = currentOrder.indexOf(desiredOriginalIndex);

      if (fromIndex === targetIndex) {
        continue;
      }

      model.sharedModel.moveCell(fromIndex, targetIndex);
      currentOrder.splice(fromIndex, 1);
      currentOrder.splice(targetIndex, 0, desiredOriginalIndex);
    }
  });
};
