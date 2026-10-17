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

router.use(protect);

// Stats must be registered before parameterized ':id' route
router.get('/stats', taskController.getTaskStats);
router.get('/', taskController.getTasks);
router.post('/', authorize('manager', 'superadmin'), validate(createTaskSchema), taskController.createTask);
router.get('/:id', taskController.getTaskById);
router.get('/:id/timeline', taskController.getTaskTimeline);
router.patch('/:id', authorize('manager', 'superadmin'), validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', authorize('manager', 'superadmin'), taskController.archiveTask);
router.patch('/:id/status', authorize('employee'), validate(updateStatusSchema), taskController.updateTaskStatus);
router.patch('/:id/checklist', authorize('employee'), validate(updateChecklistSchema), taskController.updateChecklist);
router.patch('/:id/review', authorize('manager', 'superadmin'), taskController.reviewTask);
router.post('/:id/comments', validate(addCommentSchema), taskController.addComment);

module.exports = router;
