import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  Box,
  Toolbar,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Send, Delete, ContentCopy, History, MoreVert, Restaurant } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI, recipeAPI } from '../services/api';

const drawerWidth = 280;

const PromptSidebar = ({ open, onClose }) => {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [recipeMenu, setRecipeMenu] = useState({ anchorEl: null, id: null });

  const { data: createdData } = useQuery({
    queryKey: ['sidebar', 'created', { limit: 50 }],
    queryFn: () => userAPI.getCreatedRecipes({ limit: 50 }),
    enabled: !!isAuthenticated,
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: (id) => recipeAPI.deleteRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sidebar', 'created'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'created'] });
    },
  });

  const archiveRecipeMutation = useMutation({
    mutationFn: (id) => recipeAPI.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sidebar', 'created'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'created'] });
    },
  });

  const unarchiveRecipeMutation = useMutation({
    mutationFn: (id) => recipeAPI.unarchive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sidebar', 'created'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'created'] });
    },
  });


  const content = (
    <Box sx={{ width: drawerWidth, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <History color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Chef Claude</Typography>
        </Box>
      </Toolbar>

      {/* Your Recipes Section */}
      {isAuthenticated && (
        <>
          <Divider />
          <Box sx={{ px: 2, pt: 1, pb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Restaurant color="primary" fontSize="small" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Your Recipes</Typography>
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {createdData?.recipes?.length ? (
              <List dense>
                {createdData.recipes.map((r) => (
                  <ListItemButton key={r._id} onClick={() => navigate(`/recipe/${r._id}`)}>
                    <ListItemText primaryTypographyProps={{ noWrap: true }} primary={r.title} secondary={(r.isPublic !== false ? 'Public' : 'Private') + ' • ' + new Date(r.createdAt).toLocaleDateString()} />
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); setRecipeMenu({ anchorEl: e.currentTarget, id: r._id, isPublic: r.isPublic !== false }); }}>
                      <MoreVert fontSize="small" />
                    </IconButton>
                  </ListItemButton>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
                No created recipes yet.
              </Typography>
            )}
          </Box>
        </>
      )}


      {/* Recipe menu */}
      <Menu anchorEl={recipeMenu.anchorEl} open={Boolean(recipeMenu.anchorEl)} onClose={() => setRecipeMenu({ anchorEl: null, id: null, isPublic: undefined })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MenuItem onClick={() => { const id = recipeMenu.id; setRecipeMenu({ anchorEl: null, id: null, isPublic: undefined }); navigate(`/recipe/${id}`); }}>
          <ListItemIcon><Send fontSize="small" /></ListItemIcon>
          Open
        </MenuItem>
        <MenuItem onClick={async () => { const id = recipeMenu.id; try { await navigator.clipboard.writeText(`${window.location.origin}/recipe/${id}`); } catch {} setRecipeMenu({ anchorEl: null, id: null, isPublic: undefined }); }}>
          <ListItemIcon><ContentCopy fontSize="small" /></ListItemIcon>
          Copy Link
        </MenuItem>
        {recipeMenu.isPublic === true ? (
          <MenuItem onClick={() => { const id = recipeMenu.id; setRecipeMenu({ anchorEl: null, id: null, isPublic: undefined }); archiveRecipeMutation.mutate(id); }} disabled={archiveRecipeMutation.isPending}>
            <ListItemIcon><Delete fontSize="small" /></ListItemIcon>
            Archive (make private)
          </MenuItem>
        ) : (
          <MenuItem onClick={() => { const id = recipeMenu.id; setRecipeMenu({ anchorEl: null, id: null, isPublic: undefined }); unarchiveRecipeMutation.mutate(id); }} disabled={unarchiveRecipeMutation.isPending}>
            <ListItemIcon><Send fontSize="small" /></ListItemIcon>
            Make Public
          </MenuItem>
        )}
        <MenuItem onClick={() => { const id = recipeMenu.id; setRecipeMenu({ anchorEl: null, id: null, isPublic: undefined }); deleteRecipeMutation.mutate(id); }} disabled={deleteRecipeMutation.isPending}>
          <ListItemIcon><Delete fontSize="small" /></ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );

  if (mdUp) {
    return (
      <Drawer variant="permanent" open PaperProps={{ sx: { width: drawerWidth, boxSizing: 'border-box' } }}>
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer variant="temporary" open={open} onClose={onClose} ModalProps={{ keepMounted: true }} PaperProps={{ sx: { width: drawerWidth, boxSizing: 'border-box' } }}>
      {content}
    </Drawer>
  );
};

export default PromptSidebar;
