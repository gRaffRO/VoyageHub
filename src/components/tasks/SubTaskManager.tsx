import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Plus, CheckSquare, Clock, ArrowRight, Trash2, Edit } from 'lucide-react';
import { gsap } from 'gsap';

interface SubTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: string;
  estimatedHours?: number;
  dependencies: string[]; // IDs of other subtasks this depends on
  createdAt: string;
}

interface SubTaskManagerProps {
  parentTaskId: string;
  subTasks: SubTask[];
  onSubTaskCreate: (subTask: Partial<SubTask>) => void;
  onSubTaskUpdate: (id: string, subTask: Partial<SubTask>) => void;
  onSubTaskDelete: (id: string) => void;
  onDependencyAdd: (subTaskId: string, dependsOnId: string) => void;
  onDependencyRemove: (subTaskId: string, dependsOnId: string) => void;
}

export const SubTaskManager: React.FC<SubTaskManagerProps> = ({
  parentTaskId,
  subTasks,
  onSubTaskCreate,
  onSubTaskUpdate,
  onSubTaskDelete,
  onDependencyAdd,
  onDependencyRemove,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubTask, setEditingSubTask] = useState<SubTask | null>(null);
  const [subTaskForm, setSubTaskForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    estimatedHours: 1,
    dependencies: [] as string[],
  });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll('.subtask-item');
      gsap.fromTo(elements,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out" }
      );
    }
  }, [subTasks]);

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

  const canStartSubTask = (subTask: SubTask) => {
    return subTask.dependencies.every(depId => {
      const dependency = subTasks.find(st => st.id === depId);
      return dependency?.status === 'completed';
    });
  };

  const getBlockedByTasks = (subTask: SubTask) => {
    return subTask.dependencies
      .map(depId => subTasks.find(st => st.id === depId))
      .filter(dep => dep && dep.status !== 'completed');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSubTask) {
      onSubTaskUpdate(editingSubTask.id, subTaskForm);
    } else {
      onSubTaskCreate({
        ...subTaskForm,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setSubTaskForm({
      title: '',
      description: '',
      dueDate: '',
      estimatedHours: 1,
      dependencies: [],
    });
    setEditingSubTask(null);
    setIsModalOpen(false);
  };

  const handleEdit = (subTask: SubTask) => {
    setEditingSubTask(subTask);
    setSubTaskForm({
      title: subTask.title,
      description: subTask.description || '',
      dueDate: subTask.dueDate || '',
      estimatedHours: subTask.estimatedHours || 1,
      dependencies: subTask.dependencies,
    });
    setIsModalOpen(true);
  };

  const toggleSubTaskStatus = (subTaskId: string, currentStatus: string) => {
    let newStatus: string;
    
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
    
    onSubTaskUpdate(subTaskId, { status: newStatus });
  };

  const handleDependencyToggle = (subTaskId: string, dependsOnId: string) => {
    const subTask = subTasks.find(st => st.id === subTaskId);
    if (!subTask) return;

    if (subTask.dependencies.includes(dependsOnId)) {
      onDependencyRemove(subTaskId, dependsOnId);
    } else {
      onDependencyAdd(subTaskId, dependsOnId);
    }
  };

  const completedCount = subTasks.filter(st => st.status === 'completed').length;
  const totalHours = subTasks.reduce((sum, st) => sum + (st.estimatedHours || 0), 0);

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-white font-medium">Sub-tasks</h4>
          <p className="text-sm text-white/60">
            {completedCount}/{subTasks.length} completed • {totalHours}h estimated
          </p>
        </div>
        <Button variant="glass" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
          Add Sub-task
        </Button>
      </div>

      {subTasks.length > 0 ? (
        <div className="space-y-3">
          {subTasks.map((subTask) => {
            const canStart = canStartSubTask(subTask);
            const blockedBy = getBlockedByTasks(subTask);
            
            return (
              <div key={subTask.id} className="subtask-item glass-card p-4 rounded-xl group">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <button
                      onClick={() => toggleSubTaskStatus(subTask.id, subTask.status)}
                      disabled={!canStart && subTask.status === 'pending'}
                      className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                        subTask.status === 'completed' 
                          ? 'bg-green-500 border-green-500' 
                          : subTask.status === 'in-progress'
                          ? 'bg-blue-500 border-blue-500'
                          : canStart
                          ? 'border-white/30 hover:border-white/50'
                          : 'border-red-400/50 cursor-not-allowed opacity-50'
                      }`}
                    >
                      {subTask.status === 'completed' && (
                        <CheckSquare className="h-3 w-3 text-white" />
                      )}
                      {subTask.status === 'in-progress' && (
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <h5 className={`font-medium text-white ${
                          subTask.status === 'completed' ? 'line-through opacity-60' : ''
                        }`}>
                          {subTask.title}
                        </h5>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(subTask.status)}`}>
                          {subTask.status === 'in-progress' ? 'In Progress' : 
                           subTask.status.charAt(0).toUpperCase() + subTask.status.slice(1)}
                        </span>
                      </div>
                      
                      {subTask.description && (
                        <p className="text-white/60 text-sm mb-2">{subTask.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-white/50">
                        {subTask.estimatedHours && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{subTask.estimatedHours}h</span>
                          </div>
                        )}
                        
                        {subTask.dueDate && (
                          <span>Due {new Date(subTask.dueDate).toLocaleDateString()}</span>
                        )}
                        
                        {subTask.dependencies.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <ArrowRight className="h-3 w-3" />
                            <span>Depends on {subTask.dependencies.length} task{subTask.dependencies.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                      
                      {blockedBy.length > 0 && (
                        <div className="mt-2 p-2 bg-red-500/10 border border-red-400/30 rounded-lg">
                          <p className="text-xs text-red-300">
                            Blocked by: {blockedBy.map(task => task?.title).join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      icon={Edit}
                      onClick={() => handleEdit(subTask)}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      icon={Trash2}
                      onClick={() => onSubTaskDelete(subTask.id)}
                      className="text-red-400 hover:text-red-300"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 glass-card rounded-xl">
          <CheckSquare className="h-12 w-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/60">No sub-tasks yet</p>
          <p className="text-sm text-white/40 mt-2">Break this task into smaller steps</p>
        </div>
      )}

      {/* Sub-task Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={resetForm} 
        title={editingSubTask ? 'Edit Sub-task' : 'Add Sub-task'}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Sub-task Title"
            value={subTaskForm.title}
            onChange={(e) => setSubTaskForm(prev => ({ ...prev, title: e.target.value }))}
            required
            placeholder="Enter sub-task title"
          />
          
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">Description</label>
            <textarea
              value={subTaskForm.description}
              onChange={(e) => setSubTaskForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="glass-input block w-full rounded-xl px-4 py-3 text-sm placeholder-white/60 focus:ring-2 focus:ring-white/30 focus:outline-none resize-none"
              placeholder="Describe the sub-task..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Due Date (Optional)"
              value={subTaskForm.dueDate}
              onChange={(e) => setSubTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
            />
            <Input
              type="number"
              label="Estimated Hours"
              value={subTaskForm.estimatedHours}
              onChange={(e) => setSubTaskForm(prev => ({ ...prev, estimatedHours: Number(e.target.value) }))}
              min="0.5"
              step="0.5"
            />
          </div>
          
          {subTasks.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">Dependencies</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {subTasks
                  .filter(st => !editingSubTask || st.id !== editingSubTask.id)
                  .map((subTask) => (
                    <label key={subTask.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={subTaskForm.dependencies.includes(subTask.id)}
                        onChange={() => {
                          setSubTaskForm(prev => ({
                            ...prev,
                            dependencies: prev.dependencies.includes(subTask.id)
                              ? prev.dependencies.filter(id => id !== subTask.id)
                              : [...prev.dependencies, subTask.id]
                          }));
                        }}
                        className="rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-white text-sm">{subTask.title}</span>
                    </label>
                  ))}
              </div>
            </div>
          )}
          
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="ghost" onClick={resetForm} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" icon={Plus} glow className="flex-1">
              {editingSubTask ? 'Update Sub-task' : 'Add Sub-task'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};