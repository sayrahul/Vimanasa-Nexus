'use client';
export const runtime = 'edge';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
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
  Upload,
  CreditCard
} from 'lucide-react';
import { apiClient } from '@/lib/apiClient';
import { toast } from 'react-hot-toast';

function ApplyForm() {
  const searchParams = useSearchParams();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    jobTitle: searchParams.get('job') || 'General Application',
    jobId: searchParams.get('jobId') || 'GEN-001',
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Direct POST to candidates table (Public Access allowed in API)
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-2xl shadow-blue-100 max-w-lg w-full text-center border border-slate-100"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4">Application Received!</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Thank you for applying to <strong>Vimanasa Services LLP</strong>. We have received your application for <strong>{formData.jobTitle}</strong> and our recruitment team will contact you shortly.
          </p>
          <button 
            onClick={() => window.location.href = 'https://vimanasa.com'}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-lg"
          >
            Back to Website
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img src="/vimanasa-logo.png" alt="Vimanasa" className="h-16 w-auto" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Candidate Application</h1>
          <p className="text-slate-500 mt-3 text-lg font-medium">Join the Vimanasa Services LLP team</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 sm:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          {/* Section 1: Position */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Briefcase size={20} /></div>
              <h2 className="text-xl font-bold text-slate-800">Position Applied For</h2>
            </div>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Applying for Role</p>
              <p className="text-xl font-bold text-slate-900">{formData.jobTitle}</p>
              <p className="text-xs text-slate-500 mt-1">ID: {formData.jobId}</p>
            </div>
          </section>

          {/* Section 2: Personal */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><User size={20} /></div>
              <h2 className="text-xl font-bold text-slate-800">Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input name="fullName" value={formData.fullName} onChange={handleChange} required className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium" placeholder="John Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input name="phone" value={formData.phone} onChange={handleChange} required className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium" placeholder="+91 00000 00000" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input name="email" value={formData.email} onChange={handleChange} type="email" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium" placeholder="john@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input name="dob" value={formData.dob} onChange={handleChange} type="date" className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium" />
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <label className="text-sm font-bold text-slate-700">Current Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                <textarea name="address" value={formData.address} onChange={handleChange} rows={3} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium" placeholder="Enter your full address" />
              </div>
            </div>
          </section>

          {/* Section 3: Identity */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><CreditCard size={20} /></div>
              <h2 className="text-xl font-bold text-slate-800">Identity & Documents</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Aadhar Number</label>
                <input name="aadhar" value={formData.aadhar} onChange={handleChange} className="w-full px-4 py-3.5 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium" placeholder="0000 0000 0000" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">PAN Number</label>
                <input name="pan" value={formData.pan} onChange={handleChange} className="w-full px-4 py-3.5 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium" placeholder="ABCDE1234F" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Resume URL (Drive Link)</label>
                <div className="relative">
                  <Upload className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input name="resumeUrl" value={formData.resumeUrl} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium" placeholder="Paste link to your resume" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Photo URL (Drive Link)</label>
                <div className="relative">
                  <Upload className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input name="photoUrl" value={formData.photoUrl} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium" placeholder="Paste link to your photo" />
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Professional */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><FileText size={20} /></div>
              <h2 className="text-xl font-bold text-slate-800">Professional Experience</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-slate-700">Current / Last Employer</label>
                <input name="employer" value={formData.employer} onChange={handleChange} className="w-full px-4 py-3.5 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium" placeholder="Company Name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Total Experience (Years)</label>
                <input name="experience" value={formData.experience} onChange={handleChange} type="number" className="w-full px-4 py-3.5 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium" placeholder="0" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Current Salary (₹)</label>
                <input name="currentSalary" value={formData.currentSalary} onChange={handleChange} className="w-full px-4 py-3.5 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium" placeholder="50,000" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Expected Salary (₹)</label>
                <input name="expectedSalary" value={formData.expectedSalary} onChange={handleChange} className="w-full px-4 py-3.5 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium" placeholder="60,000" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Notice Period (Days)</label>
                <input name="noticePeriod" value={formData.noticePeriod} onChange={handleChange} type="number" className="w-full px-4 py-3.5 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium" placeholder="30" />
              </div>
            </div>
            <div className="mt-6 space-y-2">
              <label className="text-sm font-bold text-slate-700">Skills (Comma separated)</label>
              <input name="skills" value={formData.skills} onChange={handleChange} className="w-full px-4 py-3.5 bg-slate-50 rounded-xl border border-slate-100 focus:bg-white focus:ring-4 focus:ring-blue-50 outline-none transition-all font-medium" placeholder="Security, Management, CCTV, etc." />
            </div>
          </section>

          <div className="pt-8 border-t border-slate-100">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>Submit Application <ArrowRight size={20} /></>
              )}
            </button>
            <p className="text-center text-slate-400 text-xs mt-4">
              By submitting, you agree to our recruitment terms and data privacy policy.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ApplyForm />
    </Suspense>
  );
}
