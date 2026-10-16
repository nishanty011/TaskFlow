const { z } = require('zod');

// Submission create karne ki validation
const createSubmissionSchema = z.object({
  body: z.object({
    taskId: z.string({ required_error: 'Task ID zaroori hai' }),
    note: z.string().optional().default(''),
    progressClaimed: z.union([z.string(), z.number()]).optional().transform((val) => {
      if (val === undefined || val === null || val === '') return 0;
      const parsed = Number(val);
      return isNaN(parsed) ? 0 : parsed;
    }),
    files: z.array(
      z.object({
        url: z.string().min(1, 'File URL zaroori hai'),
        name: z.string().min(1, 'File naam zaroori hai'),
        size: z.number().optional().default(0),
        mime: z.string().optional().default('')
      })
    ).optional().default([])
  })
});

// Manager submission review karne ki validation
const reviewSubmissionSchema = z.object({
  body: z.object({
    status: z.enum(['approved', 'changes_requested'], {
      required_error: "Status 'approved' ya 'changes_requested' hona chahiye"
    }),
    feedback: z.string({ required_error: 'Feedback message zaroori hai' }).min(3, 'Feedback kam se kam 3 characters ka hona chahiye').trim(),
    rating: z.union([z.string(), z.number()]).optional().transform((val) => {
      if (val === undefined || val === null || val === '') return null;
      const parsed = Number(val);
      return isNaN(parsed) ? null : parsed;
    })
  })
});

// Direct feedback create karne ki validation
const createFeedbackSchema = z.object({
  body: z.object({
    taskId: z.string({ required_error: 'Task ID zaroori hai' }),
    submissionId: z.string().optional(),
    type: z.enum(['approval', 'change_request', 'general']).optional().default('general'),
    message: z.string({ required_error: 'Feedback message zaroori hai' }).min(2, 'Message enter karein').trim(),
    rating: z.union([z.string(), z.number()]).optional().transform((val) => {
      if (val === undefined || val === null || val === '') return null;
      const parsed = Number(val);
      return isNaN(parsed) ? null : parsed;
    })
  })
});

module.exports = {
  createSubmissionSchema,
  reviewSubmissionSchema,
  createFeedbackSchema
};
