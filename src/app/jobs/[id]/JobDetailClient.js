'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  DollarSign, 
  Building2, 
  Calendar,
  Share2,
  CheckCircle,
  Briefcase,
  Globe,
  Mail,
  ShieldCheck,
  Users
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function JobDetailClient({ id }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJob() {
      try {
        const response = await fetch(`/api/database?table=job_openings`);
        const result = await response.json();
        if (result.success) {
          const foundJob = result.data.find(j => j.id === id);
          setJob(foundJob);
        }
      } catch (error) {
        console.error('Error fetching job:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [id]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-black text-slate-900 mb-4">Job Not Found</h1>
        <p className="text-slate-500 mb-8">This position may have been filled or the link is incorrect.</p>
        <button 
          onClick={() => window.location.href = '/jobs'}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black"
        >
          View All Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <button 
            onClick={() => window.location.href = '/jobs'}
            className="flex items-center gap-2 text-slate-600 font-bold hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={20} /> Back to Jobs
          </button>
          <img src="/vimanasa-logo.png" alt="Logo" className="h-8 w-auto hidden md:block" />
          <button 
            onClick={handleShare}
            className="flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-200 transition-all"
          >
            <Share2 size={18} /> Share
          </button>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Job Header Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 rounded-[3rem] p-8 md:p-12 text-white mb-12 shadow-2xl shadow-blue-900/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-4 py-1 bg-blue-600 rounded-full text-xs font-black uppercase tracking-widest">{job.type}</span>
                <span className="px-4 py-1 bg-white/10 rounded-full text-xs font-black uppercase tracking-widest">{job.department}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">{job.title}</h1>
              <div className="flex flex-wrap gap-6 text-blue-100 font-medium">
                <div className="flex items-center gap-2"><MapPin size={18} /> {job.location}</div>
                <div className="flex items-center gap-2"><DollarSign size={18} /> {job.salary_range || 'Competitive'}</div>
                <div className="flex items-center gap-2"><Calendar size={18} /> Posted {new Date(job.created_at).toLocaleDateString()}</div>
              </div>
              <button 
                onClick={() => window.location.href = `/apply?job=${job.id}`}
                className="mt-10 bg-white text-slate-900 px-10 py-5 rounded-2xl font-black text-lg hover:bg-blue-50 transition-all shadow-xl shadow-white/5"
              >
                Apply for this Position
              </button>
            </div>
          </motion.div>

          {/* Job Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              {/* Description */}
              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <Briefcase className="text-blue-600" /> About the Role
                </h2>
                <div className="text-slate-600 leading-relaxed space-y-4 text-lg font-medium">
                  {job.description ? job.description.split('\n').map((p, i) => (
                    <p key={i}>{p}</p>
                  )) : (
                    <p>We are looking for a dedicated and skilled individual to join our team in this role. You will play a vital part in our mission to deliver excellence.</p>
                  )}
                </div>
              </section>

              {/* Requirements */}
              <section>
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                  <ShieldCheck className="text-blue-600" /> Requirements
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {job.requirements ? job.requirements.split('\n').map((req, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="mt-1"><CheckCircle className="text-green-500 flex-shrink-0" size={20} /></div>
                      <p className="text-slate-700 font-bold">{req}</p>
                    </div>
                  )) : (
                    ['Proven experience in a similar role', 'Excellent communication skills', 'Ability to work in a team environment'].map((req, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="mt-1"><CheckCircle className="text-green-500 flex-shrink-0" size={20} /></div>
                        <p className="text-slate-700 font-bold">{req}</p>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            {/* Sidebar Stats */}
            <aside className="space-y-8">
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-200">
                <h3 className="text-xl font-black text-slate-900 mb-6">Job Summary</h3>
                <div className="space-y-6">
                  <SidebarItem icon={Building2} label="Department" value={job.department} />
                  <SidebarItem icon={Globe} label="Work Mode" value={job.location} />
                  <SidebarItem icon={Clock} label="Job Type" value={job.type} />
                  <SidebarItem icon={Users} label="Openings" value="1 Position" />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-4">
      <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm flex-shrink-0"><Icon size={20} /></div>
      <div>
        <p className="text-[10px] font-black uppercase text-slate-400 mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
