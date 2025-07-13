import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { useTaskStore } from '../stores/taskStore';
import { useVacationStore } from '../stores/vacationStore';
import { Plus, Search, Filter, CheckSquare, Clock, User, Calendar, Edit, Trash2 } from 'lucide-react';
import { gsap } from 'gsap';

interface TaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignedTo: string;
}

export const TasksPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedVacationId, setSelectedVacationId] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [taskForm, setTaskForm] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assignedTo: '',
  });
  
  const { tasks, isLoading, fetchTasks, createTask, updateTask, deleteTask } = useTaskStore();
  const { vacations, fetchVacations } = useVacationStore();
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchVacations();
  }, [fetchVacations]);

  useEffect(() => {
    if (vacations.length > 0) {
      // Check if there's a vacation ID in the URL params
      const vacationFromUrl = searchParams.get('vacation');
      if (vacationFromUrl && vacations.find(v => v.id === vacationFromUrl)) {
        setSelectedVacationId(vacationFromUrl);
      } else if (!selectedVacationId) {
        setSelectedVacationId(vacations[0].id);
      }
    }
  }, [vacations, selectedVacationId, searchParams]);

  useEffect(() => {
    if (selectedVacationId) {
      fetchTasks(selectedVacationId);
    }
  }, [selectedVacationId, fetchTasks]);

  useEffect(() => {
    if (pageRef.current) {
      const elements = pageRef.current.querySelectorAll('.animate-element');
      gsap.fromTo(elements,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
      );
    }
  }, []);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
      case 'completed':
        return 'bg-green-500/20 text-green-300 border-green-400/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-400/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'high':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    let newStatus: string;
    
    // Cycle through: pending -> in-progress -> completed -> pending
    switch (currentStatus) {
      case 'pending':
        newStatus = 'in-progress';
        break;
      case 'in-progress':
        newStatus = 'completed';
        break;
      case 'completed':
        newStatus = 'pending';
        break;
      default:
        newStatus = 'pending';
    }
    
    console.log(`🔄 [TasksPage] Changing task ${taskId} status from ${currentStatus} to ${newStatus}`);
    
    try {
      await updateTask(taskId, { status: newStatus });
      console.log(`✅ [TasksPage] Task status updated successfully`);
    } catch (error) {
      console.error('❌ [TasksPage] Failed to update task status:', error);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedVacationId) return;

    try {
      // Convert empty strings to null for optional fields
      const taskData = {
        ...taskForm,
        vacationId: selectedVacationId,
        dueDate: taskForm.dueDate || null,
        assignedTo: taskForm.assignedTo || null,
      };
      
      await createTask(taskData);
      
      setTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        assignedTo: '',
      });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTask) return;

    try {
      // Convert empty strings to null for optional fields
      const taskData = {
        ...taskForm,
        dueDate: taskForm.dueDate || null,
        assignedTo: taskForm.assignedTo || null,
      };
      
      await updateTask(editingTask.id, taskData);
      setIsEditModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate || '',
      assignedTo: task.assignedTo || '',
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('Failed to delete task:', error);
      }
    }
  };

  if (vacations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96 p-8">
        <div className="text-center glass-card p-8 rounded-3xl">
          <CheckSquare className="h-16 w-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No Vacations Found</h3>
          <p className="text-white/60">Create a vacation first to manage its tasks</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="space-y-8 p-8">
      {/* Header */}
      <div className="animate-element flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Tasks</h1>
          <p className="text-white/70">
            Manage your vacation planning tasks and collaborate with your team
          </p>
        </div>
        <Button
          icon={Plus}
          onClick={() => setIsCreateModalOpen(true)}
          glow
          disabled={!selectedVacationId}
        >
          Create Task
        </Button>
      </div>

      {/* Vacation Selector */}
      <div className="animate-element">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <label className="text-white font-medium">Select Vacation:</label>
              <select
                value={selectedVacationId}
                onChange={(e) => setSelectedVacationId(e.target.value)}
                className="glass-select rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                {vacations.map((vacation) => (
                  <option key={vacation.id} value={vacation.id}>
                    {vacation.title}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="animate-element grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Total Tasks</p>
                <p className="text-2xl font-bold text-white">{tasks.length}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Completed</p>
                <p className="text-2xl font-bold text-white">
                  {tasks.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <CheckSquare className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">In Progress</p>
                <p className="text-2xl font-bold text-white">
                  {tasks.filter(t => t.status === 'in-progress').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Pending</p>
                <p className="text-2xl font-bold text-white">
                  {tasks.filter(t => t.status === 'pending').length}
                </p>
              </div>
              <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Clock className="h-4 w-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="animate-element flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search tasks..."
            icon={Search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-white/60" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="glass-select rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="glass-select rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="animate-element space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <Card key={task.id} className="group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <button
                      onClick={() => toggleTaskStatus(task.id, task.status)}
                      className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                        task.status === 'completed' 
                          ? 'bg-green-500 border-green-500' 
                          : task.status === 'in-progress'
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-white/30 hover:border-white/50'
                      }`}
                      title={`Click to change from ${task.status} to ${
                        task.status === 'pending' ? 'in-progress' :
                        task.status === 'in-progress' ? 'completed' : 'pending'
                      }`}
                    >
                      {task.status === 'completed' && (
                        <CheckSquare className="h-3 w-3 text-white" />
                      )}
                      {task.status === 'in-progress' && (
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className={`font-semibold text-white group-hover:text-blue-300 transition-colors ${
                          task.status === 'completed' ? 'line-through opacity-60' : ''
                        }`}>
                          {task.title}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                          {task.status === 'in-progress' ? 'In Progress' : 
                           task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                        </span>
                        <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-white/60 text-sm mb-3">{task.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-white/50">
                        {task.assignedTo && (
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{task.assignedTo}</span>
                          </div>
                        )}
                        
                        {task.dueDate && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      icon={Edit}
                      onClick={() => handleEdit(task)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      icon={Trash2}
                      onClick={() => handleDelete(task.id)}
                      className="text-red-400 hover:text-red-300"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto glass-card p-8 rounded-3xl">
              <CheckSquare className="h-16 w-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">No tasks found</h3>
              <p className="text-white/60 mb-6">
                {searchTerm || filterStatus !== 'all' || filterPriority !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first task to get started with vacation planning'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && filterPriority === 'all' && (
                <Button
                  icon={Plus}
                  onClick={() => setIsCreateModalOpen(true)}
                  glow
                >
                  Create Task
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Task">
        <form onSubmit={handleCreateSubmit} className="space-y-6">
          <Input
            label="Task Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
            required
            placeholder="Enter task title"
          />
          
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Description</label>
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="glass-input block w-full rounded-xl px-4 py-3 text-sm placeholder-white/60 focus:ring-2 focus:ring-white/30 focus:outline-none resize-none"
              placeholder="Describe the task..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value as any }))}
                className="glass-select w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <Input
              type="date"
              label="Due Date (Optional)"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>
          
          <Input
            label="Assigned To (Optional)"
            value={taskForm.assignedTo}
            onChange={(e) => setTaskForm(prev => ({ ...prev, assignedTo: e.target.value }))}
            placeholder="Enter assignee name or email"
          />
          
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" icon={Plus} glow className="flex-1" disabled={isLoading}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Task Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Task">
        <form onSubmit={handleEditSubmit} className="space-y-6">
          <Input
            label="Task Title"
            value={taskForm.title}
            onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
            required
            placeholder="Enter task title"
          />
          
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Description</label>
            <textarea
              value={taskForm.description}
              onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="glass-input block w-full rounded-xl px-4 py-3 text-sm placeholder-white/60 focus:ring-2 focus:ring-white/30 focus:outline-none resize-none"
              placeholder="Describe the task..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value as any }))}
                className="glass-select w-full rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-white/30"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <Input
              type="date"
              label="Due Date (Optional)"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>
          
          <Input
            label="Assigned To (Optional)"
            value={taskForm.assignedTo}
            onChange={(e) => setTaskForm(prev => ({ ...prev, assignedTo: e.target.value }))}
            placeholder="Enter assignee name or email"
          />
          
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsEditModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" icon={Edit} glow className="flex-1" disabled={isLoading}>
              Update Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};