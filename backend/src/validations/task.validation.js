const { z } = require('zod');

const attachmentSchema = z.object({
  url: z.string().url('Valid URL hona chahiye'),
  name: z.string().min(1),
  size: z.number().optional().default(0),
  mime: z.string().optional().default('')
});

const checklistItemSchema = z.object({
  title: z.string().min(1, 'Checklist item title zaroori hai').trim(),
  weight: z.number().min(1).optional().default(1),
  done: z.boolean().optional().default(false)
});

// Task create karne ki validation
const createTaskSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Task title zaroori hai' }).min(3, 'Title kam se kam 3 characters ka hona chahiye').trim(),
    description: z.string().optional().default(''),
    assignedTo: z.string({ required_error: 'Employee ID zaroori hai (assignedTo)' }),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
    dueDate: z.string({ required_error: 'Due date zaroori hai' }).refine(val => !isNaN(Date.parse(val)), 'Valid date enter karein'),
    startDate: z.string().optional(),
    estimatedHours: z.number().min(0).optional().default(0),
    tags: z.array(z.string()).optional().default([]),
    attachments: z.array(attachmentSchema).optional().default([]),
    checklist: z.array(checklistItemSchema).optional().default([])
  })
});

// Task update karne ki validation
const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3).trim().optional(),
    description: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    dueDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Valid date enter karein').optional(),
    startDate: z.string().optional(),
    estimatedHours: z.number().min(0).optional(),
    tags: z.array(z.string()).optional(),
    attachments: z.array(attachmentSchema).optional()
  })
});

// Employee apna task status update kare
const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['in_progress', 'submitted'], {
      required_error: 'Valid status zaroori hai: in_progress ya submitted'
    })
  })
});

// Checklist item update karne ki validation
const updateChecklistSchema = z.object({
  body: z.object({
    itemId: z.string({ required_error: 'Checklist item ID zaroori hai' }),
    done: z.boolean({ required_error: 'done field (true/false) zaroori hai' })
  })
});

// Comment add karne ki validation
const addCommentSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Comment empty nahi ho sakta').trim().optional(),
    content: z.string().min(1, 'Comment empty nahi ho sakta').trim().optional(),
    mentions: z.array(z.string()).optional().default([])
  }).refine((data) => Boolean(data.message || data.content), {
    message: 'Comment message zaroori hai'
  })
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  updateStatusSchema,
  updateChecklistSchema,
  addCommentSchema
};
