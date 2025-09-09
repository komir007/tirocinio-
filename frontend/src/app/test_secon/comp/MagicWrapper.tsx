"use client";
import React, {
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useState,
  useContext,
} from "react";
import { AuthContext } from "../../components/Authcontext";

type Meta = {
  visible: boolean;
  order: number;
  disabled: boolean;
};
type TNode = {
  key: string;
  meta: Meta;
  node: ReactNode;
  isEl: boolean;
  children: TNode[];
};

export default function MagicWrapper({ children }: { children: ReactNode }) {
  const authContext = useContext(AuthContext);
  const userId = authContext?.user?.id;
  
  // saved snapshot serialized for dirty check
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [ovr, setOvr] = useState<Record<string, Meta>>({});

  // Build a simple tree from children, mixing defaults (props) with overrides
  const tree = useMemo((): TNode[] => {
    const walk = (nodes: ReactNode, parentKey = "root"): TNode[] => {
      const arr = React.Children.toArray(nodes);
      return arr.map<TNode>((node, idx) => {
        const isEl = React.isValidElement(node);
        const el = isEl ? node : null;
        const rawKey = isEl ? el!.key ?? `${parentKey}-${idx}` : `${parentKey}-${idx}`;
        const key = String(rawKey).replace(/^\.\$?/, "");
        const props: any = isEl ? el!.props || {} : {};
        const def: Meta = {
          visible: typeof props.visible === "boolean" ? props.visible : true,
          order: typeof props.order === "number" ? props.order : idx,
          disabled: typeof props.disabled === "boolean" ? props.disabled : false,
        };
        const meta = ovr[key] ? { ...def, ...ovr[key] } : def;
        const children: TNode[] =
          isEl && props.children ? walk(props.children, key) : [];
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
    console.log("Full tree:", tree);
    console.log("MagicWrapper slim tree:", slim(tree));
    console.log("Overrides:", ovr);
    console.log("children:", children);

  }, [tree, ovr]);

  // Render applying visibility + order; keep elements unchanged otherwise
  const render = (nodes: TNode[]): ReactNode => {
    const vis = nodes.filter((n) => n.meta.visible !== false);
    vis.sort((a, b) => (a.meta.order ?? 0) - (b.meta.order ?? 0));
    return vis.map((n) => {
      if (!n.isEl) return n.node;
      const childOut = render(n.children);

      // Prepare extra props to apply when a node is disabled.
      const extra: any = {
        "data-disabled": n.meta.disabled ? "true" : "false",
        "aria-disabled": n.meta.disabled ? true : undefined,
      };

      if (n.meta.disabled) {
        const el = n.node as ReactElement;
        const type = el.type;
        const isIntrinsic = typeof type === "string";

        // For native form controls, set the disabled prop so they become non-interactable
        // and are treated correctly by the browser (focus, keyboard, etc.).
        if (isIntrinsic) {
          const tag = type as string;
          if (
            [
              "input",
              "select",
              "textarea",
              "button",
              "fieldset",
              "option",
              "optgroup",
            ].includes(tag)
          ) {
            extra.disabled = true;
          }
        }

        // Merge existing style with visual disabled styles (lighter tone) and prevent pointer events
        const existingStyle = (el.props as any)?.style || {};
        // For intrinsic form controls we rely on the native `disabled` attribute; still apply reduced opacity.
        // For custom components, also add pointerEvents: 'none' so they become non-interactive.
        extra.style = isIntrinsic
          ? { ...existingStyle, opacity: 0.6 }
          : { ...existingStyle, opacity: 0.6, pointerEvents: "none" };
      }

      return React.cloneElement(
        n.node as ReactElement,
        {
          ...extra,
          children: childOut,
        } as any
      );
    });
  };

  // Flat list for quick controls
  const list = useMemo(() => {
    const out: Array<{ key: string; depth: number; meta: Meta }> = [];
    const walk = (nodes: TNode[], depth: number) => {
      nodes.forEach((n) => {
        // include only element nodes whose key starts with the specified prefixes
        const keyLower = (n.key || '').toLowerCase();
        if (
          n.isEl &&
          (keyLower.startsWith('form') || keyLower.startsWith('sezione') || keyLower.startsWith('field'))
        ) {
          out.push({ key: n.key, depth, meta: n.meta });
        }
        if (n.children?.length) walk(n.children, depth + 1);
      });
    };
    walk(tree, 0);
    console.log("Flat list:", out);
    console.log("rendered:", render(tree));
    return out;
  }, [tree]);

  // derive a form key from the tree (first node whose key starts with 'form')
  const formKey = useMemo(() => {
    const find = (nodes: TNode[]): string | null => {
      for (const n of nodes) {
        const k = (n.key || "").toLowerCase();
        if (k.startsWith("form")) return n.key;
        if (n.children?.length) {
          const c = find(n.children);
          if (c) return c;
        }
      }
      return null;
    };
    return find(tree) || "global";
  }, [tree]);

  const storageKey = (uid?: string) => `magic_ovr:${uid || "anon"}:${formKey}`;

  const saveToLocal = () => {
    if (typeof window === "undefined") return;
    try {
      const payload = { ovr, savedAt: Date.now() };
      localStorage.setItem(storageKey(userId), JSON.stringify(payload));
      const s = JSON.stringify(ovr);
      setSavedSnapshot(s);
      setIsSaved(true);
      // eslint-disable-next-line no-console
      console.log("MagicWrapper: saved overrides to localStorage:--->", storageKey(userId), JSON.stringify(payload));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Error saving overrides:", e);
    }
  };

  const loadFromLocal = () => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(storageKey(userId));
      if (!raw) {
        // eslint-disable-next-line no-console
        console.log("No saved overrides found for key", storageKey(userId));
        return;
      }
      const data = JSON.parse(raw);
      if (data && typeof data.ovr === "object") {
        setOvr(data.ovr);
        const s = JSON.stringify(data.ovr);
        setSavedSnapshot(s);
        setIsSaved(true);
        // eslint-disable-next-line no-console
        console.log("MagicWrapper: loaded overrides from localStorage", storageKey(userId));
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Error loading overrides:", e);
    }
  };

  // track dirty state
  useEffect(() => {
    const cur = JSON.stringify(ovr);
    setIsSaved(savedSnapshot === cur && savedSnapshot !== null);
  }, [ovr, savedSnapshot]);

  // auto-load when user/form key becomes available
  useEffect(() => {
    // try to load automatically if there's something saved
    try {
      if (typeof window === "undefined") return;
      const raw = localStorage.getItem(storageKey(userId));
      if (raw) loadFromLocal();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Error checking saved overrides:", e);
    }
  }, [userId, formKey]);

  const update = (key: string, patch: Partial<Meta>) =>
    setOvr((p) => ({
      ...p,
      [key]: { ...(p[key] || ({} as Meta)), ...patch } as Meta,
    }));

  return (
    <div>
      <div
        style={{
          position: "sticky",
          top: 0,
          background: "#fff",
          padding: 8,
          borderBottom: "1px solid #eee",
          marginBottom: 8,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
          <strong>Tree</strong>
          <div style={{display: 'flex', gap: 8, marginLeft: 8, alignItems: 'center'}}>
            <button onClick={saveToLocal} title="Salva le modifiche per utente e form">Salva</button>
            <button onClick={loadFromLocal} title="Carica il salvataggio salvato">Carica</button>
            <button
              onClick={() => {
                // conferma semplice per evitare cancellazioni accidentali
                const ok = typeof window !== 'undefined' ? window.confirm('Resettare tutte le personalizzazioni per questo form?') : true;
                if (!ok) return;
                try {
                  localStorage.removeItem(storageKey(userId));
                } catch (e) {
                  // ignore
                }
                setOvr({});
                setSavedSnapshot(null);
                setIsSaved(false);
                // eslint-disable-next-line no-console
                console.log('MagicWrapper: reset overrides and removed saved entry', storageKey(userId));
              }}
              title="Resetta le personalizzazioni (cancella anche il salvataggio)">
              Reset
            </button>
            <span style={{fontSize: 12, color: isSaved ? 'green' : 'crimson'}}>
              {isSaved ? 'Salvato' : 'Modifiche non salvate'}
            </span>
          </div>
        </div>
        <div style={{ maxHeight: 200, overflow: "auto", marginTop: 6 }}>
          {list.map((r) => (
            <div
              key={`ctl-${r.key}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 0",
              }}
            >
              <span style={{ paddingLeft: r.depth * 12 }}>{r.key}</span>
              <input
                type="number"
                value={Number.isFinite(r.meta.order) ? r.meta.order : 0}
                onChange={(e) =>
                  update(r.key, { order: parseInt(e.target.value || "0", 10) })
                }
                style={{ width: 56 }}
              />
              <button
                onClick={() => update(r.key, { visible: !r.meta.visible })}
              >
                {r.meta.visible ? "👁️" : "🚫"}
              </button>
              <button
                onClick={() => update(r.key, { disabled: !r.meta.disabled })}
              >
                {r.meta.disabled ? "🔒" : "✏️"}
              </button>
            </div>
          ))}
        </div>
      </div>
      {render(tree)}
      
    </div>
  );
}
