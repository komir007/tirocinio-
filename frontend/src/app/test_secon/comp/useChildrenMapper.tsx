import React, { useMemo } from 'react';

type ChildMod = {
  hide?: boolean;
  disable?: boolean;
  addProps?: Record<string, any>;
  newOrder?: number;
};

export function useChildrenMapper(children: React.ReactNode) {
  const [mods, setMods] = React.useState<Map<number, ChildMod>>(new Map());
  
  const mappedChildren = useMemo(() => {
    const arr = React.Children.toArray(children);
    
    // Applica ordinamento se specificato
    const indexed = arr.map((child, i) => ({ child, originalIndex: i }));
    indexed.sort((a, b) => {
      const orderA = mods.get(a.originalIndex)?.newOrder ?? a.originalIndex;
      const orderB = mods.get(b.originalIndex)?.newOrder ?? b.originalIndex;
      return orderA - orderB;
    });
    
    return indexed.map(({ child, originalIndex }) => {
      const mod = mods.get(originalIndex);
      if (!mod) return child;
      
      if (mod.hide) return null;
      
      if (React.isValidElement(child)) {
        const newProps: any = { ...mod.addProps };
        
        if (mod.disable) {
          newProps.disabled = true;
          newProps.style = { ...child.props.style, opacity: 0.5 };
        }
        
        return React.cloneElement(child, newProps);
      }
      
      return child;
    }).filter(Boolean);
  }, [children, mods]);
  
  const modifyChild = (index: number, modification: ChildMod) => {
    setMods(prev => new Map(prev.set(index, { ...prev.get(index), ...modification })));
  };
  
  const resetChild = (index: number) => {
    setMods(prev => {
      const next = new Map(prev);
      next.delete(index);
      return next;
    });
  };
  
  return { mappedChildren, modifyChild, resetChild, mods };
}