'use client';
import React, { ReactElement, ReactNode, useEffect, useMemo, useState } from 'react';

type Meta = { visible: boolean; order: number; editable: boolean };
type TNode = { key: string; meta: Meta; node: ReactNode; isEl: boolean; children: TNode[] };

export default function MagicWrapper({ children }: { children: ReactNode }) {
  const [ovr, setOvr] = useState<Record<string, Meta>>({});

  // Build a simple tree from children, mixing defaults (props) with overrides
  const tree = useMemo((): TNode[] => {
    const walk = (nodes: ReactNode, parentKey = 'root'): TNode[] => {
      const arr = React.Children.toArray(nodes);
      return arr.map<TNode>((node, idx) => {
        const isEl = React.isValidElement(node);
        const el = isEl ? (node as ReactElement) : null;
        const rawKey = isEl ? el!.key ?? `${parentKey}-${idx}` : `${parentKey}-${idx}`;
        const key = String(rawKey).replace(/^\.\$?/, '');
        const props: any = isEl ? el!.props || {} : {};
        const def: Meta = {
          visible: typeof props.visible === 'boolean' ? props.visible : true,
          order: typeof props.order === 'number' ? props.order : idx,
          editable: typeof props.editable === 'boolean' ? props.editable : true,
        };
        const meta = ovr[key] ? { ...def, ...ovr[key] } as Meta : def;
        const children: TNode[] = isEl && props.children ? walk(props.children, key) : [];
        return { key, meta, node, isEl, children };
      });
    };
    return walk(children);
  }, [children, ovr]);

  // Log minimal structure
  useEffect(() => {
    const slim = (nodes: any[]): any[] =>
      nodes.map((n) => ({ key: n.key, ...n.meta, children: slim(n.children) }));
    // eslint-disable-next-line no-console
    console.log('MagicWrapper tree:', slim(tree));
  }, [tree]);

  // Render applying visibility + order; keep elements unchanged otherwise
  const render = (nodes: TNode[]): ReactNode => {
    const vis = nodes.filter((n) => n.meta.visible !== false);
    vis.sort((a, b) => (a.meta.order ?? 0) - (b.meta.order ?? 0));
    return vis.map((n) => {
      if (!n.isEl) return n.node;
      const childOut = render(n.children);
      return React.cloneElement(n.node as ReactElement, {
        'data-editable': n.meta.editable ? 'true' : 'false',
        'aria-disabled': n.meta.editable ? undefined : true,
        children: childOut,
      } as any);
    });
  };

  // Flat list for quick controls
  const list = useMemo(() => {
    const out: Array<{ key: string; depth: number; meta: Meta }> = [];
    const walk = (nodes: TNode[], depth: number) => {
      nodes.forEach((n) => {
        out.push({ key: n.key, depth, meta: n.meta });
        if (n.children?.length) walk(n.children, depth + 1);
      });
    };
    walk(tree, 0);
    return out;
  }, [tree]);

  const update = (key: string, patch: Partial<Meta>) =>
    setOvr((p) => ({ ...p, [key]: { ...(p[key] || {} as Meta), ...patch } as Meta }));

  return (
    <div>
      <div style={{ position: 'sticky', top: 0, background: '#fff', padding: 8, borderBottom: '1px solid #eee', marginBottom: 8 }}>
        <strong>Tree</strong>
        <div style={{ maxHeight: 200, overflow: 'auto', marginTop: 6 }}>
          {list.map((r) => (
            <div key={`ctl-${r.key}`} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
              <span style={{ paddingLeft: r.depth * 12 }}>{r.key}</span>
              <input type="number" value={Number.isFinite(r.meta.order) ? r.meta.order : 0} onChange={(e) => update(r.key, { order: parseInt(e.target.value || '0', 10) })} style={{ width: 56 }} />
              <button onClick={() => update(r.key, { visible: !r.meta.visible })}>{r.meta.visible ? '👁️' : '🚫'}</button>
              <button onClick={() => update(r.key, { editable: !r.meta.editable })}>{r.meta.editable ? '✏️' : '🔒'}</button>
            </div>
          ))}
        </div>
      </div>
      {render(tree)}
    </div>
  );
}
