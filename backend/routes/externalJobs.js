const express = require('express');
const axios = require('axios');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Job = require('../models/Job');

// Cache for external job data (in production, use Redis)
const cache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// JSearch API configuration
const JSEARCH_API_URL = 'https://jsearch.p.rapidapi.com';
const JSEARCH_API_KEY = process.env.RAPIDAPI_KEY; // Add to .env file

// Adzuna API configuration  
const ADZUNA_API_URL = 'https://api.adzuna.com/v1/api';
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID; // Add to .env file
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY; // Add to .env file

// Helper function to check cache
const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

// Helper function to set cache
const setCachedData = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Search external jobs using JSearch API
router.get('/search', protect, async (req, res) => {
  try {
    const {
      query = '',
      location = '',
      employment_types = 'FULLTIME',
      page = 1,
      num_pages = 1,
      date_posted = 'all',
      remote_jobs_only = false
    } = req.query;

    // Create cache key
    const cacheKey = `search_${JSON.stringify(req.query)}`;
    const cachedResult = getCachedData(cacheKey);
    
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        cached: true
      });
    }

    if (!JSEARCH_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'External job search service not configured'
      });
    }

    const response = await axios.get(`${JSEARCH_API_URL}/search`, {
      headers: {
        'X-RapidAPI-Key': JSEARCH_API_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      },
      params: {
        query: query || 'software developer',
        page,
        num_pages,
        date_posted,
        remote_jobs_only,
        employment_types
      },
      timeout: 15000
    });

    const transformedJobs = response.data.data?.map(job => ({
      id: job.job_id,
      title: job.job_title,
      company: job.employer_name,
      location: job.job_city && job.job_state ? 
        `${job.job_city}, ${job.job_state}` : 
        job.job_country || 'Remote',
      description: job.job_description,
      employment_type: job.job_employment_type,
      posted_date: job.job_posted_at_datetime_utc,
      apply_link: job.job_apply_link,
      salary_min: job.job_min_salary,
      salary_max: job.job_max_salary,
      salary_currency: job.job_salary_currency,
      requirements: job.job_required_skills || [],
      benefits: job.job_benefits || [],
      is_remote: job.job_is_remote,
      source: 'jsearch',
      external_id: job.job_id,
      logo_url: job.employer_logo,
      company_type: job.employer_company_type
    })) || [];

    const result = {
      jobs: transformedJobs,
      total: response.data.data?.length || 0,
      page: parseInt(page),
      provider: 'jsearch'
    };

    setCachedData(cacheKey, result);

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('External job search error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to search external jobs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get trending jobs
router.get('/trending', async (req, res) => {
  try {
    const { location = '', category = 'technology', limit = 10 } = req.query;
    
    const cacheKey = `trending_${location}_${category}_${limit}`;
    const cachedResult = getCachedData(cacheKey);
    
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        cached: true
      });
    }

    // Use popular search terms for trending
    const trendingQueries = [
      'software engineer',
      'data scientist', 
      'product manager',
      'frontend developer',
      'backend developer',
      'full stack developer'
    ];

    const randomQuery = trendingQueries[Math.floor(Math.random() * trendingQueries.length)];
    
    const response = await axios.get(`${JSEARCH_API_URL}/search`, {
      headers: {
        'X-RapidAPI-Key': JSEARCH_API_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      },
      params: {
        query: randomQuery,
        page: 1,
        num_pages: 1,
        date_posted: 'week'
      },
      timeout: 15000
    });

    const trendingJobs = response.data.data?.slice(0, limit).map(job => ({
      id: job.job_id,
      title: job.job_title,
      company: job.employer_name,
      location: job.job_city && job.job_state ?
      `${job.job_city}, ${job.job_state}` :
        job.job_country || 'Remote',
      description: job.job_description,
      employment_type: job.job_employment_type,
      posted_date: job.job_posted_at_datetime_utc,
      apply_link: job.job_apply_link,
      salary_min: job.job_min_salary,
      salary_max: job.job_max_salary,
      salary_currency: job.job_salary_currency,
      requirements: job.job_required_skills || [],
      benefits: job.job_benefits || [],
      is_remote: job.job_is_remote,
      source: 'jsearch',
      external_id: job.job_id,
      logo_url: job.employer_logo,
      company_type: job.employer_company_type
    })) || [];

    setCachedData(cacheKey, trendingJobs);

    res.json({
      success: true,
      data: trendingJobs
    });

  } catch (error) {
    console.error('Trending jobs error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending jobs'
    });
  }
});

// Sync external jobs to local database (admin only)
router.post('/sync', protect, async (req, res) => {
  try {
 need to implement admin role checking
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { query = 'software developer', max_jobs = 50 } = req.body;

    const response = await axios.get(`${JSEARCH_API_URL}/search`, {
      headers: {
        'X-RapidAPI-Key': JSEARCH_API_KEY,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
      },
      params: {
        query,
        page: 1,
        num_pages: Math.ceil(max_jobs / 10),
        date_posted: 'week'
      }
    });

    const externalJobs = response.data.data?.slice(0, max_jobs) || [];
    let syncedCount = 0;

    for (const jobData of externalJobs) {
      try {
        const existingJob = await Job.findOne({ 
          external_id: jobData.job_id,
          source: 'jsearch'
        });

        if (!existingJob) {
          const newJob = new Job({
            title: jobData.job_title,
            description: jobData.job_description,
            location: jobData.job_city && jobData.job_state ? 
              `${jobData.job_city}, ${jobData.job_state}` : 
              jobData.job_country || 'Remote',
            companyName: jobData.employer_name,
            salaryMin: jobData.job_min_salary,
            salaryMax: jobData.job_max_salary,
            jobType: jobData.job_employment_type || 'Full-time',
            requirements: jobData.job_required_skills || [],
            skills: jobData.job_required_skills || [],
            isActive: true,
            isExternal: true,
            external_id: jobData.job_id,
            source: 'jsearch',
            apply_link: jobData.job_apply_link,
            postedDate: new Date(jobData.job_posted_at_datetime_utc || Date.now()),
            // Set a system user as the poster for external jobs
            postedBy: req.user._id //  might create a system user later
          });

          await newJob.save();
          syncedCount++;
        }
      } catch (jobError) {
        console.error('Error saving external job:', jobError.message);
      }
    }

    res.json({
      success: true,
      message: `Successfully synced ${syncedCount} external jobs`,
      synced_count: syncedCount,
      total_fetched: externalJobs.length
    });

  } catch (error) {
    console.error('Job sync error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to sync external jobs'
    });
  }
});

// Get providers status
router.get('/providers/status', protect, async (req, res) => {
  try {
    const providers = [];

    //  JSearch API
    if (JSEARCH_API_KEY) {
      try {
        await axios.get(`${JSEARCH_API_URL}/search`, {
          headers: {
            'X-RapidAPI-Key': JSEARCH_API_KEY,
            'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
          },
          params: { query: 'test', page: 1, num_pages: 1 },
          timeout: 5000
        });
        providers.push({ name: 'JSearch', status: 'active', configured: true });
      } catch {
        providers.push({ name: 'JSearch', status: 'error', configured: true });
      }
    } else {
      providers.push({ name: 'JSearch', status: 'not_configured', configured: false });
    }

    //  Adzuna API
    if (ADZUNA_APP_ID && ADZUNA_APP_KEY) {
      providers.push({ name: 'Adzuna', status: 'configured', configured: true });
    } else {
      providers.push({ name: 'Adzuna', status: 'not_configured', configured: false });
    }

    res.json({
      success: true,
      data: {
        providers,
        cache_size: cache.size,
        cache_enabled: true
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check providers status'
    });
  }
});

module.exports = router;
