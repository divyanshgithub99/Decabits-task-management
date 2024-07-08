const Task = require('../models/Task');

// Get all tasks for the logged-in user
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id }); // Fetch tasks for the logged-in user
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new task
const createTask = async (req, res) => {
  const { text, description, completed } = req.body;
  const task = new Task({
    userId: req.user.id, // Assign logged-in user's ID
    text,
    description,
    completed: completed || false,
  });

  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Update a task
const updateTask = async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete a task
const deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Task deleted' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask,
};
