import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  TextField,
  ThemeProvider,
  Typography,
} from '@mui/material';
import { createTheme } from '@mui/material/styles';
import './App.css';

const theme = createTheme({
  palette: {
    primary: { main: '#b71c1c', dark: '#8e0000', contrastText: '#ffffff' },
    error: { main: '#b71c1c' },
    background: { default: '#f7f7f7', paper: '#ffffff' },
    text: { primary: '#202124', secondary: '#555b62' },
  },
  shape: { borderRadius: 6 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { minHeight: 44, borderRadius: 6, textTransform: 'none', fontWeight: 600 },
      },
    },
  },
});

const formatDueDate = (value) => {
  if (!value) {
    return 'No due date';
  }

  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
};

function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [taskName, setTaskName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDueDate, setEditDueDate] = useState('');

  const loadItems = useCallback(async () => {
    try {
      const response = await fetch('/api/items');
      if (!response.ok) {
        throw new Error('Unable to load tasks');
      }
      setItems(await response.json());
      setError('');
    } catch (loadError) {
      setError('Could not load tasks. Please try again.');
      console.error('Error loading tasks:', loadError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleCreate = async (event) => {
    event.preventDefault();
    if (!taskName.trim()) return;

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: taskName.trim(), due_date: dueDate || null }),
      });

      if (!response.ok) {
        throw new Error('Unable to add task');
      }

      setTaskName('');
      setDueDate('');
      setError('');
      await loadItems();
      setStatus('Task added');
    } catch (createError) {
      setError('Could not add task. Please try again.');
      console.error('Error adding task:', createError);
    }
  };

  const openEditDialog = (item) => {
    setEditingItem(item);
    setEditName(item.name);
    setEditDueDate(item.due_date || '');
    setError('');
    setStatus('');
  };

  const closeEditDialog = () => {
    setEditingItem(null);
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!editingItem || !editName.trim()) return;

    try {
      const response = await fetch(`/api/items/${editingItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          due_date: editDueDate || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Unable to update task');
      }

      closeEditDialog();
      setError('');
      await loadItems();
      setStatus('Task updated');
    } catch (updateError) {
      setError('Could not update task. Please try again.');
      console.error('Error updating task:', updateError);
    }
  };

  const handleDelete = async (itemId) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Unable to delete task');
      }

      setItems(currentItems => currentItems.filter(item => item.id !== itemId));
      setError('');
      setStatus('Task deleted');
    } catch (deleteError) {
      setError('Could not delete task. Please try again.');
      console.error('Error deleting task:', deleteError);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="app-shell">
        <Box component="main" className="app-content">
          <Box component="header" sx={{ mb: 4 }}>
            <Typography component="h1" variant="h4" fontWeight={700}>
              Tasks
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Keep track of what needs to get done.
            </Typography>
          </Box>

          <Paper component="section" variant="outlined" className="task-panel">
            <Typography component="h2" variant="h6" id="add-task-heading" fontWeight={600}>
              Add a task
            </Typography>
            <Box
              component="form"
              aria-labelledby="add-task-heading"
              onSubmit={handleCreate}
              className="task-form"
            >
              <TextField
                label="Task name"
                value={taskName}
                onChange={event => setTaskName(event.target.value)}
                required
                fullWidth
                inputProps={{ maxLength: 200 }}
              />
              <TextField
                label="Due date"
                type="date"
                value={dueDate}
                onChange={event => setDueDate(event.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <Button type="submit" variant="contained">
                Add task
              </Button>
            </Box>

            {error && <Alert severity="error" role="alert" sx={{ mt: 2 }}>{error}</Alert>}
            <Typography className="status-message" role="status" aria-live="polite">
              {status}
            </Typography>

            <Divider sx={{ my: 2.5 }} />

            <Typography
              component="h2"
              variant="h6"
              id="task-list-heading"
              fontWeight={600}
              sx={{ mb: 1 }}
            >
              Your tasks
            </Typography>

            {loading ? (
              <Box className="loading-state" role="status" aria-label="Loading tasks">
                <CircularProgress size={24} />
                <Typography color="text.secondary">Loading tasks</Typography>
              </Box>
            ) : error ? null : items.length === 0 ? (
              <Typography color="text.secondary" sx={{ py: 2 }}>
                No tasks yet. Add one above.
              </Typography>
            ) : (
              <List aria-labelledby="task-list-heading" disablePadding>
                {items.map(item => (
                  <ListItem
                    key={item.id}
                    divider
                    className="task-list-item"
                    secondaryAction={(
                      <Stack direction="row" spacing={0.5}>
                        <Button
                          type="button"
                          onClick={() => openEditDialog(item)}
                          aria-label={`Edit ${item.name}`}
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          color="error"
                          onClick={() => handleDelete(item.id)}
                          aria-label={`Delete ${item.name}`}
                        >
                          Delete
                        </Button>
                      </Stack>
                    )}
                  >
                    <ListItemText
                      primary={item.name}
                      secondary={formatDueDate(item.due_date)}
                      primaryTypographyProps={{ fontWeight: 500 }}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Box>

        <Dialog
          open={Boolean(editingItem)}
          onClose={closeEditDialog}
          aria-labelledby="edit-task-title"
          fullWidth
          maxWidth="xs"
        >
          <Box component="form" onSubmit={handleUpdate}>
            <DialogTitle id="edit-task-title">Edit task</DialogTitle>
            <DialogContent>
              <Stack spacing={2} sx={{ pt: 1 }}>
                <TextField
                  label="Task name"
                  value={editName}
                  onChange={event => setEditName(event.target.value)}
                  required
                  fullWidth
                  autoFocus
                  inputProps={{ maxLength: 200 }}
                />
                <TextField
                  label="Due date"
                  type="date"
                  value={editDueDate}
                  onChange={event => setEditDueDate(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button type="button" onClick={closeEditDialog}>
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                Save changes
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}

export default App;