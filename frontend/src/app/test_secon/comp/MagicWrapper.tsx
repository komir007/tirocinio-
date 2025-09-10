"use client";
import React, {
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useState,
  useContext,
  use,
} from "react";
import Box from "@mui/material/Box";
import { AuthContext } from "../../components/Authcontext";
import MagicSettingsDialog from "./MagicSettingsDialog";
import IconButton from "@mui/material/IconButton";
import SettingsIcon from "@mui/icons-material/Settings";


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
  const role = authContext?.user?.role;
  const parentid = authContext?.user?.parentId;
  const [ovr, setOvr] = useState<Record<string, Meta>>({});





  // Build a simple tree from children, mixing defaults (props) with overrides
  const tree = useMemo((): TNode[] => {
    const walk = (nodes: ReactNode, parentKey = "root"): TNode[] => {
      const arr = React.Children.toArray(nodes);
      return arr.map<TNode>((node, idx) => {
        const isEl = React.isValidElement(node);
        const el = isEl ? node : null;
        const rawKey = isEl
          ? el!.key ?? `${parentKey}-${idx}`
          : `${parentKey}-${idx}`;
        const key = String(rawKey).replace(/^\.\$?/, "");
        const props: any = isEl ? el!.props ?? {} : {};
        const def: Meta = {
          visible: typeof props.visible === "boolean" ? props.visible : true,
          order: typeof props.order === "number" ? props.order : idx,
          disabled:
            typeof props.disabled === "boolean" ? props.disabled : false,
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
    console.log("ovr_json:", JSON.stringify(ovr));
    console.log("children:", children);
  }, [tree, ovr]);

  // Render applying visibility + order; keep elements unchanged otherwise
  const render = (nodes: TNode[]): ReactNode => {
    const vis = nodes.filter((n) => n.meta.visible !== false);
    vis.sort((a, b) => (a.meta.order ?? 0) - (b.meta.order ?? 0));
    return vis.map((n) => {
      if (!n.isEl) return n.node;
      const childOut = render(n.children);

      // Simple disabled handling
      const extra: any = {
        "data-disabled": n.meta.disabled ? "true" : "false",
        "aria-disabled": n.meta.disabled || undefined,
      };

      if (n.meta.disabled) {
        const el = n.node as ReactElement;
        const type = el?.type;
        const isIntrinsic = typeof type === "string";

        const existingStyle = (el.props as any)?.style || {};
        extra.style = { ...existingStyle, opacity: 0.6 };

        if (!isIntrinsic) {
          extra.style.pointerEvents = "none";
        } else {
          const nativeControls = [
            "input",
            "select",
            "textarea",
            "button",
            "fieldset",
            "option",
            "optgroup",
          ];
          if (nativeControls.includes(type as string)) extra.disabled = true;
        }
      }

      return React.cloneElement(n.node as ReactElement, {
        ...extra,
        children: childOut,
      });
    });
  };

  // Flat list for quick controls
  const list = useMemo(() => {
    const out: Array<{ key: string; depth: number; meta: Meta }> = [];
    const walk = (nodes: TNode[], depth: number) => {
      nodes.forEach((n) => {
        // include only element nodes whose key starts with the specified prefixes
        const keyLower = (n.key || "").toLowerCase();
        if (
          n.isEl &&
          (keyLower.startsWith("form") ||
            keyLower.startsWith("sezione") ||
            keyLower.startsWith("field"))
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

  // NOTE: save/load are handled inside the dialog. The wrapper keeps ovr and
  // passes formKey + userId so the dialog can compute storage keys.

  const update = (key: string, patch: Partial<Meta>) =>
    setOvr((p) => ({ ...p, [key]: { ...(p[key] ?? {}), ...patch } }));

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
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Box width="100%"></Box>
          <strong>Custom</strong>
          <MagicSettingsDialog
            ovr={ovr}
            setOvr={setOvr}
            update={update}
            list={list}
            formKey={formKey}
            userId={userId}
            role={role}
            parentId={parentid}
          />
        </div>
      </div>
      {render(tree)}
      
    </div>
  );
}
