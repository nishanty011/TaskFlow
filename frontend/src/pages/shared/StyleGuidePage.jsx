import React, { useState } from 'react';
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Badge,
  Modal,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  EmptyState
} from '../../components/ui';
import {
  CheckCircle2,
  Clock,
  Search,
  Mail,
  Plus,
  Trash2,
  Moon,
  Sun,
  LayoutDashboard,
  Sparkles
} from 'lucide-react';

export const StyleGuidePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold shadow-glow-brand">
                TF
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                TaskFlow Design System
              </h1>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Phase C1: Setup and UI Component Style Guide Showcase
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
              leftIcon={darkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            >
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </Button>
            <Badge variant="brand" size="lg">
              v1.0.0 Ready
            </Badge>
          </div>
        </div>

        {/* Section 1: Buttons */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Buttons</h2>
          </div>
          <Card>
            <CardBody className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Variants</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="primary">Primary Action</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost Button</Button>
                  <Button variant="danger" leftIcon={<Trash2 className="w-4 h-4" />}>
                    Delete Task
                  </Button>
                  <Button variant="success" leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                    Approve Submission
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Sizes & States</p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="sm">Small Size</Button>
                  <Button size="md">Medium Default</Button>
                  <Button size="lg" leftIcon={<Plus className="w-5 h-5" />}>
                    Large with Icon
                  </Button>
                  <Button isLoading>Processing</Button>
                  <Button disabled>Disabled State</Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Section 2: Form Inputs */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Form Inputs</h2>
          </div>
          <Card>
            <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Standard Input"
                placeholder="Enter task title..."
                helperText="Keep titles concise and descriptive"
                required
              />
              <Input
                label="With Search Icon"
                placeholder="Search employees or tasks..."
                leftIcon={<Search className="w-4 h-4" />}
              />
              <Input
                label="Validation Error State"
                defaultValue="invalid.email@"
                error="Please enter a valid work email address"
                leftIcon={<Mail className="w-4 h-4" />}
              />
            </CardBody>
          </Card>
        </section>

        {/* Section 3: Status & Priority Badges */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Status & Priority Badges</h2>
          </div>
          <Card>
            <CardBody className="space-y-6">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Task Statuses (Defined in TaskFlow Plan)
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <Badge status="assigned" />
                  <Badge status="in_progress" />
                  <Badge status="submitted" />
                  <Badge status="under_review" />
                  <Badge status="changes_requested" />
                  <Badge status="completed" />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Task Priorities
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <Badge priority="low" />
                  <Badge priority="medium" />
                  <Badge priority="high" />
                  <Badge priority="urgent" />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  User Statuses
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <Badge userStatus="active" />
                  <Badge userStatus="pending_approval" />
                  <Badge userStatus="rejected" />
                  <Badge userStatus="suspended" />
                </div>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Section 4: Cards & Glassmorphism */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Glassmorphism Cards</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card hover>
              <CardHeader
                title="Active Task Card"
                subtitle="Due in 3 days"
                action={<Badge status="in_progress" size="sm" />}
              />
              <CardBody>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Build responsive dashboard widgets with TanStack Query and Socket.io real-time updates.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> 8 Estimated Hours
                  </span>
                  <span className="font-semibold text-brand-600">65% Progress</span>
                </div>
              </CardBody>
              <CardFooter className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Assigned to: Rohan G.</span>
                <Button size="sm" variant="ghost">View Details</Button>
              </CardFooter>
            </Card>

            <Card hover>
              <CardHeader
                title="Review Required"
                subtitle="Submitted v2"
                action={<Badge status="under_review" size="sm" />}
              />
              <CardBody>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  PDF deliverable submitted with 3 revision items completed and code documentation.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>2 Files Attached</span>
                  <Badge priority="high" size="sm" />
                </div>
              </CardBody>
              <CardFooter className="flex justify-end gap-2">
                <Button size="sm" variant="danger">Request Changes</Button>
                <Button size="sm" variant="success">Approve</Button>
              </CardFooter>
            </Card>

            <Card hover>
              <CardHeader
                title="Interactive Modal"
                subtitle="Click to test dialog"
              />
              <CardBody className="flex flex-col justify-between">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                  Test the accessible modal component with backdrop blur and keyboard navigation.
                </p>
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                  Open Demo Modal
                </Button>
              </CardBody>
            </Card>
          </div>
        </section>

        {/* Section 5: Responsive Data Table */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">5. Responsive Table</h2>
          </div>
          <Card>
            <CardHeader
              title="Department Task Directory"
              subtitle="Showing 3 sample tasks"
              action={<Button size="sm" variant="outline">Export CSV</Button>}
            />
            <Table>
              <TableHeader>
                <TableRow hover={false}>
                  <TableHead>Task Title</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold text-slate-900 dark:text-white">
                    Implement Auth Interceptors
                  </TableCell>
                  <TableCell>Aarav Sharma</TableCell>
                  <TableCell><Badge priority="high" size="sm" /></TableCell>
                  <TableCell><Badge status="in_progress" size="sm" /></TableCell>
                  <TableCell>
                    <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '60%' }} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost">Edit</Button>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-semibold text-slate-900 dark:text-white">
                    Design System Style Guide
                  </TableCell>
                  <TableCell>Priya Verma</TableCell>
                  <TableCell><Badge priority="medium" size="sm" /></TableCell>
                  <TableCell><Badge status="completed" size="sm" /></TableCell>
                  <TableCell>
                    <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost">View</Button>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-semibold text-slate-900 dark:text-white">
                    Marketing Campaign Collateral
                  </TableCell>
                  <TableCell>Aniket Roy</TableCell>
                  <TableCell><Badge priority="urgent" size="sm" /></TableCell>
                  <TableCell><Badge status="under_review" size="sm" /></TableCell>
                  <TableCell>
                    <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '85%' }} />
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost">Review</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </section>

        {/* Section 6: Skeletons & Empty States */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">6. Skeleton Loaders & Empty State</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Card Skeleton</p>
              <CardSkeleton />
            </div>
            <div className="space-y-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Empty State</p>
              <EmptyState
                icon={LayoutDashboard}
                title="No Pending Submissions"
                description="All submitted deliverables have been reviewed and approved by managers."
                actionLabel="Create New Task"
                onAction={() => alert('Action triggered')}
              />
            </div>
          </div>
        </section>
      </div>

      {/* Demo Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Sample Review Modal"
        subtitle="Verification dialog with backdrop blur"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Confirm & Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            This modal supports full keyboard accessibility (press Escape to close), auto body scroll-lock, and smooth glassmorphic styling.
          </p>
          <Input
            label="Feedback Notes"
            placeholder="Write constructive review feedback..."
            required
          />
        </div>
      </Modal>
    </div>
  );
};

export default StyleGuidePage;
