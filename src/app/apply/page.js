'use client';
export const runtime = 'edge';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  FileText, 
  Briefcase, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  CreditCard,
  Sparkles,
  Award,
  BookOpen,
  Camera,
  Building2,
  ShieldCheck,
  DollarSign,
  Clock,
  IndianRupee,
  ChevronLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

function ApplyForm() {
  const searchParams = useSearchParams();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    jobTitle: 'General Application',
    jobId: 'GEN-001',
    fullName: '',
    phone: '',
    email: '',
    dob: '',
    gender: 'Male',
    address: '',
    aadhar: '',
    pan: '',
    employer: '',
    experience: '',
    currentSalary: '',
    expectedSalary: '',
    noticePeriod: '30',
    skills: '',
    resumeUrl: '',
    photoUrl: ''
  });

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch('/api/database?table=job_openings');
        const result = await response.json();
        if (result.success) {
          const openJobs = (result.data || []).filter(j => 
            (j.status || 'open').toLowerCase() === 'open'
          );
          setAvailableJobs(openJobs);
          
          const urlJobId = searchParams.get('job');
          if (urlJobId) {
            const selectedJob = openJobs.find(j => j.id === urlJobId);
            if (selectedJob) {
              setFormData(prev => ({
                ...prev,
                jobTitle: selectedJob.title,
                jobId: selectedJob.id
              }));
            }
          }
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setIsLoadingJobs(false);
      }
    }
    fetchJobs();
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'jobSelection') {
      const selectedJob = availableJobs.find(j => j.id === value);
      if (selectedJob) {
        setFormData(prev => ({ ...prev, jobTitle: selectedJob.title, jobId: selectedJob.id }));
      } else if (value === 'general') {
        setFormData(prev => ({ ...prev, jobTitle: 'General Application', jobId: 'GEN-001' }));
      }
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: 'candidates',
          data: {
            'Job Title': formData.jobTitle,
            'Job ID': formData.jobId,
            'Full Name': formData.fullName,
            'Phone': formData.phone,
            'Email': formData.email,
            'Date of Birth': formData.dob,
            'Gender': formData.gender,
            'Address': formData.address,
            'Aadhar': formData.aadhar,
            'PAN': formData.pan,
            'Current Employer': formData.employer,
            'Experience': formData.experience,
            'Current Salary': formData.currentSalary,
            'Expected Salary': formData.expectedSalary,
            'Notice Period': formData.noticePeriod,
            'Skills': formData.skills,
            'Resume Link': formData.resumeUrl,
            'Photo Link': formData.photoUrl,
            'Status': 'pending'
          }
        })
      });
      const result = await response.json();
      if (result.success) {
        setIsSubmitted(true);
        toast.success('Application submitted successfully!');
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred while submitting.');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md">
          <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-200">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Application Received</h1>
          <p className="text-slate-500 mb-10 font-medium">
            Thank you for your interest in <span className="text-blue-600 font-bold">{formData.jobTitle}</span>. Our recruitment team will review your profile and contact you shortly.
          </p>
          <button onClick={() => window.location.href = '/jobs'} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all">
            Back to Careers
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-24 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <button 
            onClick={() => window.location.href = '/jobs'}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-8 text-xs font-black uppercase tracking-widest"
          >
            <ChevronLeft size={16} /> Back to Listings
          </button>

          <header className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Application Form</h1>
              <div className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Step {step} of 3
              </div>
            </div>
            
            {/* Minimal Progress Bar */}
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${(step / 3) * 100}%` }} 
                className="h-full bg-blue-600"
              />
            </div>
          </header>

          <div className="bg-white p-6 md:p-10 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Applying For</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <select 
                        name="jobSelection" 
                        value={formData.jobId} 
                        onChange={handleChange}
                        className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                      >
                        <option value="general">General Application</option>
                        {availableJobs.map(job => (
                          <option key={job.id} value={job.id}>{job.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input icon={User} name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" />
                    <Input icon={Phone} name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" />
                    <Input icon={Mail} name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" type="email" />
                    <Input icon={Calendar} name="dob" value={formData.dob} onChange={handleChange} placeholder="Date of Birth" type="date" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                      <textarea 
                        name="address" 
                        value={formData.address} 
                        onChange={handleChange} 
                        rows={3} 
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-300" 
                        placeholder="House no, Street, City, State..." 
                      />
                    </div>
                  </div>
                  
                  <button type="button" onClick={nextStep} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                    Next Step <ArrowRight size={18} />
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input icon={Building2} name="employer" value={formData.employer} onChange={handleChange} placeholder="Current Employer" />
                    <Input icon={Award} name="experience" value={formData.experience} onChange={handleChange} placeholder="Years of Experience" type="number" />
                    <Input icon={IndianRupee} name="currentSalary" value={formData.currentSalary} onChange={handleChange} placeholder="Current Salary" />
                    <Input icon={Sparkles} name="expectedSalary" value={formData.expectedSalary} onChange={handleChange} placeholder="Expected Salary" />
                    <Input icon={Clock} name="noticePeriod" value={formData.noticePeriod} onChange={handleChange} placeholder="Notice Period (Days)" type="number" />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional Skills</label>
                    <div className="relative">
                      <BookOpen className="absolute left-4 top-4 text-slate-400" size={18} />
                      <textarea 
                        name="skills" 
                        value={formData.skills} 
                        onChange={handleChange} 
                        rows={3} 
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-300" 
                        placeholder="List your key technical or soft skills..." 
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={prevStep} className="px-6 py-4 bg-slate-100 text-slate-600 font-black rounded-xl hover:bg-slate-200 transition-all active:scale-[0.98]">
                      <ArrowLeft size={18} />
                    </button>
                    <button type="button" onClick={nextStep} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                      Verification <ArrowRight size={18} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input icon={CreditCard} name="aadhar" value={formData.aadhar} onChange={handleChange} placeholder="Aadhar Number" />
                    <Input icon={ShieldCheck} name="pan" value={formData.pan} onChange={handleChange} placeholder="PAN Number" />
                    <Input icon={FileText} name="resumeUrl" value={formData.resumeUrl} onChange={handleChange} placeholder="Resume Drive Link" />
                    <Input icon={Camera} name="photoUrl" value={formData.photoUrl} onChange={handleChange} placeholder="Photo Drive Link" />
                  </div>

                  <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-3 items-start">
                    <Sparkles className="text-blue-500 mt-0.5 shrink-0" size={16} />
                    <p className="text-[11px] text-blue-600 font-bold leading-relaxed">
                      Ensure your Drive links are accessible to "Anyone with the link" so our recruitment team can review your documents without delay.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button type="button" onClick={prevStep} className="px-6 py-4 bg-slate-100 text-slate-600 font-black rounded-xl hover:bg-slate-200 transition-all active:scale-[0.98]">
                      <ArrowLeft size={18} />
                    </button>
                    <button 
                      type="button"
                      onClick={handleSubmit} 
                      disabled={loading}
                      className="flex-1 bg-slate-900 hover:bg-blue-600 text-white font-black py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>Submit Application <CheckCircle size={18} /></>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Input({ icon: Icon, placeholder, ...props }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{placeholder}</label>
      <div className="relative group">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
        <input 
          {...props} 
          placeholder={`Enter ${placeholder.toLowerCase()}`}
          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-xl text-slate-900 font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all placeholder:text-slate-300 text-sm" 
        />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-400 uppercase tracking-widest animate-pulse">Initializing Portal...</div>}>
      <ApplyForm />
    </Suspense>
  );
}
