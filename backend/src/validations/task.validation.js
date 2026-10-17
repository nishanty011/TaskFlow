const { z } = require('zod');

const attachmentSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  name: z.string().min(1),
  size: z.number().optional().default(0),
  mime: z.string().optional().default('')
});

const checklistItemSchema = z.object({
  title: z.string().min(1, 'Checklist item title is required').trim(),
  weight: z.number().min(1).optional().default(1),
  done: z.boolean().optional().default(false)
});

// Task creation validation
const createTaskSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Task title is required' }).min(3, 'Title must be at least 3 characters').trim(),
    description: z.string().optional().default(''),
    assignedTo: z.string({ required_error: 'Employee ID is required (assignedTo)' }),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
    dueDate: z.string({ required_error: 'Due date is required' }).refine(val => !isNaN(Date.parse(val)), 'Please enter a valid date'),
    startDate: z.string().optional(),
    estimatedHours: z.number().min(0).optional().default(0),
    tags: z.array(z.string()).optional().default([]),
    attachments: z.array(attachmentSchema).optional().default([]),
    checklist: z.array(checklistItemSchema).optional().default([])
  })
});

// Task update validation
const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3).trim().optional(),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    dueDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Please enter a valid date').optional(),
    startDate: z.string().optional(),
    estimatedHours: z.number().min(0).optional(),
    tags: z.array(z.string()).optional(),
    attachments: z.array(attachmentSchema).optional()
  })
});

// Employee task status update validation
const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['in_progress', 'submitted'], {
      required_error: 'A valid status is required: in_progress or submitted'
    })
  })
});

// Checklist item update validation
const updateChecklistSchema = z.object({
  body: z.object({
    itemId: z.string({ required_error: 'Checklist item ID is required' }),
    done: z.boolean({ required_error: 'The done field (true/false) is required' })
  })
});

// Comment validation
const addCommentSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Comment cannot be empty').trim().optional(),
    content: z.string().min(1, 'Comment cannot be empty').trim().optional(),
    mentions: z.array(z.string()).optional().default([])
  }).refine((data) => Boolean(data.message || data.content), {
    message: 'Comment message is required'
  })
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
  updateChecklistSchema,
  addCommentSchema
};
