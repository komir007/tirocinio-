
import React from 'react';

export function ChildrenInspector({ children }: { children: React.ReactNode }) {
    console.log('ChildrenInspector render', children);
  const childrenData = React.useMemo(() => {
    return React.Children.map(children, (child, index) => {
      if (React.isValidElement(child)) {
        return {
          index,
          type: typeof child.type === 'string' ? child.type : 'Component',
          props: Object.keys(child.props || {}),
          hasChildren: !!child.props.children,
          key: child.key
        };
      }
      return { index, type: typeof child, value: String(child) };
    }) || [];
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
