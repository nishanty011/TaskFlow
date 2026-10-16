const express = require('express');
const router = express.Router();

const feedbackController = require('../controllers/feedback.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const validate = require('../middleware/validate');
const { createFeedbackSchema } = require('../validations/submission.validation');

// Saare feedback routes protected hain
router.use(protect);

// 1. Get feedbacks by task - GET /api/feedbacks?taskId=...
router.get('/', feedbackController.getFeedbacksByTask);

// 2. Specific feedback detail - GET /api/feedbacks/:id
router.get('/:id', feedbackController.getFeedbackById);

// 3. Manager task ya submission par feedback create kare - POST /api/feedbacks
router.post(
  '/',
  authorize('manager', 'superadmin'),
  validate(createFeedbackSchema),
  feedbackController.createFeedback
);

module.exports = router;
