const { z } = require('zod');

// Department create/update validation
const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Department naam zaroori hai' }).min(2, 'Naam kam se kam 2 characters ka hona chahiye').trim(),
    code: z.string({ required_error: 'Department code zaroori hai' }).min(2).max(10, 'Code max 10 characters ka hona chahiye').trim(),
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
    id: z.string({ required_error: 'Employee ID zaroori hai' })
  })
});

const rejectEmployeeSchema = z.object({
  params: z.object({
    id: z.string({ required_error: 'Employee ID zaroori hai' })
  }),
  body: z.object({
    reason: z.string({ required_error: 'Rejection reason zaroori hai' }).min(5, 'Kripya rejection reason likhein')
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
    currentPassword: z.string({ required_error: 'Current password zaroori hai' }).min(1, 'Current password enter karein'),
    newPassword: z.string({ required_error: 'Naya password zaroori hai' }).min(6, 'Password kam se kam 6 characters ka hona chahiye')
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
