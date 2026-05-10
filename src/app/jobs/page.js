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
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-grow">
        {/* Minimalist Professional Hero */}
        <section className="relative pt-32 pb-16 md:pt-52 md:pb-32 px-4 overflow-hidden border-b border-slate-50">
          <div className="max-w-5xl mx-auto relative">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100/50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-8"
            >
              <div className="w-1 h-1 bg-blue-600 rounded-full animate-pulse" />
              <span>Careers at Vimanasa Nexus</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-7xl font-black text-slate-900 tracking-tight mb-8 leading-[1.05]"
            >
              Your next chapter <br />
              <span className="text-blue-600">begins here.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-xl text-slate-500 max-w-2xl font-medium mb-12 leading-relaxed"
            >
              We're building the future of workforce management. Discover roles that challenge your potential and impact global industries.
            </motion.p>

            {/* High-End Search Interface */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col md:flex-row items-center gap-3 p-1.5 bg-slate-50 rounded-2xl md:rounded-full border border-slate-200 shadow-sm max-w-3xl"
            >
              <div className="flex-1 relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search roles or departments..." 
                  className="w-full pl-11 pr-4 py-3.5 bg-transparent outline-none font-bold text-slate-700 placeholder:text-slate-400 text-sm md:text-base"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-px h-8 bg-slate-200 hidden md:block" />
              <div className="flex w-full md:w-auto gap-2">
                <select 
                  className="flex-1 md:flex-none pl-4 pr-10 py-3.5 bg-transparent font-bold text-slate-600 outline-none text-sm cursor-pointer appearance-none"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option>All Types</option>
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                </select>
                <div className="hidden md:block pr-4 pointer-events-none">
                  <Filter size={16} className="text-slate-400" />
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Jobs Feed */}
        <section className="py-16 md:py-24 px-4 bg-slate-50/30">
          <div className="max-w-6xl mx-auto">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-64 bg-white rounded-3xl animate-pulse border border-slate-100 shadow-sm" />
                ))}
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredJobs.map((job, index) => (
                  <JobCard key={job.id} job={job} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Briefcase size={28} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-2">No matching opportunities</h3>
                <p className="text-slate-500 text-sm">Try broadening your search or check back later.</p>
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-200 transition-all cursor-pointer flex flex-col h-full relative"
      onClick={() => window.location.href = `/jobs/${job.id}`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="px-2.5 py-1 bg-slate-50 rounded-md text-[10px] font-black uppercase tracking-wider text-slate-500 border border-slate-100">
          {job.type}
        </div>
        <div className="text-slate-300 group-hover:text-blue-500 transition-colors">
          <ChevronRight size={20} />
        </div>
      </div>

      <div className="flex-grow">
        <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
          {job.title}
        </h3>
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-8">
          {job.department}
        </p>

        <div className="flex flex-wrap gap-x-6 gap-y-3 mb-8">
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin size={14} className="text-blue-500/70" />
            <span className="text-sm font-bold">{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <DollarSign size={14} className="text-emerald-500/70" />
            <span className="text-sm font-bold">{job.salary_range || 'Competitive'}</span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-black text-blue-600 uppercase tracking-widest">
          View Details <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            window.location.href = `/apply?job=${job.id}`;
          }}
          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 shadow-lg shadow-slate-100"
        >
          Quick Apply
        </button>
      </div>
    </motion.div>
  );
}
