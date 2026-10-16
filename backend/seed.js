const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const {
  User,
  Department,
  Task,
  Submission,
  Feedback,
  Comment,
  Notification,
  ActivityLog
} = require('./src/models');

const {
  USER_ROLES,
  USER_STATUS,
  TASK_STATUS,
  TASK_PRIORITY,
  SUBMISSION_STATUS,
  FEEDBACK_TYPE,
  NOTIFICATION_TYPE,
  ACTIVITY_ACTIONS,
  ENTITY_TYPES
} = require('./src/utils/constants');

// Seed function - realistic demo data insert karne ke liye
const seedDatabase = async () => {
  try {
    // Production safety check - production database galti se drop na ho jaye
    if (process.env.NODE_ENV === 'production') {
      console.error('Safety check: Production environment mein seed run nahi ho sakta!');
      process.exit(1);
    }

    console.log('MongoDB se connect ho rahe hain...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected! Purana data clean kar rahe hain...');

    // Purana data drop karein taaki fresh dataset create ho sake
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Task.deleteMany({}),
      Submission.deleteMany({}),
      Feedback.deleteMany({}),
      Comment.deleteMany({}),
      Notification.deleteMany({}),
      ActivityLog.deleteMany({})
    ]);

    console.log('Purana data clean ho gaya. Ab naya data create kar rahe hain...\n');

    // 1. Super Admin create karein (system setup ke liye)
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'admin@taskflow.com',
      password: 'Password@123',
      role: USER_ROLES.SUPERADMIN,
      status: USER_STATUS.ACTIVE,
      emailVerified: true,
      designation: 'System Administrator',
      phone: '+91 9876543210'
    });

    console.log('1. Super Admin ban gaya: admin@taskflow.com (Password: Password@123)');

    // 2. Departments create karein
    const departmentData = [
      {
        name: 'Technology & Engineering',
        code: 'TECH',
        description: 'Software development, infrastructure, and technical operations'
      },
      {
        name: 'Marketing & Growth',
        code: 'MKT',
        description: 'Brand building, social media, performance marketing, and customer acquisition'
      },
      {
        name: 'Research & Innovation',
        code: 'RND',
        description: 'Product research, feasibility studies, and emerging technologies'
      },
      {
        name: 'Human Resources',
        code: 'HR',
        description: 'Talent recruitment, culture, employee relations, and policy management'
      }
    ];

    const departments = await Department.insertMany(departmentData);
    const [techDept, mktDept, rndDept, hrDept] = departments;
    console.log('2. 4 Departments create ho gaye: TECH, MKT, RND, HR');

    // 3. Managers create karein (1 manager per department)
    const managersData = [
      {
        name: 'Aarav Sharma',
        email: 'aarav.manager@taskflow.com',
        password: 'Password@123',
        role: USER_ROLES.MANAGER,
        department: techDept._id,
        status: USER_STATUS.ACTIVE,
        emailVerified: true,
        designation: 'VP of Technology',
        phone: '+91 9811122233',
        skills: ['Architecture', 'Node.js', 'System Design', 'Agile']
      },
      {
        name: 'Priya Kapoor',
        email: 'priya.manager@taskflow.com',
        password: 'Password@123',
        role: USER_ROLES.MANAGER,
        department: mktDept._id,
        status: USER_STATUS.ACTIVE,
        emailVerified: true,
        designation: 'Marketing Director',
        phone: '+91 9822233344',
        skills: ['SEO', 'Content Strategy', 'Brand Management', 'Analytics']
      },
      {
        name: 'Vikram Joshi',
        email: 'vikram.manager@taskflow.com',
        password: 'Password@123',
        role: USER_ROLES.MANAGER,
        department: rndDept._id,
        status: USER_STATUS.ACTIVE,
        emailVerified: true,
        designation: 'Head of Research',
        phone: '+91 9833344455',
        skills: ['Data Science', 'Machine Learning', 'Prototyping']
      },
      {
        name: 'Neha Verma',
        email: 'neha.manager@taskflow.com',
        password: 'Password@123',
        role: USER_ROLES.MANAGER,
        department: hrDept._id,
        status: USER_STATUS.ACTIVE,
        emailVerified: true,
        designation: 'HR Director',
        phone: '+91 9844455566',
        skills: ['Talent Acquisition', 'Employee Relations', 'HR Tech']
      }
    ];

    const managers = await User.create(managersData);
    const [techMgr, mktMgr, rndMgr, hrMgr] = managers;

    // Har department ke document mein uske manager ka reference update karein (1:1 relation)
    techDept.manager = techMgr._id;
    mktDept.manager = mktMgr._id;
    rndDept.manager = rndMgr._id;
    hrDept.manager = hrMgr._id;

    await Promise.all([
      techDept.save(),
      mktDept.save(),
      rndDept.save(),
      hrDept.save()
    ]);

    console.log('3. 4 Managers create ho gaye aur Departments ke saath link ho gaye');

    // 4. Employees create karein (Active + at least 1 Pending Approval per department)
    const employeesData = [
      // Tech Department Employees
      {
        name: 'Rohan Gupta',
        email: 'rohan.tech@taskflow.com',
        password: 'Password@123',
        role: USER_ROLES.EMPLOYEE,
        department: techDept._id,
        status: USER_STATUS.ACTIVE,
        emailVerified: true,
        approvedBy: techMgr._id,
        approvedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        designation: 'Senior Full Stack Developer',
        skills: ['React', 'Node.js', 'MongoDB', 'Docker']
      },
      {
        name: 'Simran Patel',
        email: 'simran.tech@taskflow.com',
        password: 'Password@123',
        role: USER_ROLES.EMPLOYEE,
        department: techDept._id,
        status: USER_STATUS.ACTIVE,
        emailVerified: true,
        approvedBy: techMgr._id,
        approvedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        designation: 'Frontend Engineer',
        skills: ['React', 'Tailwind CSS', 'TypeScript', 'Redux']
      },
      {
        name: 'Karan Mehra',
        email: 'karan.tech@taskflow.com',
        password: 'Password@123',
        role: USER_ROLES.EMPLOYEE,
        department: techDept._id,
        status: USER_STATUS.ACTIVE,
        emailVerified: true,
        approvedBy: techMgr._id,
        approvedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        designation: 'Backend Developer',
        skills: ['Node.js', 'Express', 'Redis', 'PostgreSQL']
      },
      // Pending Tech Employee (Approval test karne ke liye)
      {
        name: 'Aniket Roy',
        email: 'aniket.pending@taskflow.com',
        password: 'Password@123',
        role: USER_ROLES.EMPLOYEE,
        department: techDept._id,
        status: USER_STATUS.PENDING_APPROVAL,
        emailVerified: true,
        designation: 'Junior Developer Trainee',
        skills: ['JavaScript', 'HTML', 'CSS']
      },

      // Marketing Department Employees
      {
        name: 'Kavita Iyer',
        email: 'kavita.mkt@taskflow.com',
        password: 'Password@123',
        role: USER_ROLES.EMPLOYEE,
        department: mktDept._id,
        status: USER_STATUS.ACTIVE,
        emailVerified: true,
        approvedBy: mktMgr._id,
        approvedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        designation: 'SEO Specialist',
        skills: ['SEO', 'Ahrefs', 'Google Analytics', 'Content']
      },
      {
        name: 'Aditya Nair',
        email: 'aditya.mkt@taskflow.com',
        password: 'Password@123',
        role: USER_ROLES.EMPLOYEE,
        department: mktDept._id,
        status: USER_STATUS.ACTIVE,
        emailVerified: true,
        approvedBy: mktMgr._id,
        approvedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
        designation: 'Social Media Strategist',
        skills: ['Copywriting', 'Canva', 'Paid Ads']
      },
      {
        name: 'Sneha Sen',
        email: 'sneha.pending@taskflow.com',
        password: 'Password@123',
        role: USER_ROLES.EMPLOYEE,
        department: mktDept._id,
        status: USER_STATUS.PENDING_APPROVAL,
        emailVerified: true,
        designation: 'Marketing Intern',
        skills: ['Content Writing', 'Canva']
      },

      // Research Department Employees
      {
        name: 'Dr. Manish Das',
        email: 'manish.rnd@taskflow.com',
        password: 'Password@123',
        role: USER_ROLES.EMPLOYEE,
        department: rndDept._id,
        status: USER_STATUS.ACTIVE,
        emailVerified: true,
        approvedBy: rndMgr._id,
        approvedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
        designation: 'Lead Research Scientist',
        skills: ['Python', 'PyTorch', 'Data Analysis']
      },
      {
        name: 'Tanvi Shinde',
        email: 'tanvi.rnd@taskflow.com',
        password: 'Password@123',
        role: USER_ROLES.EMPLOYEE,
        department: rndDept._id,
        status: USER_STATUS.ACTIVE,
        emailVerified: true,
        approvedBy: rndMgr._id,
        approvedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        designation: 'Research Associate',
        skills: ['Statistics', 'R', 'Data Mining']
      },
      {
        name: 'Gaurav Kulkarni',
        email: 'gaurav.pending@taskflow.com',
        password: 'Password@123',
        role: USER_ROLES.EMPLOYEE,
        department: rndDept._id,
        status: USER_STATUS.PENDING_APPROVAL,
        emailVerified: true,
        designation: 'Graduate Research Assistant',
        skills: ['Python', 'Linear Algebra']
      },

      // HR Department Employees
      {
        name: 'Pooja Chawla',
        email: 'pooja.hr@taskflow.com',
        password: 'Password@123',
        role: USER_ROLES.EMPLOYEE,
        department: hrDept._id,
        status: USER_STATUS.ACTIVE,
        emailVerified: true,
        approvedBy: hrMgr._id,
        approvedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        designation: 'Senior Talent Partner',
        skills: ['Hiring', 'LinkedIn Recruiter', 'Onboarding']
      },
      {
        name: 'Rajesh Singhania',
        email: 'rajesh.pending@taskflow.com',
        password: 'Password@123',
        role: USER_ROLES.EMPLOYEE,
        department: hrDept._id,
        status: USER_STATUS.PENDING_APPROVAL,
        emailVerified: true,
        designation: 'HR Coordinator',
        skills: ['Documentation', 'Payroll Basics']
      }
    ];

    const employees = await User.create(employeesData);
    console.log(`4. ${employees.length} Employees create ho gaye (including pending approval cases)`);

    // Convenience references
    const [rohan, simran, karan] = employees;
    const [,, , , kavita, aditya] = employees;
    const [,, , , , , , manish, tanvi] = employees;
    const [,, , , , , , , , , pooja] = employees;

    // 5. Tasks create karein (20+ tasks with mixed lifecycle statuses)
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const tasksData = [
      // Tech Tasks
      {
        title: 'Build Authentication & JWT Flow',
        description: 'Implement JWT access & refresh tokens with secure httpOnly cookie storage.',
        department: techDept._id,
        assignedBy: techMgr._id,
        assignedTo: rohan._id,
        priority: TASK_PRIORITY.URGENT,
        status: TASK_STATUS.COMPLETED,
        dueDate: new Date(now - 2 * day),
        progress: 100,
        tags: ['backend', 'security', 'auth'],
        estimatedHours: 16,
        completedAt: new Date(now - 1 * day),
        checklist: [
          { title: 'Setup bcrypt password hashing', weight: 1, done: true },
          { title: 'Create JWT access & refresh helpers', weight: 2, done: true },
          { title: 'Implement refresh endpoint', weight: 1, done: true }
        ]
      },
      {
        title: 'Design Interactive Kanban Task Board',
        description: 'Create Kanban columns for assigned, in-progress, review, and completed states.',
        department: techDept._id,
        assignedBy: techMgr._id,
        assignedTo: simran._id,
        priority: TASK_PRIORITY.HIGH,
        status: TASK_STATUS.IN_PROGRESS,
        dueDate: new Date(now + 3 * day),
        progress: 50,
        tags: ['frontend', 'ui', 'kanban'],
        estimatedHours: 20,
        checklist: [
          { title: 'Build column containers', weight: 1, done: true },
          { title: 'Add drag and drop support', weight: 2, done: false },
          { title: 'Connect API state updates', weight: 1, done: false }
        ]
      },
      {
        title: 'Redis Caching for Department Analytics',
        description: 'Cache department counts and stats with 5 minute invalidation window.',
        department: techDept._id,
        assignedBy: techMgr._id,
        assignedTo: karan._id,
        priority: TASK_PRIORITY.MEDIUM,
        status: TASK_STATUS.SUBMITTED,
        dueDate: new Date(now + 2 * day),
        progress: 75,
        tags: ['backend', 'performance', 'redis'],
        estimatedHours: 12,
        checklist: [
          { title: 'Install Redis client', weight: 1, done: true },
          { title: 'Implement cache wrapper service', weight: 2, done: true },
          { title: 'Test cache hit/miss ratio', weight: 1, done: false }
        ]
      },
      {
        title: 'Fix Database Connection Pooling Timeout',
        description: 'Under heavy load, connection pool reaches max size and drops queries.',
        department: techDept._id,
        assignedBy: techMgr._id,
        assignedTo: rohan._id,
        priority: TASK_PRIORITY.URGENT,
        status: TASK_STATUS.UNDER_REVIEW,
        dueDate: new Date(now + 1 * day),
        progress: 80,
        tags: ['database', 'bugfix', 'critical'],
        estimatedHours: 8,
        checklist: [
          { title: 'Diagnose connection leak', weight: 1, done: true },
          { title: 'Increase pool limit & tune timeouts', weight: 1, done: true }
        ]
      },
      {
        title: 'Docker Compose Production Setup',
        description: 'Multi-stage builds for client and server with Nginx reverse proxy.',
        department: techDept._id,
        assignedBy: techMgr._id,
        assignedTo: karan._id,
        priority: TASK_PRIORITY.LOW,
        status: TASK_STATUS.CHANGES_REQUESTED,
        dueDate: new Date(now + 4 * day),
        progress: 40,
        tags: ['devops', 'docker'],
        estimatedHours: 14,
        checklist: [
          { title: 'Write frontend Dockerfile', weight: 1, done: true },
          { title: 'Write backend Dockerfile', weight: 1, done: true },
          { title: 'Configure docker-compose.yml', weight: 2, done: false }
        ]
      },
      // OVERDUE Task (Testing overdue logic)
      {
        title: 'Legacy API Migration to Node 20',
        description: 'Upgrade deprecated dependencies and runtime packages.',
        department: techDept._id,
        assignedBy: techMgr._id,
        assignedTo: rohan._id,
        priority: TASK_PRIORITY.HIGH,
        status: TASK_STATUS.IN_PROGRESS,
        dueDate: new Date(now - 3 * day), // Overdue!
        progress: 30,
        tags: ['maintenance', 'overdue'],
        estimatedHours: 10,
        checklist: [
          { title: 'Audit deprecated packages', weight: 1, done: true },
          { title: 'Update package versions', weight: 2, done: false }
        ]
      },
      {
        title: 'Setup ESLint and Prettier CI checks',
        description: 'Ensure consistent code formatting on every pull request.',
        department: techDept._id,
        assignedBy: techMgr._id,
        assignedTo: simran._id,
        priority: TASK_PRIORITY.LOW,
        status: TASK_STATUS.ASSIGNED,
        dueDate: new Date(now + 5 * day),
        progress: 0,
        tags: ['tooling', 'quality'],
        estimatedHours: 6,
        checklist: [
          { title: 'Configure ESLint configs', weight: 1, done: false },
          { title: 'Setup GitHub Actions step', weight: 1, done: false }
        ]
      },

      // Marketing Tasks
      {
        title: 'Q4 Product Launch Campaign Plan',
        description: 'Prepare target audience breakdown, channel strategy, and budget allocation.',
        department: mktDept._id,
        assignedBy: mktMgr._id,
        assignedTo: kavita._id,
        priority: TASK_PRIORITY.HIGH,
        status: TASK_STATUS.COMPLETED,
        dueDate: new Date(now - 1 * day),
        progress: 100,
        tags: ['strategy', 'launch'],
        estimatedHours: 24,
        completedAt: new Date(now - 1 * day),
        checklist: [
          { title: 'Market segmentation sheet', weight: 1, done: true },
          { title: 'Budget breakdown sheet', weight: 1, done: true }
        ]
      },
      {
        title: 'SEO Audit for Landing Page',
        description: 'Analyze Core Web Vitals, keyword densities, and meta tags.',
        department: mktDept._id,
        assignedBy: mktMgr._id,
        assignedTo: kavita._id,
        priority: TASK_PRIORITY.MEDIUM,
        status: TASK_STATUS.IN_PROGRESS,
        dueDate: new Date(now + 3 * day),
        progress: 50,
        tags: ['seo', 'analytics'],
        estimatedHours: 15,
        checklist: [
          { title: 'Lighthouse score assessment', weight: 1, done: true },
          { title: 'Keyword opportunity matrix', weight: 1, done: false }
        ]
      },
      {
        title: 'Social Media Content Calendar - November',
        description: 'Design 30 posts across LinkedIn, Twitter/X, and Instagram.',
        department: mktDept._id,
        assignedBy: mktMgr._id,
        assignedTo: aditya._id,
        priority: TASK_PRIORITY.MEDIUM,
        status: TASK_STATUS.SUBMITTED,
        dueDate: new Date(now + 2 * day),
        progress: 80,
        tags: ['social', 'content'],
        estimatedHours: 18,
        checklist: [
          { title: 'Copywriting drafts', weight: 1, done: true },
          { title: 'Visual creatives bundle', weight: 1, done: true }
        ]
      },
      {
        title: 'Customer Testimonial Video Production',
        description: 'Record and edit 3 customer success stories for the homepage.',
        department: mktDept._id,
        assignedBy: mktMgr._id,
        assignedTo: aditya._id,
        priority: TASK_PRIORITY.URGENT,
        status: TASK_STATUS.ASSIGNED,
        dueDate: new Date(now + 6 * day),
        progress: 0,
        tags: ['video', 'branding'],
        estimatedHours: 25,
        checklist: [
          { title: 'Customer interview recording', weight: 1, done: false },
          { title: 'Final cut editing', weight: 2, done: false }
        ]
      },
      // OVERDUE Marketing Task
      {
        title: 'Competitor Pricing Benchmark Report',
        description: 'Compile detailed tier-by-tier pricing from top 5 SaaS competitors.',
        department: mktDept._id,
        assignedBy: mktMgr._id,
        assignedTo: kavita._id,
        priority: TASK_PRIORITY.HIGH,
        status: TASK_STATUS.IN_PROGRESS,
        dueDate: new Date(now - 1 * day), // Overdue!
        progress: 40,
        tags: ['research', 'pricing', 'overdue'],
        estimatedHours: 10,
        checklist: [
          { title: 'Data scraping sheet', weight: 1, done: true },
          { title: 'Executive summary slide deck', weight: 1, done: false }
        ]
      },

      // Research & Innovation Tasks
      {
        title: 'LLM Fine-Tuning Feasibility Study',
        description: 'Evaluate cost vs accuracy tradeoffs of fine-tuning Llama-3 vs RAG architecture.',
        department: rndDept._id,
        assignedBy: rndMgr._id,
        assignedTo: manish._id,
        priority: TASK_PRIORITY.URGENT,
        status: TASK_STATUS.COMPLETED,
        dueDate: new Date(now - 4 * day),
        progress: 100,
        tags: ['ai', 'research', 'llm'],
        estimatedHours: 40,
        completedAt: new Date(now - 2 * day),
        checklist: [
          { title: 'Benchmark dataset curation', weight: 2, done: true },
          { title: 'Evaluation metrics analysis', weight: 2, done: true }
        ]
      },
      {
        title: 'Vector Database Benchmarking',
        description: 'Compare Pinecone, Qdrant, and Milvus for 1M embeddings search latency.',
        department: rndDept._id,
        assignedBy: rndMgr._id,
        assignedTo: tanvi._id,
        priority: TASK_PRIORITY.HIGH,
        status: TASK_STATUS.IN_PROGRESS,
        dueDate: new Date(now + 4 * day),
        progress: 60,
        tags: ['embeddings', 'database'],
        estimatedHours: 20,
        checklist: [
          { title: 'Ingest 1M test vectors', weight: 1, done: true },
          { title: 'Measure p99 query latency', weight: 1, done: true },
          { title: 'Cost estimation report', weight: 1, done: false }
        ]
      },
      {
        title: 'Smart Task Recommendation Algorithm',
        description: 'Prototype AI recommendation based on employee skill match and current workload.',
        department: rndDept._id,
        assignedBy: rndMgr._id,
        assignedTo: manish._id,
        priority: TASK_PRIORITY.MEDIUM,
        status: TASK_STATUS.SUBMITTED,
        dueDate: new Date(now + 3 * day),
        progress: 85,
        tags: ['ml', 'algorithm'],
        estimatedHours: 30,
        checklist: [
          { title: 'Feature engineering script', weight: 1, done: true },
          { title: 'Model training pipeline', weight: 2, done: true }
        ]
      },
      {
        title: 'Data Privacy Compliance in AI Pipeline',
        description: 'Ensure PII stripping before sending prompts to external APIs.',
        department: rndDept._id,
        assignedBy: rndMgr._id,
        assignedTo: tanvi._id,
        priority: TASK_PRIORITY.HIGH,
        status: TASK_STATUS.ASSIGNED,
        dueDate: new Date(now + 7 * day),
        progress: 0,
        tags: ['security', 'compliance'],
        estimatedHours: 16,
        checklist: [
          { title: 'Regex & NER PII detector', weight: 1, done: false },
          { title: 'Audit logging module', weight: 1, done: false }
        ]
      },

      // HR Tasks
      {
        title: 'Annual Performance Appraisal Framework',
        description: 'Update the rating rubrics, feedback forms, and appraisal timeline for 2026.',
        department: hrDept._id,
        assignedBy: hrMgr._id,
        assignedTo: pooja._id,
        priority: TASK_PRIORITY.HIGH,
        status: TASK_STATUS.COMPLETED,
        dueDate: new Date(now - 5 * day),
        progress: 100,
        tags: ['hr', 'policy'],
        estimatedHours: 20,
        completedAt: new Date(now - 3 * day),
        checklist: [
          { title: 'Draft revised rubrics', weight: 1, done: true },
          { title: 'Department head review', weight: 1, done: true }
        ]
      },
      {
        title: 'Campus Recruitment Drive Planning',
        description: 'Coordinate with top engineering institutes for 2026 graduate hiring.',
        department: hrDept._id,
        assignedBy: hrMgr._id,
        assignedTo: pooja._id,
        priority: TASK_PRIORITY.MEDIUM,
        status: TASK_STATUS.IN_PROGRESS,
        dueDate: new Date(now + 5 * day),
        progress: 40,
        tags: ['recruitment', 'campus'],
        estimatedHours: 15,
        checklist: [
          { title: 'Outreach emails to placement cells', weight: 1, done: true },
          { title: 'Online test syllabus finalization', weight: 1, done: false }
        ]
      },
      {
        title: 'Employee Wellness & Mental Health Workshop',
        description: 'Organize quarterly wellness seminar with guest speakers.',
        department: hrDept._id,
        assignedBy: hrMgr._id,
        assignedTo: pooja._id,
        priority: TASK_PRIORITY.LOW,
        status: TASK_STATUS.ASSIGNED,
        dueDate: new Date(now + 8 * day),
        progress: 0,
        tags: ['wellness', 'events'],
        estimatedHours: 10,
        checklist: [
          { title: 'Vendor shortlisted', weight: 1, done: false },
          { title: 'Calendar invite broadcast', weight: 1, done: false }
        ]
      },
      // OVERDUE HR Task
      {
        title: 'POSH Policy Annual Compliance Filing',
        description: 'File statutory internal complaints committee documentation.',
        department: hrDept._id,
        assignedBy: hrMgr._id,
        assignedTo: pooja._id,
        priority: TASK_PRIORITY.URGENT,
        status: TASK_STATUS.IN_PROGRESS,
        dueDate: new Date(now - 2 * day), // Overdue!
        progress: 50,
        tags: ['legal', 'statutory', 'overdue'],
        estimatedHours: 12,
        checklist: [
          { title: 'Gather committee meeting minutes', weight: 1, done: true },
          { title: 'Legal counsel sign-off', weight: 1, done: false }
        ]
      }
    ];

    const tasks = await Task.create(tasksData);
    console.log(`5. ${tasks.length} Realistic Tasks create ho gaye (including overdue & all lifecycle states)`);

    // 6. Submissions & Feedbacks create karein (sample completed/submitted tasks ke liye)
    const completedTechTask = tasks[0];
    const submittedTechTask = tasks[2];

    const sub1 = await Submission.create({
      task: completedTechTask._id,
      employee: rohan._id,
      version: 1,
      note: 'JWT authentication module is fully implemented with refresh tokens, secure cookies, and route guards.',
      files: [
        {
          url: 'https://example.com/files/jwt-architecture.pdf',
          name: 'jwt-architecture.pdf',
          size: 1048576,
          mime: 'application/pdf'
        }
      ],
      progressClaimed: 100,
      status: SUBMISSION_STATUS.APPROVED,
      reviewedBy: techMgr._id,
      reviewedAt: new Date(now - 1 * day)
    });

    await Feedback.create({
      task: completedTechTask._id,
      submission: sub1._id,
      author: techMgr._id,
      type: FEEDBACK_TYPE.APPROVAL,
      message: 'Great work! Clean implementation and thorough test coverage for token refresh edge cases.',
      rating: 5
    });

    const sub2 = await Submission.create({
      task: submittedTechTask._id,
      employee: karan._id,
      version: 1,
      note: 'Redis caching wrapper is ready. Department analytics response time improved from 240ms to 8ms.',
      files: [
        {
          url: 'https://example.com/files/redis-benchmark.pdf',
          name: 'redis-benchmark.pdf',
          size: 524288,
          mime: 'application/pdf'
        }
      ],
      progressClaimed: 75,
      status: SUBMISSION_STATUS.PENDING
    });

    console.log('6. Submissions aur Manager Feedback create ho gaye');

    // 7. Discussion Comments create karein
    await Comment.create([
      {
        task: completedTechTask._id,
        author: rohan._id,
        message: 'Sir, I have added the refresh token cookie logic with SameSite=Lax. Please review.'
      },
      {
        task: completedTechTask._id,
        author: techMgr._id,
        message: 'Looks solid! Approved.'
      },
      {
        task: submittedTechTask._id,
        author: karan._id,
        message: 'Uploaded the benchmark report comparing Redis cache hits vs MongoDB direct queries.'
      }
    ]);
    console.log('7. Task Discussion Comments create ho gaye');

    // 8. Notifications create karein
    await Notification.create([
      {
        user: rohan._id,
        type: NOTIFICATION_TYPE.TASK_APPROVED,
        title: 'Task Approved!',
        message: 'Aarav Sharma approved your task: Build Authentication & JWT Flow',
        link: `/tasks/${completedTechTask._id}`,
        isRead: true
      },
      {
        user: techMgr._id,
        type: NOTIFICATION_TYPE.TASK_SUBMITTED,
        title: 'New Submission for Review',
        message: 'Karan Mehra submitted work for: Redis Caching for Department Analytics',
        link: `/tasks/${submittedTechTask._id}`,
        isRead: false
      },
      {
        user: techMgr._id,
        type: NOTIFICATION_TYPE.EMPLOYEE_REGISTERED,
        title: 'Pending Employee Approval',
        message: 'Aniket Roy registered and is waiting for your department approval.',
        link: '/manager/pending-employees',
        isRead: false
      }
    ]);
    console.log('8. Notifications create ho gaye');

    // 9. Activity Logs create karein (Audit trail)
    await ActivityLog.create([
      {
        actor: superAdmin._id,
        action: ACTIVITY_ACTIONS.USER_REGISTERED,
        entityType: ENTITY_TYPES.USER,
        entityId: superAdmin._id,
        department: techDept._id,
        meta: { role: 'superadmin' }
      },
      {
        actor: techMgr._id,
        action: ACTIVITY_ACTIONS.TASK_APPROVED,
        entityType: ENTITY_TYPES.TASK,
        entityId: completedTechTask._id,
        department: techDept._id,
        meta: { rating: 5 }
      },
      {
        actor: karan._id,
        action: ACTIVITY_ACTIONS.TASK_SUBMITTED,
        entityType: ENTITY_TYPES.TASK,
        entityId: submittedTechTask._id,
        department: techDept._id,
        meta: { version: 1 }
      }
    ]);
    console.log('9. Activity Logs (Audit Trail) create ho gaye');

    console.log('\n=============================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY! ');
    console.log('=============================================');
    console.log('Demo Login Credentials:');
    console.log('---------------------------------------------');
    console.log('Super Admin: admin@taskflow.com | Password@123');
    console.log('Tech Manager: aarav.manager@taskflow.com | Password@123');
    console.log('Marketing Manager: priya.manager@taskflow.com | Password@123');
    console.log('R&D Manager: vikram.manager@taskflow.com | Password@123');
    console.log('HR Manager: neha.manager@taskflow.com | Password@123');
    console.log('Tech Employee: rohan.tech@taskflow.com | Password@123');
    console.log('Pending Tech Employee: aniket.pending@taskflow.com | Password@123');
    console.log('=============================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed run karte waqt error aaya:', error);
    process.exit(1);
  }
};

seedDatabase();
