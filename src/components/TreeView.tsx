"use client";

import * as React from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InventoryItem } from "@/lib/inventory/types";

// Types for the tree structure
type TurbineNode = {
  id: string;
  name: string;
  components: ComponentNode[];
};

type ComponentNode = {
  id: string;
  name: string;
  pieces: PieceNode[];
};

type PieceNode = {
  id: string;
  item: InventoryItem;
};

interface TreeViewProps {
  items: InventoryItem[];
  onSelectPiece?: (item: InventoryItem) => void;
  onSelectComponent?: (componentName: string, pieces: InventoryItem[]) => void;
}

// Transform flat inventory data into hierarchical tree structure
function buildTreeData(items: InventoryItem[]): TurbineNode[] {
  // Group by component first, then by turbine (assuming all items are from same turbine for now)
  const componentMap = new Map<string, InventoryItem[]>();
  
  items.forEach(item => {
    const componentName = item.component;
    if (!componentMap.has(componentName)) {
      componentMap.set(componentName, []);
    }
    componentMap.get(componentName)!.push(item);
  });

  // Create component nodes
  const components: ComponentNode[] = Array.from(componentMap.entries()).map(([componentName, pieces]) => ({
    id: `component-${componentName}`,
    name: componentName,
    pieces: pieces.map(piece => ({
      id: `piece-${piece.sn}`,
      item: piece
    }))
  }));

  // For now, create a single turbine with all components
  // In a real app, you'd group by actual turbine IDs
  return [{
    id: "turbine-1",
    name: "Turbine 1",
    components
  }];
}

interface TreeNodeProps {
  node: TurbineNode | ComponentNode | PieceNode;
  level: number;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectPiece?: (item: InventoryItem) => void;
  onSelectComponent?: (componentName: string, pieces: InventoryItem[]) => void;
  expandedNodes: Set<string>;
  toggleNode: (nodeId: string) => void;
}

function TreeNode({ node, level, isExpanded, onToggle, onSelectPiece, onSelectComponent, expandedNodes, toggleNode }: TreeNodeProps) {
  const isTurbine = 'components' in node;
  const isComponent = 'pieces' in node && !isTurbine;
  const isPiece = 'item' in node;

  const handleClick = () => {
    if (isTurbine || isComponent) {
      onToggle();
    } else if (isPiece && onSelectPiece) {
      onSelectPiece(node.item);
    }
  };

  const handleComponentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isComponent && onSelectComponent) {
      const pieces = node.pieces.map(p => p.item);
      onSelectComponent(node.name, pieces);
    }
  };

  const hasChildren = (isTurbine && node.components.length > 0) || (isComponent && node.pieces.length > 0);

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors",
          "hover:bg-muted/50",
          level === 0 && "bg-muted/30 font-semibold",
          level === 1 && "bg-muted/20",
          level === 2 && "bg-background border border-border/50"
        )}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onClick={handleClick}
      >
        {hasChildren && (
          <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </div>
        )}
        
        {!hasChildren && <div className="w-4" />}

        <div className="flex-1 flex items-center justify-between">
          <span className="text-sm">
            {isTurbine && "🏭"}
            {isComponent && "⚙️"}
            {isPiece && "🔧"}
            {" "}
            {isTurbine && node.name}
            {isComponent && node.name}
            {isPiece && `${node.item.sn} (${node.item.pn})`}
          </span>

          {isComponent && (
            <button
              onClick={handleComponentClick}
              className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
            >
              View Details
            </button>
          )}

          {isPiece && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                node.item.status === "OK" && "bg-green-100 text-green-800",
                node.item.status === "Monitor" && "bg-yellow-100 text-yellow-800",
                node.item.status === "Replace Soon" && "bg-orange-100 text-orange-800",
                node.item.status === "Replace Now" && "bg-red-100 text-red-800",
                node.item.status === "Spare" && "bg-blue-100 text-blue-800",
                node.item.status === "Unknown" && "bg-gray-100 text-gray-800"
              )}>
                {node.item.status}
              </span>
              <span>{node.item.hours}h</span>
            </div>
          )}
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="ml-4">
          {isTurbine && node.components.map(component => (
            <TreeNode
              key={component.id}
              node={component}
              level={level + 1}
              isExpanded={expandedNodes.has(component.id)}
              onToggle={() => toggleNode(component.id)}
              onSelectPiece={onSelectPiece}
              onSelectComponent={onSelectComponent}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
            />
          ))}
          {isComponent && node.pieces.map(piece => (
            <TreeNode
              key={piece.id}
              node={piece}
              level={level + 1}
              isExpanded={false}
              onToggle={() => {}}
              onSelectPiece={onSelectPiece}
              onSelectComponent={onSelectComponent}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TreeView({ items, onSelectPiece, onSelectComponent }: TreeViewProps) {
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(new Set(['turbine-1']));
  
  const treeData = React.useMemo(() => buildTreeData(items), [items]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-2">
      {treeData.map(turbine => (
        <TreeNode
          key={turbine.id}
          node={turbine}
          level={0}
          isExpanded={expandedNodes.has(turbine.id)}
          onToggle={() => toggleNode(turbine.id)}
          onSelectPiece={onSelectPiece}
          onSelectComponent={onSelectComponent}
          expandedNodes={expandedNodes}
          toggleNode={toggleNode}
        />
      ))}
    </div>
  );
}
