const express = require('express');
const router = express.Router();

const feedbackController = require('../controllers/feedback.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const validate = require('../middleware/validate');
const { createFeedbackSchema } = require('../validations/submission.validation');

router.use(protect);

router.get('/', feedbackController.getFeedbacksByTask);
router.get('/:id', feedbackController.getFeedbackById);
router.post(
  '/',
  authorize('manager', 'superadmin'),
  validate(createFeedbackSchema),
  feedbackController.createFeedback
);

module.exports = router;
