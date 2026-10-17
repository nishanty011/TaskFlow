const { z } = require('zod');

// Department create/update validation
const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Department name is required' }).min(2, 'Name must be at least 2 characters').trim(),
    code: z.string({ required_error: 'Department code is required' }).min(2).max(10, 'Code must be at most 10 characters').trim(),
    description: z.string().optional().default('')
  })
});

const updateDepartmentSchema = z.object({
  body: z.object({
    name: z.string().min(2).trim().optional(),
    code: z.string().min(2).max(10).trim().optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional()
  })
});

// Employee approval/rejection validation
const approveEmployeeSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Employee ID is required' })
  })
});

const rejectEmployeeSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Employee ID is required' })
  }),
  body: z.object({
    reason: z.string({ required_error: 'Rejection reason is required' }).min(5, 'Please provide a detailed rejection reason')
  })
});

// User profile update validation
const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).trim().optional(),
    designation: z.string().trim().optional(),
    phone: z.string().trim().optional(),
    skills: z.array(z.string()).optional()
  })
});

// Change password validation
const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string({ required_error: 'Current password is required' }).min(1, 'Please enter your current password'),
    newPassword: z.string({ required_error: 'New password is required' }).min(6, 'Password must be at least 6 characters')
  })
});

module.exports = {
  createDepartmentSchema,
  updateDepartmentSchema,
  approveEmployeeSchema,
  rejectEmployeeSchema,
  updateProfileSchema,
  changePasswordSchema
};
