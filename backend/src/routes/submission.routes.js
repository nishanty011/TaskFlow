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

// Saare submission routes protected hain
router.use(protect);

// 1. Get submissions by task - GET /api/submissions?taskId=...
router.get('/', submissionController.getTaskSubmissions);

// 1.5 Pending submissions list for manager/superadmin - GET /api/submissions/pending
router.get('/pending', authorize('manager', 'superadmin'), submissionController.getPendingSubmissions);

// 1.8 Employee's own submissions list - GET /api/submissions/my
router.get('/my', authorize('employee'), submissionController.getMySubmissions);

// 2. Specific submission detail - GET /api/submissions/:id
router.get('/:id', submissionController.getSubmissionById);

// 3. Employee submission upload kare - POST /api/submissions (supports up to 5 files)
router.post(
  '/',
  authorize('employee'),
  upload.array('files', 5),
  validate(createSubmissionSchema),
  submissionController.createSubmission
);

// 4. Manager submission review kare (approve/changes_requested) - PATCH /api/submissions/:id/review
router.patch(
  '/:id/review',
  authorize('manager', 'superadmin'),
  validate(reviewSubmissionSchema),
  submissionController.reviewSubmission
);

module.exports = router;
