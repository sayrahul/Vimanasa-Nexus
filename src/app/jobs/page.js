'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  ArrowRight, 
  Search, 
  Filter,
  ChevronRight,
  Sparkles,
  Building2,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export default function CareersPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch(`/api/database?table=job_openings&t=${Date.now()}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          const openJobs = result.data.filter(j => 
            (j.status || 'open').toLowerCase() === 'open'
          );
          setJobs(openJobs);
        } else {
          console.warn('[JOBS-PAGE] API returned no job data.');
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || job.type === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-40 pb-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-indigo-600/5" />
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl" />
          
          <div className="max-w-7xl mx-auto relative text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-bold mb-6"
            >
              <Sparkles size={16} />
              <span>We're Hiring for 2026!</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-6"
            >
              Build your future at <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Vimanasa Nexus</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 font-medium"
            >
              Join a fast-growing ecosystem where talent meets opportunity. Browse our open positions and start your journey today.
            </motion.p>

            {/* Search & Filter Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="max-w-3xl mx-auto bg-white p-2 rounded-3xl shadow-2xl shadow-blue-100 flex flex-col md:flex-row gap-2 border border-slate-100"
            >
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search by job title or department..." 
                  className="w-full pl-12 pr-4 py-4 rounded-2xl outline-none font-bold text-slate-800"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select 
                  className="px-6 py-4 bg-slate-50 rounded-2xl font-bold text-slate-600 outline-none focus:ring-2 focus:ring-blue-500/20"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option>All</option>
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                </select>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Jobs Listing */}
        <section className="pb-24 px-4">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-80 bg-white rounded-[2.5rem] animate-pulse border border-slate-100" />
                ))}
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredJobs.map((job, index) => (
                  <JobCard key={job.id} job={job} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Briefcase size={32} className="text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">No matching jobs found</h3>
                <p className="text-slate-500">Try adjusting your search or filters to find more opportunities.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function JobCard({ job, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10 }}
      className="group bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all cursor-pointer relative flex flex-col h-full"
      onClick={() => window.location.href = `/jobs/${job.id}`}
    >
      <div className="mb-6 flex justify-between items-start">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500">
          <Building2 size={28} />
        </div>
        <div className="px-3 py-1 bg-slate-50 rounded-full text-[10px] font-black uppercase tracking-wider text-slate-500 border border-slate-100">
          {job.type}
        </div>
      </div>

      <h3 className="text-2xl font-black text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
        {job.title}
      </h3>
      <p className="text-sm font-bold text-slate-500 mb-6 flex items-center gap-2 uppercase tracking-wide">
        {job.department}
      </p>

      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
          <MapPin size={16} className="text-blue-500" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
          <DollarSign size={16} className="text-green-500" />
          <span>{job.salary_range || 'Competitive'}</span>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
        <span className="text-sm font-black text-blue-600 flex items-center gap-2">
          View Details <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `/apply?job=${job.id}`;
          }}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-colors"
        >
          Quick Apply
        </button>
      </div>
    </motion.div>
  );
}
