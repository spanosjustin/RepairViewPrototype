"use client";

import * as React from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InventoryItem } from "@/lib/inventory/types";
import { useStatusColors } from "@/hooks/useStatusColors";
import { getTone, getColorName, getBadgeClasses } from "@/lib/settings/colorMapper";

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
  // Group by turbine first, then by component
  const turbineMap = new Map<string, Map<string, InventoryItem[]>>();
  
  items.forEach(item => {
    const turbineName = item.turbine || "Unknown Turbine";
    const componentName = item.component;
    
    if (!turbineMap.has(turbineName)) {
      turbineMap.set(turbineName, new Map());
    }
    
    const componentMap = turbineMap.get(turbineName)!;
    if (!componentMap.has(componentName)) {
      componentMap.set(componentName, []);
    }
    
    componentMap.get(componentName)!.push(item);
  });

  // Create turbine nodes with their components
  const turbines: TurbineNode[] = Array.from(turbineMap.entries()).map(([turbineName, componentMap]) => {
    const components: ComponentNode[] = Array.from(componentMap.entries()).map(([componentName, pieces]) => ({
      id: `component-${turbineName}-${componentName}`,
      name: componentName,
      pieces: pieces.map(piece => ({
        id: `piece-${piece.sn}`,
        item: piece
      }))
    }));

    return {
      id: `turbine-${turbineName}`,
      name: turbineName,
      components
    };
  });

  return turbines;
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
  colorSettings?: any[];
}

function TreeNode({ node, level, isExpanded, onToggle, onSelectPiece, onSelectComponent, expandedNodes, toggleNode, colorSettings = [] }: TreeNodeProps) {
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
          {isPiece ? (
            <div className="flex items-start gap-2">
              <span className="text-sm pt-0.5">🔧</span>
              <div className="flex flex-col gap-0.5">
                <span className="text-sm block">{node.item.sn}</span>
                <span className="text-xs text-muted-foreground block">{node.item.pn}</span>
              </div>
            </div>
          ) : (
            <span className="text-sm">
              {isTurbine && "🏭"}
              {isComponent && "⚙️"}
              {" "}
              {isTurbine && node.name}
              {isComponent && node.name}
            </span>
          )}

          {isComponent && (
            <button
              onClick={handleComponentClick}
              className="text-xs px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
            >
              View Details
            </button>
          )}

          {isPiece && (() => {
            const statusTone = getTone(node.item.status || "", 'status', colorSettings);
            const statusColor = getColorName(node.item.status || "", 'status', colorSettings);
            return (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className={getBadgeClasses(statusTone, statusColor)}>
                  {node.item.status}
                </span>
                <span>{node.item.hours}h</span>
              </div>
            );
          })()}
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
              colorSettings={colorSettings}
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
              colorSettings={colorSettings}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TreeView({ items, onSelectPiece, onSelectComponent }: TreeViewProps) {
  const { data: colorSettings = [] } = useStatusColors();
  
  const treeData = React.useMemo(() => buildTreeData(items), [items]);
  
  // Initialize expanded nodes with all turbine IDs
  const [expandedNodes, setExpandedNodes] = React.useState<Set<string>>(() => {
    return new Set(treeData.map(turbine => turbine.id));
  });
  
  // Update expanded nodes when tree data changes
  React.useEffect(() => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      treeData.forEach(turbine => {
        if (!newSet.has(turbine.id)) {
          newSet.add(turbine.id);
        }
      });
      return newSet;
    });
  }, [treeData]);

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
          colorSettings={colorSettings}
        />
      ))}
    </div>
  );
}
