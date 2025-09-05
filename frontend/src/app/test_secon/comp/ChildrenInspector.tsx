import React from 'react';

export function ChildrenInspector({ children }: { children: React.ReactNode }) {
  console.log('ChildrenInspector render', children);

  const mapChildren = (nodes: React.ReactNode, path: number[] = []) => {
    const result: any[] = [];
    React.Children.forEach(nodes, (child, i) => {
      const currentPath = [...path, i];
      if (React.isValidElement(child)) {
        const type =
          typeof child.type === 'string'
            ? child.type
            : ((child.type as any).displayName || (child.type as any).name || 'Component');

        const propKeys = Object.keys(child.props || {}).filter((k) => k !== 'children');

        const node: any = {
          index: i,
          path: currentPath,
          type,
          props: propKeys,
          hasChildren: !!child.props && !!child.props.children,
          key: child.key,
        };

        if (child.props && child.props.children) {
          node.children = mapChildren(child.props.children, currentPath);
        }

        result.push(node);
      } else {
        // primitive (string/number/boolean/null/undefined)
        result.push({
          index: i,
          path: currentPath,
          type: typeof child,
          value: child === null || child === undefined ? String(child) : String(child),
        });
      }
    });
    return result;
  };

  const childrenData = React.useMemo(() => {
    const data = mapChildren(children) || [];
    console.log('ChildrenInspector childrenData', data);
    return data;
  }, [children]);

  return (
    <details style={{ fontSize: 12, marginTop: 8 }}>
      <summary>🔍 Children Map ({childrenData.length})</summary>
      <pre style={{ background: '#f5f5f5', padding: 8, overflow: 'auto' }}>
        {JSON.stringify(childrenData, null, 2)}
      </pre>
    </details>
  );
}
