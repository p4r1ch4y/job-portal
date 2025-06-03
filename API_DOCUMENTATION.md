# 📚 Job Portal API Documentation

Base URL: `http://localhost:5000/api` (Development) | `https://your-domain.com/api` (Production)

## 🔐 Authentication

All protected routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 📝 API Endpoints

### 🔑 Authentication Routes (`/api/auth`)

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "candidate" // or "employer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "candidate"
    },
    "token": "jwt_token_here"
  }
}
```

#### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
```
*Requires Authentication*

---

### 💼 Job Routes (`/api/jobs`)

#### Get All Jobs
```http
GET /api/jobs
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `pageSize` (number): Items per page (default: 10)
- `search` (string): Search term
- `location` (string): Job location
- `jobType` (string): Job type filter
- `skills` (array): Required skills
- `sortBy` (string): Sort field (default: 'postedDate:desc')

**Response:**
```json
{
  "success": true,
  "data": {
    "jobs": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalJobs": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### Get Single Job
```http
GET /api/jobs/:id
```

#### Create Job (Employer Only)
```http
POST /api/jobs
```
*Requires Authentication & Employer Role*

**Request Body:**
```json
{
  "title": "Software Developer",
  "description": "Job description here...",
  "location": "New York, NY",
  "companyName": "Tech Corp",
  "salaryMin": 80000,
  "salaryMax": 120000,
  "jobType": "Full-time",
  "skills": ["JavaScript", "React", "Node.js"],
  "requirements": ["Bachelor's degree", "3+ years experience"],
  "benefits": ["Health insurance", "401k"],
  "applicationDeadline": "2024-12-31T23:59:59.000Z"
}
```

#### Update Job (Employer Only)
```http
PUT /api/jobs/:id
```
*Requires Authentication & Job Ownership*

#### Delete Job (Employer Only)
```http
DELETE /api/jobs/:id
```
*Requires Authentication & Job Ownership*

#### Get Employer's Jobs
```http
GET /api/jobs/employer/my-jobs
```
*Requires Authentication & Employer Role*

---

### 👤 Profile Routes (`/api/profiles`)

#### Get My Profile
```http
GET /api/profiles/me
```
*Requires Authentication*

#### Create/Update Profile
```http
POST /api/profiles
PUT /api/profiles
```
*Requires Authentication*

**Request Body (Candidate):**
```json
{
  "headline": "Full Stack Developer",
  "summary": "Experienced developer...",
  "skills": ["JavaScript", "React", "Node.js"],
  "experience": [
    {
      "title": "Software Developer",
      "company": "Tech Corp",
      "startDate": "2020-01-01",
      "endDate": "2023-12-31",
      "description": "Developed web applications..."
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Computer Science",
      "institution": "University Name",
      "graduationYear": 2020
    }
  ],
  "resumeUrl": "https://example.com/resume.pdf"
}
```

**Request Body (Employer):**
```json
{
  "companyName": "Tech Corp",
  "companyDescription": "Leading tech company...",
  "industry": "Technology",
  "companySize": "100-500",
  "website": "https://techcorp.com",
  "location": "New York, NY"
}
```

#### Get Public Profile
```http
GET /api/profiles/public/:userId
```

---

### 📋 Application Routes (`/api/applications`)

#### Apply for Job (Candidate Only)
```http
POST /api/applications
```
*Requires Authentication & Candidate Role*

**Request Body:**
```json
{
  "jobId": "job_id_here",
  "coverLetter": "I am interested in this position..."
}
```

#### Get My Applications (Candidate)
```http
GET /api/applications/my-applications
```
*Requires Authentication & Candidate Role*

#### Get Applications for Job (Employer)
```http
GET /api/applications/job/:jobId
```
*Requires Authentication & Job Ownership*

#### Update Application Status (Employer)
```http
PUT /api/applications/:id/status
```
*Requires Authentication & Employer Role*

**Request Body:**
```json
{
  "status": "shortlisted" // applied, viewed, shortlisted, interviewing, offered, rejected, withdrawn
}
```

#### Get Single Application
```http
GET /api/applications/:id
```
*Requires Authentication & Ownership*

---

### 📊 Analytics Routes (`/api/analytics`)

#### Get Job Postings Analytics (Employer)
```http
GET /api/analytics/job-postings
```
*Requires Authentication & Employer Role*

**Response:**
```json
{
  "success": true,
  "data": {
    "totalJobsPosted": 15,
    "totalApplications": 120,
    "totalViews": 1500,
    "responseRate": 75,
    "averageApplicationsPerJob": 8,
    "topPerformingJobs": [...],
    "applicationTrends": [...]
  }
}
```

#### Get Application Analytics (Candidate)
```http
GET /api/analytics/applications
```
*Requires Authentication & Candidate Role*

---

### 🌐 External Jobs Routes (`/api/external-jobs`)

#### Search External Jobs
```http
GET /api/external-jobs/search
```
*Requires Authentication*

**Query Parameters:**
- `query` (string): Search term
- `location` (string): Job location
- `employment_types` (string): Employment type
- `page` (number): Page number
- `remote_jobs_only` (boolean): Remote jobs only

#### Get Trending Jobs
```http
GET /api/external-jobs/trending
```
*Requires Authentication*

#### Sync External Jobs (Admin Only)
```http
POST /api/external-jobs/sync
```
*Requires Authentication & Admin Role*

#### Get Providers Status
```http
GET /api/external-jobs/providers/status
```
*Requires Authentication*

---

## 📝 Data Models

### User Model
```json
{
  "_id": "ObjectId",
  "name": "string",
  "email": "string (unique)",
  "password": "string (hashed)",
  "role": "candidate | employer | admin",
  "isActive": "boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Job Model
```json
{
  "_id": "ObjectId",
  "title": "string",
  "description": "string",
  "location": "string",
  "companyName": "string",
  "salaryMin": "number",
  "salaryMax": "number",
  "jobType": "string",
  "skills": ["string"],
  "requirements": ["string"],
  "benefits": ["string"],
  "postedBy": "ObjectId (User)",
  "postedDate": "Date",
  "applicationDeadline": "Date",
  "isActive": "boolean",
  "views": "number",
  "applicationsCount": "number",
  "isExternal": "boolean",
  "external_id": "string",
  "source": "string",
  "apply_link": "string"
}
```

### Application Model
```json
{
  "_id": "ObjectId",
  "jobId": "ObjectId (Job)",
  "candidateId": "ObjectId (User)",
  "coverLetter": "string",
  "status": "applied | viewed | shortlisted | interviewing | offered | rejected | withdrawn",
  "applicationDate": "Date",
  "profileSnapshot": "object",
  "jobSnapshot": "object"
}
```

### Profile Model
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId (User)",
  "userType": "candidate | employer",
  
  // Candidate fields
  "headline": "string",
  "summary": "string",
  "skills": ["string"],
  "experience": [
    {
      "title": "string",
      "company": "string",
      "startDate": "Date",
      "endDate": "Date",
      "description": "string"
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "graduationYear": "number"
    }
  ],
  "resumeUrl": "string",
  
  // Employer fields
  "companyName": "string",
  "companyDescription": "string",
  "industry": "string",
  "companySize": "string",
  "website": "string",
  "location": "string"
}
```

---

## ⚠️ Error Responses

### Standard Error Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error

---

## 🔧 Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **External Jobs**: 20 requests per hour per user

---

## 📱 Testing the API

### Using cURL
```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","role":"candidate"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get jobs (with token)
curl -X GET http://localhost:5000/api/jobs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman
1. Import the API collection
2. Set up environment variables
3. Configure authentication
4. Test endpoints

---

**📞 Need Help?**
- Check the [README.md](README.md) for setup instructions
- Review [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- Open an issue on GitHub for bugs or feature requests
