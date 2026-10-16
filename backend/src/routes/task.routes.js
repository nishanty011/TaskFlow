const express = require('express');
const router = express.Router();

const taskController = require('../controllers/task.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const validate = require('../middleware/validate');
const {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
  updateChecklistSchema,
  addCommentSchema
} = require('../validations/task.validation');

// Saare task routes protected hain
router.use(protect);

// Dashboard stats - GET /api/tasks/stats (yahan pehle rakho warna ':id' se match ho jaata)
router.get('/stats', taskController.getTaskStats);

// Tasks list - role ke hisaab se filter hoti hai
router.get('/', taskController.getTasks);

// Naya task create karo - sirf manager/superadmin
router.post('/', authorize('manager', 'superadmin'), validate(createTaskSchema), taskController.createTask);

// Specific task detail
router.get('/:id', taskController.getTaskById);

// Task details update karo - sirf manager/superadmin
router.patch('/:id', authorize('manager', 'superadmin'), validate(updateTaskSchema), taskController.updateTask);

// Task archive karo - sirf manager/superadmin
router.delete('/:id', authorize('manager', 'superadmin'), taskController.archiveTask);

// Employee apna task status update kare (in_progress / submitted)
router.patch('/:id/status', authorize('employee'), validate(updateStatusSchema), taskController.updateTaskStatus);

// Employee checklist item toggle kare
router.patch('/:id/checklist', authorize('employee'), validate(updateChecklistSchema), taskController.updateChecklist);

// Manager task review kare (approve / request_changes)
router.patch('/:id/review', authorize('manager', 'superadmin'), taskController.reviewTask);

// Comment add karo - manager aur employee dono
router.post('/:id/comments', validate(addCommentSchema), taskController.addComment);

module.exports = router;
