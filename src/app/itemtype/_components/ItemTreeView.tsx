'use client';
import { Dialog, DialogPanel } from '@headlessui/react';
import { useState } from 'react';
import { Background, Controls, Edge, Handle, Node, Position, ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

function CustomNode({ data }: { data: { label: string; color: string }; type: any }) {
  return (
    <div className={`px-3 py-1 shadow-md rounded-md border-2 border-black/10 bg-${data.color}-300`}>
      <div className={`flex text-black`}>{data.label}</div>

      <Handle type="target" position={Position.Top} className="w-10 !bg-black/50" />
      <Handle type="source" position={Position.Bottom} className="w-10 !bg-black/50" />
    </div>
  );
}

type Item = { id: string; name: string; ItemChild: { itemTypeId: string; id: string }[] };
export function ItemTreeView({ itemTypes, builtItem }: { builtItem: Item; itemTypes: Item[] }) {
  let [isOpen, setIsOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const tailwindColors = [
    'red',
    'orange',
    'amber',
    'yellow',
    'lime',
    'green',
    'emerald',
    'teal',
    'cyan',
    'sky',
    'blue',
    'indigo',
    'violet',
    'purple',
    'fuchsia',
    'pink',
    'rose',
    'slate',
    'gray',
    'zinc',
    'neutral',
    'stone'
  ];

  const createFlowData = (
    tree: Item,
    position = { x: 0, y: 0 },
    depth = 0,
    nodes: Node[] = [],
    edges: Edge[] = [],
    parentIndex: number = 0
  ) => {
    if (!nodes.some((n) => n.id === tree.id)) {
      const nodeWidth = depth === 1 ? 50 : 100;
      nodes.push({
        id: tree.id,
        data: {
          label: tree.name,
          color: depth === 0 ? 'white' : tailwindColors[parentIndex % tailwindColors.length]
        },
        position: { x: position.x + depth * nodeWidth, y: position.y + nodes.length * 60 },
        type: 'custom'
      });
    }

    if (tree.ItemChild && tree.ItemChild.length > 0) {
      tree.ItemChild.forEach((child, index) => {
        if (!selectedNode || selectedNode === child.itemTypeId || selectedNode === tree.id) {
          edges.push({
            id: `e${tree.id}-${child.id}`,
            source: tree.id,
            target: child.itemTypeId
          });
        }

        createFlowData(
          itemTypes.find((it) => it.id === child.itemTypeId)!,
          position,
          depth + 1,
          nodes,
          edges,
          depth === 0 ? index : parentIndex
        );
      });
    }

    return { nodes, edges };
  };

  const { nodes, edges } = createFlowData(builtItem);

  return (
    <div className={'flex gap-2'}>
      <button
        className={
          'flex gap-2 justify-center w-full p-1 rounded-md font-bold bg-blue-200 hover:bg-blue-300'
        }
        onClick={() => setIsOpen(true)}>
        Open tree view
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 flex items-center justify-center p-4 w-screen">
          <DialogPanel className="max-w-screen-2xl space-y-4 border bg-white p-12 h-full w-full">
            <div className="flex gap-2 mt-2 h-full w-full">
              <ReactFlow
                nodeTypes={{ custom: CustomNode }}
                onNodeClick={(_, node) =>
                  setSelectedNode((id) => (id === node.id ? null : node.id))
                }
                nodes={nodes}
                edges={edges}
                fitView>
                <Controls />
                <Background />
              </ReactFlow>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
