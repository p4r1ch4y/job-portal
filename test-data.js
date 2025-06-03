//  script to populate the database with sample data
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// sample users
const users = [
  {
    name: 'John Candidate',
    email: 'john@candidate.com',
    password: 'password123',
    role: 'candidate'
  },
  {
    name: 'Jane Candidate',
    email: 'jane@candidate.com',
    password: 'password123',
    role: 'candidate'
  },
  {
    name: 'Tech Corp',
    email: 'hr@techcorp.com',
    password: 'password123',
    role: 'employer',
    companyName: 'Tech Corp'
  },
  {
    name: 'StartupXYZ',
    email: 'jobs@startupxyz.com',
    password: 'password123',
    role: 'employer',
    companyName: 'StartupXYZ'
  }
];

// sample jobs
const jobs = [
  {
    title: 'Senior Frontend Developer',
    description: 'We are looking for an experienced frontend developer to join our team.',
    location: 'Dholakpur, IN',
    requirements: ['React', 'JavaScript', 'CSS', 'HTML'],
    skills: ['react', 'javascript', 'css', 'html'],
    salaryMin: 80000,
    salaryMax: 120000,
    jobType: 'Full-time',
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  },
  {
    title: 'Backend Developer',
    description: 'Join our backend team to build scalable APIs and services.',
    location: 'Furfuri Nagar, IN',
    requirements: ['Node.js', 'MongoDB', 'Express', 'REST APIs'],
    skills: ['nodejs', 'mongodb', 'express', 'api'],
    salaryMin: 75000,
    salaryMax: 110000,
    jobType: 'Full-time',
    applicationDeadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Full Stack Developer',
    description: 'Work on both frontend and backend technologies in a fast-paced startup environment.',
    location: 'Pehelwanpur, In',
    requirements: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
    skills: ['react', 'nodejs', 'mongodb', 'javascript'],
    salaryMin: 70000,
    salaryMax: 100000,
    jobType: 'Full-time',
    applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
  }
];

async function createTestData() {
  try {
    console.log('Creating test users...');
    
    // Register users
    const registeredUsers = [];
    for (const user of users) {
      try {
        const response = await axios.post(`${API_BASE}/auth/register`, user);
        registeredUsers.push(response.data);
        console.log(`✓ Created user: ${user.name} (${user.role})`);
      } catch (error) {
        console.log(`✗ Failed to create user ${user.name}:`, error.response?.data?.message || error.message);
      }
    }

    // Create jobs (only for employers)
    console.log('\nCreating test jobs...');
    const employers = registeredUsers.filter(user => user.role === 'employer');
    
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      const employer = employers[i % employers.length]; // Rotate between employers
      
      if (employer) {
        try {
          const response = await axios.post(`${API_BASE}/jobs`, job, {
            headers: {
              'Authorization': `Bearer ${employer.token}`
            }
          });
          console.log(`✓ Created job: ${job.title}`);
        } catch (error) {
          console.log(`✗ Failed to create job ${job.title}:`, error.response?.data?.message || error.message);
        }
      }
    }

    console.log('\n✅ Test data creation completed!');
    console.log('\nYou can now test the application with these credentials:');
    console.log('Candidates:');
    console.log('- john@candidate.com / password123');
    console.log('- jane@candidate.com / password123');
    console.log('Employers:');
    console.log('- hr@techcorp.com / password123');
    console.log('- jobs@startupxyz.com / password123');

  } catch (error) {
    console.error('Error creating test data:', error.message);
  }
}

createTestData();
