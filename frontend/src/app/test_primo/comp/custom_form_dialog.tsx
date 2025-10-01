import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Switch,
  ListItemSecondaryAction,
  Box,
  Divider,
} from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";

// Definisci ElementNode qui o importalo
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

type InputControl = {
  path: string;
  label: string;
  id?: string | number | null;
  readOnly: boolean;
  visible: boolean;
};

interface CustomFormDialogProps {
  open: boolean;
  onClose: () => void;
  tree: ElementNode[];
  setTree: (tree: ElementNode[]) => void;
}

function collectInputs(tree: ElementNode[]): InputControl[] {
  const inputs: InputControl[] = [];
  
  function walkNode(node: ElementNode) {
    const props = node.props || {};
    const isInput = props.name || props.label || 
      /input|textfield|textarea|select|button|checkbox|radio/i.test(node.type);
    
    if (isInput) {
      inputs.push({
        path: node.path,
        label: props.label || node.text || node.type || 'Campo',
        id: node.id,
        readOnly: node.metadata?.editable === false,
        visible: node.metadata?.visible !== false,
      });
    }
    
    node.children.forEach(walkNode);
  }
  
  tree.forEach(walkNode);
  return inputs;
}

function applyControlsToTree(tree: ElementNode[], controls: InputControl[]): ElementNode[] {
  const controlsMap = new Map(controls.map(c => [c.path, c]));
  
  function updateNode(node: ElementNode): ElementNode {
    const control = controlsMap.get(node.path);
    
    const updatedNode: ElementNode = {
      ...node,
      metadata: {
        ...node.metadata,
        visible: control?.visible ?? node.metadata?.visible ?? true,
        editable: control ? !control.readOnly : node.metadata?.editable ?? true,
      },
      children: node.children.map(updateNode),
    };
    
    return updatedNode;
  }
  
  return tree.map(updateNode);
}

export default function CustomFormDialog({ 
  open, 
  onClose, 
  tree, 
  setTree 
}: CustomFormDialogProps) {
  const [controls, setControls] = useState<InputControl[]>([]);

  useEffect(() => {
    if (open) {
      const inputs = collectInputs(tree);
      setControls(inputs);
    }
  }, [open, tree]);

  const updateControl = (path: string, updates: Partial<InputControl>) => {
    setControls(prev => 
      prev.map(control => 
        control.path === path ? { ...control, ...updates } : control
      )
    );
  };

  const moveControl = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= controls.length) return;
    
    setControls(prev => {
      const newControls = [...prev];
      const [moved] = newControls.splice(fromIndex, 1);
      newControls.splice(toIndex, 0, moved);
      return newControls;
    });
  };

  const handleSave = () => {
    const updatedTree = applyControlsToTree(tree, controls);
    setTree(updatedTree);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Configura Campi</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          Modifica visibilità, editabilità e ordine dei campi
        </Box>
        <Divider />
        
        <List>
          {controls.length === 0 ? (
            <Box p={2} textAlign="center" color="text.secondary">
              Nessun campo rilevato
            </Box>
          ) : (
            controls.map((control, index) => (
              <ListItem key={control.path} divider>
                <ListItemText 
                  primary={control.label}
                  secondary={control.path}
                />
                <ListItemSecondaryAction>
                  <Box display="flex" alignItems="center" gap={1}>
                    <IconButton 
                      size="small" 
                      onClick={() => moveControl(index, index - 1)}
                      disabled={index === 0}
                      title="Sposta su"
                    >
                      <ArrowUpward fontSize="small" />
                    </IconButton>
                    
                    <IconButton 
                      size="small" 
                      onClick={() => moveControl(index, index + 1)}
                      disabled={index === controls.length - 1}
                      title="Sposta giù"
                    >
                      <ArrowDownward fontSize="small" />
                    </IconButton>
                    
                    <Switch 
                      checked={control.visible}
                      onChange={(e) => updateControl(control.path, { visible: e.target.checked })}
                      color="primary"
                      title="Visibile"
                    />
                    
                    <Switch 
                      checked={control.readOnly}
                      onChange={(e) => updateControl(control.path, { readOnly: e.target.checked })}
                      color="secondary"
                      title="Solo lettura"
                    />
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))
          )}
        </List>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>
          Annulla
        </Button>
        <Button onClick={handleSave} variant="contained">
          Salva
        </Button>
      </DialogActions>
    </Dialog>
  );
}