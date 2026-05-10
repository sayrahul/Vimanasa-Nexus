import { supabaseAdmin } from '@/lib/supabase';
import JobDetailClient from './JobDetailClient';

export const runtime = 'edge';

/**
 * Generate Dynamic SEO Metadata for Job Postings
 */
export async function generateMetadata({ params }) {
  try {
    const { data: job } = await supabaseAdmin
      .from('job_openings')
      .select('title, department, description')
      .eq('id', params.id)
      .single();

    if (!job) {
      return {
        title: 'Job Not Found | Vimanasa Nexus',
      };
    }

    return {
      title: `${job.title} | Careers at Vimanasa Nexus`,
      description: `Join Vimanasa Nexus as a ${job.title} in the ${job.department} department. Apply now!`,
      openGraph: {
        title: `${job.title} | Vimanasa Nexus`,
        description: job.description?.substring(0, 160),
        type: 'website',
        siteName: 'Vimanasa Nexus',
      },
      twitter: {
        card: 'summary_large_image',
        title: job.title,
        description: job.description?.substring(0, 160),
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Job Details | Vimanasa Nexus',
    };
  }
}

export default function Page({ params }) {
  return <JobDetailClient id={params.id} />;
}
