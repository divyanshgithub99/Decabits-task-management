import React, { useState, useEffect } from 'react';
import { Button, Grid, Paper, Box, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, TextField, Modal, Fade, Backdrop } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CancelIcon from '@mui/icons-material/Cancel';
import LogoutIcon from '@mui/icons-material/Logout';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import taskService from '../services/taskService';
import authService from '../services/authService';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [filter, setFilter] = useState('all');
  const [editTaskId, setEditTaskId] = useState(null); // Track the task being edited
  const [editText, setEditText] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [open, setOpen] = useState(false); // Control modal open/close state
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await taskService.getTasks();
      setTasks(response.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load tasks. Please try again.');
    }
  };

  const handleAddTask = async () => {
    if (newTask.trim()) {
      try {
        const task = {
          userId: currentUser.userId,
          text: newTask,
          description: newDescription,
        };
        await taskService.createTask(task);
        setNewTask('');
        setNewDescription('');
        loadTasks();
        toast.success('Task added successfully.');
      } catch (err) {
        console.error(err);
        toast.error('Failed to add task. Please try again.');
      }
    }
  };

  const handleUpdateTask = async (taskId) => {
    try {
      const updatedTask = {
        text: editText,
        description: editDescription,
      };
      await taskService.updateTask(taskId, updatedTask);
      setEditTaskId(null); // Reset editing state
      setOpen(false); // Close modal
      loadTasks();
      toast.success('Task updated successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update task. Please try again.');
    }
  };

  const handleToggleStatus = async (taskId) => {
    const task = tasks.find(task => task._id === taskId);
    try {
      await taskService.updateTask(taskId, { ...task, completed: !task.completed });
      loadTasks();
      toast.success(`Task status toggled successfully.`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle task status. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      loadTasks();
      toast.success('Task deleted successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete task. Please try again.');
    }
  };

  const handleLogout = () => {
    authService.logout();
    window.location.href = '/login'; // Redirect to login page
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
      <Grid item xs={12} style={{ position: 'fixed', top: 0, right: 0, padding: '10px' }}>
        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="secondary"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Grid>
      <Grid item xs={12} sm={6} style={{ marginTop: '60px' }}>
        <Paper elevation={3} className="task-list">
          <Box p={3}>
            <Typography variant="h4" component="h1" align="center" gutterBottom style={{ marginBottom: '1.5rem', color: '#3f51b5' }}>
              Task Management App
            </Typography>
            <div className="task-filter" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
              <Button variant={filter === 'all' ? 'contained' : 'outlined'} color="primary" onClick={() => setFilter('all')}>All</Button>
              <Button variant={filter === 'completed' ? 'contained' : 'outlined'} color="primary" onClick={() => setFilter('completed')}>Completed</Button>
              <Button variant={filter === 'pending' ? 'contained' : 'outlined'} color="primary" onClick={() => setFilter('pending')}>Pending</Button>
            </div>
            <div className="task-input" style={{ marginBottom: '1.5rem' }}>
              <TextField
                fullWidth
                margin="normal"
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add a new task"
              />
              <TextField
                fullWidth
                margin="normal"
                multiline
                rows={3}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Add a description"
              />
              <Button variant="contained" color="primary" onClick={handleAddTask}>Add Task</Button>
            </div>
            <List>
              {filteredTasks.map(task => (
                <ListItem key={task._id} className={task.completed ? 'completed' : 'pending'}>
                  <Grid container alignItems="center">
                    <Grid item xs={8}>
                      <ListItemText
                        primary={<Typography variant="body1" style={{ cursor: 'pointer'}}>{task.text}</Typography>}
                        secondary={<Typography variant="body2">{task.description}</Typography>}
                        onClick={() => handleToggleStatus(task._id)}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <ListItemSecondaryAction>
                        {task.completed ? (
                          <IconButton edge="end" onClick={() => handleToggleStatus(task._id)} aria-label="Mark as Pending">
                            <TaskAltIcon color="secondary" />
                          </IconButton>
                        ) : (
                          <IconButton edge="end" onClick={() => handleToggleStatus(task._id)} aria-label="Mark as Completed">
                            <PendingActionsIcon color="primary" />
                          </IconButton>
                        )}
                        <IconButton edge="end" onClick={() => { setEditTaskId(task._id); setEditText(task.text); setEditDescription(task.description); setOpen(true); }} aria-label="Edit">
                          <EditIcon />
                        </IconButton>
                        <IconButton edge="end" onClick={() => handleDeleteTask(task._id)} aria-label="Delete">
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </Grid>
                  </Grid>
                </ListItem>
              ))}
            </List>
          </Box>
        </Paper>
      </Grid>
      <Modal
        open={editTaskId !== null && open}
        onClose={handleClose}
        aria-labelledby="edit-task-modal"
        aria-describedby="modal-to-edit-task"
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
          style: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }, // Adjust transparency or color
        }}
      >
        <Fade in={open}>
          <Box
            position="absolute"
            top="50%"
            left="50%"
            style={{ transform: 'translate(-50%, -50%)' }}
            width={400}
            bgcolor="background.paper"
            border="2px solid #000"
            boxShadow={24}
            p={4}
            borderRadius={2}
          >
            <Typography id="edit-task-modal" variant="h6" component="h2">
              Edit Task
            </Typography>
            <TextField
              fullWidth
              margin="normal"
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Task"
            />
            <TextField
              fullWidth
              margin="normal"
              multiline
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description"
            />
            <Button variant="contained" color="primary" onClick={() => handleUpdateTask(editTaskId)} style={{marginRight:'1rem'}}>Update Task</Button>
            <Button variant="contained" color="primary" onClick={handleClose} style={{marginRight:'1rem'}}>Cancel</Button>
          </Box>
        </Fade>
      </Modal>
    </Grid>
  );
};

export default TaskList;
