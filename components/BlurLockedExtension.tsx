import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

type Options = {
  blurClassName?: string;
  blurMarkers?: boolean;
};

export const BlurLockedExtension = Extension.create<Options>({
  name: "blurLocked",

  addOptions() {
    return {
      blurClassName: "blur",
      blurMarkers: true,
    };
  },

  addProseMirrorPlugins() {
    const key = new PluginKey("blurLocked");
    const blurClass = this.options.blurClassName!;
    const blurMarkers = this.options.blurMarkers!;

    function computeDecorations(doc: any): DecorationSet {
      const LOCK = "@lock";
      const UNLOCK = "@unlock";
      const decos: Decoration[] = [];

      // 1) Gather all text segments with absolute positions
      type Segment = { text: string; from: number; to: number };
      const segments: Segment[] = [];
      doc.descendants((node: any, pos: number) => {
        if (node.isText && node.text && node.text.length > 0) {
          segments.push({
            text: node.text as string,
            from: pos,
            to: pos + node.text.length,
          });
        }
        return true;
      });

      // 2) Find locked intervals [start, end)
      type Interval = {
        start: number;
        end: number;
        lockMarker?: [number, number];
        unlockMarker?: [number, number];
      };
      const intervals: Interval[] = [];
      let inLocked = false;
      let pendingStart: number | null = null;
      let pendingLockMarker: [number, number] | undefined;

      for (const seg of segments) {
        let idx = 0;
        while (idx < seg.text.length) {
          if (!inLocked) {
            const li = seg.text.indexOf(LOCK, idx);
            if (li === -1) break;

            const lockAbsStart = seg.from + li;
            const lockAbsEnd = lockAbsStart + LOCK.length;
            if (blurMarkers) {
              decos.push(
                Decoration.inline(lockAbsStart, lockAbsEnd, {
                  class: blurClass,
                })
              );
            }

            inLocked = true;
            pendingStart = lockAbsEnd;
            pendingLockMarker = [lockAbsStart, lockAbsEnd];
            idx = li + LOCK.length;

            const uiSame = seg.text.indexOf(UNLOCK, idx);
            if (uiSame !== -1) {
              const unlockAbsStart = seg.from + uiSame;
              const unlockAbsEnd = unlockAbsStart + UNLOCK.length;

              // Record interval
              intervals.push({
                start: pendingStart!,
                end: unlockAbsStart,
                lockMarker: pendingLockMarker,
                unlockMarker: [unlockAbsStart, unlockAbsEnd],
              });

              if (blurMarkers) {
                decos.push(
                  Decoration.inline(unlockAbsStart, unlockAbsEnd, {
                    class: blurClass,
                  })
                );
              }

              inLocked = false;
              pendingStart = null;
              pendingLockMarker = undefined;
              idx = uiSame + UNLOCK.length;
            } else {
              // No unlock in this segment; keep scanning next segments
              idx = seg.text.length;
            }
          } else {
            const ui = seg.text.indexOf(UNLOCK, idx);
            if (ui === -1) {
              // Still locked with no unlock here; continue to next segment
              idx = seg.text.length;
            } else {
              const unlockAbsStart = seg.from + ui;
              const unlockAbsEnd = unlockAbsStart + UNLOCK.length;

              intervals.push({
                start: pendingStart!,
                end: unlockAbsStart,
                lockMarker: pendingLockMarker,
                unlockMarker: [unlockAbsStart, unlockAbsEnd],
              });

              if (blurMarkers) {
                decos.push(
                  Decoration.inline(unlockAbsStart, unlockAbsEnd, {
                    class: blurClass,
                  })
                );
              }

              inLocked = false;
              pendingStart = null;
              pendingLockMarker = undefined;
              idx = ui + UNLOCK.length;
            }
          }
        }
      }

      // If doc ended while locked, blur until the end of the doc
      if (inLocked && pendingStart !== null) {
        intervals.push({
          start: pendingStart,
          end: doc.content.size, // doc end position
          lockMarker: pendingLockMarker,
        });
      }

      // 3) For each interval, apply node decorations to fully covered nodes,
      //    and inline decorations to partial overlaps at boundaries.
      for (const interval of intervals) {
        const { start, end } = interval;

        doc.descendants((node: any, pos: number) => {
          const nodeFrom = pos;
          const nodeTo = pos + node.nodeSize;

          // Skip document root
          if (node === doc) return true;

          // Fully covered node → node decoration
          if (nodeFrom >= start && nodeTo <= end) {
            decos.push(Decoration.node(nodeFrom, nodeTo, { class: blurClass }));
            // No need to descend further inside this node
            return false;
          }

          // Partial overlap → inline decoration for the overlapping slice
          const overlapStart = Math.max(start, nodeFrom);
          const overlapEnd = Math.min(end, nodeTo);
          if (overlapEnd > overlapStart) {
            // Use inline decoration for the overlapping range
            decos.push(
              Decoration.inline(overlapStart, overlapEnd, { class: blurClass })
            );
            // Continue traversal to catch deeper full nodes inside the overlap
            return true;
          }

          // No overlap
          return true;
        });
      }

      return DecorationSet.create(doc, decos);
    }

    return [
      new Plugin({
        key,
        state: {
          init: (_, { doc }) => computeDecorations(doc),
          apply: (tr, old) =>
            tr.docChanged ? computeDecorations(tr.doc) : old,
        },
        props: {
          decorations(state) {
            return key.getState(state);
          },
        },
      }),
    ];
  },
});
