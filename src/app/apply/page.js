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
  Layout
} from 'lucide-react';
import { toast } from 'react-hot-toast';

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

  // Fetch available jobs on mount
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
          
          // Check for job ID in URL
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
        setFormData(prev => ({
          ...prev,
          jobTitle: selectedJob.title,
          jobId: selectedJob.id
        }));
      } else if (value === 'general') {
        setFormData(prev => ({
          ...prev,
          jobTitle: 'General Application',
          jobId: 'GEN-001'
        }));
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
      console.error('Submission error:', error);
      toast.error(error.message || 'An error occurred while submitting.');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-3xl p-12 rounded-[3.5rem] shadow-2xl max-w-xl w-full text-center border border-white/20 relative"
        >
          <div className="w-24 h-24 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-500/20">
            <CheckCircle size={56} />
          </div>
          <h1 className="text-4xl font-black text-white mb-4">You're All Set!</h1>
          <p className="text-blue-100 mb-10 text-lg font-medium leading-relaxed">
            Your application for <span className="text-white font-black underline decoration-blue-500">{formData.jobTitle}</span> has been received. Our team will review it and get back to you shortly.
          </p>
          <button 
            onClick={() => window.location.href = 'https://vimanasa.com/jobs'}
            className="w-full bg-white text-slate-900 font-black py-5 rounded-2xl hover:bg-blue-50 transition-all shadow-xl text-lg"
          >
            Explore More Jobs
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 py-12 px-4 relative overflow-hidden flex flex-col justify-center">
      {/* Dynamic Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/30 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="max-w-3xl mx-auto w-full relative z-10">
        <header className="text-center mb-10">
          <motion.div initial={{ y: -20 }} animate={{ y: 0 }} className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-2xl shadow-xl">
              <img src="/vimanasa-logo.png" alt="Vimanasa" className="h-12 w-auto" />
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-3xl font-black text-white tracking-tight uppercase">Apply for Excellence</motion.h1>
          <p className="text-blue-200 mt-2 font-medium">Step {step} of 3: {step === 1 ? 'Personal Profile' : step === 2 ? 'Professional Journey' : 'Identity & Verification'}</p>
          
          {/* Progress Bar */}
          <div className="mt-6 max-w-xs mx-auto h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${(step / 3) * 100}%` }} 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
            />
          </div>
        </header>

        <div className="bg-white/5 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="space-y-8"
              >
                <div className="space-y-6">
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={20} />
                    <select 
                      name="jobSelection" 
                      value={formData.jobId} 
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-5 bg-white/10 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-4 focus:ring-blue-500/20 transition-all appearance-none"
                    >
                      <option className="bg-slate-900" value="general">General Application</option>
                      {availableJobs.map(job => (
                        <option className="bg-slate-900" key={job.id} value={job.id}>{job.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input icon={User} name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" />
                    <Input icon={Phone} name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone Number" />
                    <Input icon={Mail} name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" type="email" />
                    <Input icon={Calendar} name="dob" value={formData.dob} onChange={handleChange} placeholder="Date of Birth" type="date" />
                  </div>
                  
                  <div className="relative">
                    <MapPin className="absolute left-4 top-5 text-blue-400" size={20} />
                    <textarea 
                      name="address" 
                      value={formData.address} 
                      onChange={handleChange} 
                      rows={3} 
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-slate-500" 
                      placeholder="Current Address" 
                    />
                  </div>
                </div>
                
                <button type="button" onClick={nextStep} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3">
                  Continue to Career Details <ArrowRight size={20} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input icon={Building2} name="employer" value={formData.employer} onChange={handleChange} placeholder="Current Employer" />
                  <Input icon={Award} name="experience" value={formData.experience} onChange={handleChange} placeholder="Years of Experience" type="number" />
                  <Input icon={IndianRupee} name="currentSalary" value={formData.currentSalary} onChange={handleChange} placeholder="Current Salary (₹)" />
                  <Input icon={Sparkles} name="expectedSalary" value={formData.expectedSalary} onChange={handleChange} placeholder="Expected Salary (₹)" />
                  <Input icon={Clock} name="noticePeriod" value={formData.noticePeriod} onChange={handleChange} placeholder="Notice Period (Days)" type="number" />
                </div>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-5 text-blue-400" size={20} />
                  <textarea 
                    name="skills" 
                    value={formData.skills} 
                    onChange={handleChange} 
                    rows={3} 
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-4 focus:ring-blue-500/20 transition-all placeholder:text-slate-500" 
                    placeholder="Key Skills (e.g. Management, Security, CCTV)" 
                  />
                </div>

                <div className="flex gap-4">
                  <button type="button" onClick={prevStep} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-black py-5 rounded-2xl transition-all border border-white/10">
                    Back
                  </button>
                  <button type="button" onClick={nextStep} className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3">
                    Next: Verification <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input icon={CreditCard} name="aadhar" value={formData.aadhar} onChange={handleChange} placeholder="Aadhar Number" />
                  <Input icon={ShieldCheck} name="pan" value={formData.pan} onChange={handleChange} placeholder="PAN Number" />
                  <Input icon={FileText} name="resumeUrl" value={formData.resumeUrl} onChange={handleChange} placeholder="Resume Drive Link" />
                  <Input icon={Camera} name="photoUrl" value={formData.photoUrl} onChange={handleChange} placeholder="Photo Drive Link" />
                </div>

                <div className="p-6 bg-blue-500/10 rounded-[2rem] border border-blue-500/20 flex gap-4 items-center">
                  <div className="p-3 bg-blue-500 rounded-full text-white"><Sparkles size={24} /></div>
                  <p className="text-sm text-blue-100 font-medium">Double-check your Drive links to ensure our team can view your documents!</p>
                </div>

                <div className="flex gap-4">
                  <button type="button" onClick={prevStep} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-black py-5 rounded-2xl transition-all border border-white/10">
                    Back
                  </button>
                  <button 
                    type="button"
                    onClick={handleSubmit} 
                    disabled={loading}
                    className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black py-5 rounded-2xl shadow-2xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>Finalize Application <CheckCircle size={20} /></>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Input({ icon: Icon, placeholder, ...props }) {
  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 group-focus-within:text-white transition-colors">
        <Icon size={20} />
      </div>
      <input 
        {...props} 
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/10 rounded-2xl text-white font-bold outline-none focus:ring-4 focus:ring-blue-500/20 focus:bg-white/15 transition-all placeholder:text-slate-500" 
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading Immersive Experience...</div>}>
      <ApplyForm />
    </Suspense>
  );
}
