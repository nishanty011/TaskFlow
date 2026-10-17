const { z } = require('zod');

// Submission creation validation
const createSubmissionSchema = z.object({
  body: z.object({
    taskId: z.string({ required_error: 'Task ID is required' }),
    note: z.string().optional().default(''),
    progressClaimed: z.union([z.string(), z.number()]).optional().transform((val) => {
      if (val === undefined || val === null || val === '') return 0;
      const parsed = Number(val);
      return isNaN(parsed) ? 0 : parsed;
    }),
    files: z.array(
      z.object({
        url: z.string().min(1, 'File URL is required'),
        name: z.string().min(1, 'File name is required'),
        size: z.number().optional().default(0),
        mime: z.string().optional().default('')
      })
    ).optional().default([])
  })
});

// Manager submission review validation
const reviewSubmissionSchema = z.object({
  body: z.object({
    status: z.enum(['approved', 'changes_requested'], {
      required_error: "Status must be 'approved' or 'changes_requested'"
    }),
    feedback: z.string({ required_error: 'Feedback message is required' }).min(3, 'Feedback must be at least 3 characters').trim(),
    rating: z.union([z.string(), z.number()]).optional().transform((val) => {
      if (val === undefined || val === null || val === '') return null;
      const parsed = Number(val);
      return isNaN(parsed) ? null : parsed;
    })
  })
});

// Direct feedback creation validation
const createFeedbackSchema = z.object({
  body: z.object({
    taskId: z.string({ required_error: 'Task ID is required' }),
    submissionId: z.string().optional(),
    type: z.enum(['approval', 'change_request', 'general']).optional().default('general'),
    message: z.string({ required_error: 'Feedback message is required' }).min(2, 'Please enter a message').trim(),
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
