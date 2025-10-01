"use client";
import React, { ReactElement, ReactNode, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import MagicSettingsDialog from "./MagicSettingsDialog";

export type Meta = {
  visible: boolean;
  order: number;
  disabled: boolean;
  adminlock?: boolean;
};

export type Metaex = Meta & {
  _adminVisible?: boolean;
  _adminOrder?: boolean;
  _adminDisabled?: boolean;
};

export type TNode = {
  key: string;
  meta: Meta;
  node: ReactNode;
  isEl: boolean;
  children: TNode[];
};

export default function MagicWrapper({
  children,
  sx = {},
}: {
  children: ReactNode;
  sx?: any;
}) {
  const [ovr, setOvr] = useState<Record<string, Meta>>({});
  // call ricorsiva che traversa l'albero dei nodi React;
  const tree = useMemo((): TNode[] => {
    const walk = (nodes: ReactNode, parentKey = "root"): TNode[] => {
      const arr = React.Children.toArray(nodes);
      return arr.map<TNode>((node, idx) => {
        const isEl = React.isValidElement(node);
        const el = isEl ? node : null;
        const rawKey = isEl ? el!.key ?? `${parentKey}-${idx}` : `${parentKey}-${idx}`;
        const key = String(rawKey).replace(/^\.\$?/, "");
        const props: any = isEl ? el!.props ?? {} : {};
        const def: Meta = {
          visible: typeof props.visible === "boolean" ? props.visible : true,
          order: typeof props.order === "number" ? props.order : idx,
          disabled: typeof props.disabled === "boolean" ? props.disabled : false,
          adminlock: typeof props.adminlock === "boolean" ? props.adminlock : false,
        };
        const meta = ovr[key] ? { ...def, ...ovr[key] } : def;
        const children: TNode[] =
          isEl && props.children ? walk(props.children, key) : [];
        return { key, meta, node, isEl, children };
      });
    };
    return walk(children);
  }, [children, ovr]);

  const render = (nodes: TNode[]): ReactNode => {
    const vis = nodes.filter((n) => n.meta.visible !== false);
    vis.sort((a, b) => (a.meta.order ?? 0) - (b.meta.order ?? 0));
    return vis.map((n) => {
      if (!n.isEl) return n.node;
      const childOut = render(n.children);

      const extra: any = {
        "data-disabled": n.meta.disabled ? "true" : "false",
        "aria-disabled": n.meta.disabled || undefined,
      };

      if (n.meta.disabled) {
        const el = n.node as ReactElement;
        const existingStyle = (el.props as any)?.style || {};
        extra.style = { ...existingStyle, opacity: 0.6 };
        extra.style.pointerEvents = "none";
      }
      return React.cloneElement(n.node as ReactElement, {
        ...extra,
        children: childOut,
      });
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: "1 1 auto",
        minHeight: 0,
        ...sx,
      }}
    >
      <Box
        style={{
          position: "sticky",
          top: 0,
          background: "#fff",
          padding: 8,
          borderBottom: "1px solid #eee",
          marginBottom: 8,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box width="100%"></Box>
          <strong>Custom</strong>
          <MagicSettingsDialog tree={tree} ovr={ovr} setOvr={setOvr} />
        </Box>
      </Box>
      {render(tree)}
    </Box>
  );
}

// Log minimal structure
/*
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
  */

//const type = el?.type;
//const isIntrinsic = typeof type === "string";
/*
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
        }*/
