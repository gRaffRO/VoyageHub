export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  currency: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    reminders: boolean;
  };
  theme: 'light' | 'dark' | 'system';
}

export interface Vacation {
  id: string;
  userId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'confirmed' | 'active' | 'completed';
  destinations: Destination[];
  budget: Budget;
  collaborators: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  city: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  accommodation?: Accommodation;
  activities: Activity[];
  startDate: string;
  endDate: string;
}

export interface Accommodation {
  id: string;
  name: string;
  type: 'hotel' | 'airbnb' | 'resort' | 'hostel' | 'other';
  address: string;
  checkIn: string;
  checkOut: string;
  cost: number;
  currency: string;
  confirmationNumber?: string;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: number;
  cost: number;
  currency: string;
  category: 'food' | 'entertainment' | 'transport' | 'shopping' | 'sightseeing' | 'other';
  location?: string;
  bookingRequired: boolean;
}

export interface Task {
  id: string;
  vacationId: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  dueDate?: string;
  completedAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  vacationId: string;
  totalBudget: number;
  currency: string;
  categories: BudgetCategory[];
  expenses: Expense[];
  createdAt: string;
  updatedAt: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  color: string;
}

export interface Expense {
  id: string;
  budgetId: string;
  categoryId: string;
  title: string;
  amount: number;
  currency: string;
  date: string;
  receipt?: string;
  description?: string;
  createdAt: string;
}

export interface Document {
  id: string;
  vacationId: string;
  title: string;
  type: 'passport' | 'visa' | 'ticket' | 'insurance' | 'other';
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  expirationDate?: string;
  sharedWith: string[];
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'reminder' | 'collaboration' | 'budget' | 'document' | 'system';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean | null; // null = loading, false = not authenticated, true = authenticated
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface VacationState {
  vacations: Vacation[];
  currentVacation: Vacation | null;
  isLoading: boolean;
  fetchVacations: () => Promise<void>;
  createVacation: (data: Partial<Vacation>) => Promise<void>;
  updateVacation: (id: string, data: Partial<Vacation>) => Promise<void>;
  deleteVacation: (id: string) => Promise<void>;
  setCurrentVacation: (vacation: Vacation | null) => void;
}

export interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  fetchTasks: (vacationId: string) => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<void>;
  updateTask: (id: string, data: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  reorderTasks: (tasks: Task[]) => void;
  handleRealTimeUpdate: (task: Task) => void;
}