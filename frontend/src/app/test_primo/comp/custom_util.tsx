import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@mui/material";
import CustomFormDialog from "./custom_form_dialog";

type ElementNode = {
  path: string;
  index: number;
  type: string;
  key?: React.Key | null;
  id?: string | number | null;
  text?: string | null;
  props?: Record<string, any>;
  children: ElementNode[];
  metadata?: {
    visible?: boolean;
    editable?: boolean;
    order?: number;
    originalIndex?: number;
  };
};

function extractText(children: React.ReactNode): string | null {
  if (children == null) return null;
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) {
    return children.map(extractText).filter(Boolean).join(" ");
  }
  if (React.isValidElement(children)) {
    return extractText(children.props.children);
  }
  return null;
}

function safePropValue(value: any, visited = new WeakSet(), depth = 0): any {
  if (depth > 3 || value == null) return undefined;

  const type = typeof value;
  if (type === "string" || type === "number" || type === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    const result = value
      .map((v) => safePropValue(v, visited, depth + 1))
      .filter((v) => v !== undefined);
    return result.length > 0 ? result : undefined;
  }

  if (type === "function" || React.isValidElement(value)) {
    return undefined;
  }

  if (type === "object" && !visited.has(value)) {
    visited.add(value);
    const result: Record<string, any> = {};

    Object.entries(value).forEach(([key, val]) => {
      if (key !== "children") {
        const safe = safePropValue(val, visited, depth + 1);
        if (safe !== undefined) result[key] = safe;
      }
    });

    return Object.keys(result).length > 0 ? result : undefined;
  }

  return undefined;
}

function buildNode(
  child: React.ReactNode,
  index: number,
  parentPath: string
): ElementNode {
  const path = parentPath ? `${parentPath}.${index}` : `${index}`;

  if (React.isValidElement(child)) {
    const element = child as React.ReactElement;
    const typeName =
      typeof element.type === "string"
        ? element.type
        : (element.type as any)?.displayName ||
          (element.type as any)?.name ||
          "Component";

    const text = extractText(element.props?.children);
    const props = safePropValue(element.props || {});

    const childrenNodes: ElementNode[] = [];
    React.Children.forEach(element.props?.children, (c, idx) => {
      if (c != null) {
        childrenNodes.push(buildNode(c, idx, path));
      }
    });

    return {
      path,
      index,
      type: typeName,
      key: element.key,
      id: element.props?.id,
      text,
      props,
      children: childrenNodes,
      metadata: {
        visible: true,
        editable: true,
        order: index,
        originalIndex: index,
      },
    };
  }

  return {
    path,
    index,
    type:
      child == null
        ? "null"
        : typeof child === "boolean"
        ? "boolean"
        : "text",
    key: null,
    id: null,
    text:
      typeof child === "string" || typeof child === "number"
        ? String(child)
        : null,
    props: {},
    children: [],
    metadata: {
      visible: true,
      editable: false,
      order: index,
      originalIndex: index,
    },
  };
}

export function ParentComponent({
  children,
  onMap,
}: {
  children?: React.ReactNode;
  onMap?: (tree: ElementNode[]) => void;
}) {
  const tree = useMemo(() => {
    if (!children) return [];

    const childrenArray = React.Children.toArray(children);
    return childrenArray.map((child, index) => buildNode(child, index, ""));
  }, [children]);

  const [mappedTree, setMappedTree] = useState<ElementNode[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  console.log('----------------Mapped Tree:', mappedTree);
  console.log('----------------Original Tree:', tree);
  
  useEffect(() => {
    // Inizializza mappedTree solo se non è già stato inizializzato
    // o se il tree è completamente cambiato (diverso numero di elementi)
    if (!isInitialized || tree.length !== mappedTree.length) {
      setMappedTree(tree);
      setIsInitialized(true);
      onMap?.(tree);
    }
  }, [tree, onMap, isInitialized, mappedTree.length]);

  const modifiedChildren = useMemo(() => {
    if (!children || mappedTree.length === 0) return null;

    const childrenArray = React.Children.toArray(children);
    const sortedTree = [...mappedTree].sort((a, b) =>
      (a.metadata?.order || 0) - (b.metadata?.order || 0)
    );

    return sortedTree
      .filter((node) => node.metadata?.visible !== false)
      .map((node, newIndex) => {
        const originalIndex = node.metadata?.originalIndex ?? node.index;
        const originalChild = childrenArray[originalIndex];

        if (React.isValidElement(originalChild)) {
          const newProps: any = {
            key: `mapped-${newIndex}`,
            className: `${originalChild.props?.className || ""} mapped-child`.trim(),
          };

          if (node.metadata?.visible === false) {
            newProps.style = {
              ...originalChild.props?.style,
              display: "none",
            };
          }

          if (node.metadata?.editable === false) {
            newProps.readOnly = true;
            newProps.disabled = true;
          }

          return React.cloneElement(originalChild, newProps);
        }
        return originalChild;
      });
  }, [children, mappedTree]);

  const renderNode = (node: ElementNode): React.ReactNode => (
    <li key={node.path} style={{ marginBottom: 6 }}>
      <div style={{ fontWeight: 700, fontSize: 13 }}>
        {node.type}{" "}
        <span style={{ color: "#666", fontWeight: 400 }}>({node.path})</span>
        {/* Mostra se il nodo è stato modificato */}
        {node.metadata?.visible !== true && (
          <span style={{ color: "red", fontSize: 10 }}> [NASCOSTO]</span>
        )}
        {node.metadata?.editable === false && (
          <span style={{ color: "orange", fontSize: 10 }}> [READONLY]</span>
        )}
      </div>
      <div style={{ fontSize: 12, color: "#333" }}>
        {node.id && <div>id: {node.id}</div>}
        {node.key && <div>key: {String(node.key)}</div>}
        {node.text && <div>text: {node.text}</div>}
        {node.metadata && (
          <div style={{ color: "#0066cc" }}>
            order: {node.metadata.order}, 
            visible: {String(node.metadata.visible)}, 
            editable: {String(node.metadata.editable)}
          </div>
        )}
        {node.props && Object.keys(node.props).length > 0 && (
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontSize: 11 }}>
            {JSON.stringify(node.props, null, 2)}
          </pre>
        )}
      </div>
      {node.children.length > 0 && (
        <ul style={{ paddingLeft: 12 }}>
          {node.children.map((child) => renderNode(child))}
        </ul>
      )}
    </li>
  );

  const handleReset = () => {
    setMappedTree([...tree]); // Crea una copia del tree originale
    setIsInitialized(true);
  };

  const handleForceRefresh = () => {
    setIsInitialized(false); // Forza il refresh dal tree originale
  };

  return (
    <div style={{ display: "flex", gap: 20 }}>
      <div style={{ flex: 1 }}>
        {modifiedChildren || (
          <div style={{ padding: 20, textAlign: "center", color: "#666" }}>
            Nessun contenuto da visualizzare
          </div>
        )}
      </div>

      <aside
        style={{
          width: 420,
          borderLeft: "1px solid rgba(0,0,0,0.08)",
          paddingLeft: 12,
          maxHeight: "80vh",
          overflow: "auto",
        }}
        aria-label="mapped-dom-tree"
      >
        <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setDialogOpen(true)}
            disabled={mappedTree.length === 0}
          >
            Configura
          </Button>
          <Button
            variant="text"
            size="small"
            onClick={handleReset}
            disabled={tree.length === 0}
          >
            Reset
          </Button>
          <Button
            variant="text"
            size="small"
            onClick={handleForceRefresh}
            color="warning"
          >
            Refresh
          </Button>
        </div>

        <h4>
          Mappa Virtual DOM ({mappedTree.length} elementi)
          {mappedTree !== tree && (
            <span style={{ color: "green", fontSize: 12 }}> [MODIFICATA]</span>
          )}
        </h4>
        {mappedTree.length === 0 ? (
          <p style={{ color: "#666", fontStyle: "italic" }}>
            Nessun elemento da mappare
          </p>
        ) : (
          <ul style={{ paddingLeft: 8 }}>
            {mappedTree.map((node) => renderNode(node))}
          </ul>
        )}
      </aside>

      <CustomFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        tree={mappedTree}
        setTree={setMappedTree}
      />
    </div>
  );
}
