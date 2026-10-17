const express = require('express');
const router = express.Router();

const submissionController = require('../controllers/submission.controller');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const {
  createSubmissionSchema,
  reviewSubmissionSchema
} = require('../validations/submission.validation');

router.use(protect);

router.get('/', submissionController.getTaskSubmissions);
router.get('/pending', authorize('manager', 'superadmin'), submissionController.getPendingSubmissions);
router.get('/my', authorize('employee'), submissionController.getMySubmissions);
router.get('/:id', submissionController.getSubmissionById);

router.post(
  '/',
  authorize('employee'),
  upload.array('files', 5),
  validate(createSubmissionSchema),
  submissionController.createSubmission
);

router.patch(
  '/:id/review',
  authorize('manager', 'superadmin'),
  validate(reviewSubmissionSchema),
  submissionController.reviewSubmission
);

module.exports = router;
