import { Inter } from 'next/font/google';
import './globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Vimanasa Nexus | Enterprise Workforce & Payroll Management',
  description: 'The all-in-one HR, Payroll, and Compliance management platform for modern outsourcing and manpower businesses. Streamline your workforce operations with Vimanasa Nexus.',
  keywords: 'HR Management, Workforce Automation, Payroll Processing, Compliance Tracker, Manpower Outsourcing, Vimanasa Nexus',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Vimanasa Nexus | Advanced Workforce Management',
    description: 'Enterprise-grade platform for payroll, attendance, and client invoicing.',
    url: 'https://nexus.vimanasa.com',
    siteName: 'Vimanasa Nexus',
    images: [
      {
        url: '/favicon.png',
        width: 800,
        height: 600,
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vimanasa Nexus',
    description: 'Enterprise HR & Payroll Management Platform',
    images: ['/favicon.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  );
}
