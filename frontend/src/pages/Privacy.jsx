import React from 'react';
import { Link } from 'react-router-dom';

const sections = [
  { id: 'introduction', title: '1. Introduction' },
  { id: 'info-collect', title: '2. Information We Collect' },
  { id: 'use-data', title: '3. How We Use Your Data' },
  { id: 'share-data', title: '4. How We Share Your Data' },
  { id: 'cookies', title: '5. Cookies and Tracking' },
  { id: 'security', title: '6. Data Security' },
  { id: 'rights', title: '7. Your Rights' },
  { id: 'children', title: '8. Children\'s Privacy' },
  { id: 'changes', title: '9. Changes to This Policy' },
  { id: 'contact', title: '10. Contact' },
];

const privacyContent = [
  {
    id: 'introduction',
    content: (
      <p>
        At Coffee Chat, your privacy is important to us. This Privacy Policy outlines how we collect, use, and protect your personal data when you use our platform.
      </p>
    ),
  },
  {
    id: 'info-collect',
    content: (
      <ul className="list-disc ml-6 space-y-1">
        <li>Basic account details (such as name, email, and profile picture)</li>
        <li>Login credentials and authentication methods (including password and Google/Firebase sign-in)</li>
        <li>Activity data (like events you attend or create, and groups you join)</li>
        <li>Device information (IP address, browser type, device ID, and approximate location)</li>
      </ul>
    ),
  },
  {
    id: 'use-data',
    content: (
      <ul className="list-disc ml-6 space-y-1">
        <li>To operate and enhance our services</li>
        <li>To personalize your experience and recommend relevant groups or events</li>
        <li>To analyze usage trends and improve user support</li>
        <li>To send important updates, notifications, and service-related messages</li>
      </ul>
    ),
  },
  {
    id: 'share-data',
    content: (
      <ul className="list-disc ml-6 space-y-1">
        <li>We never sell your personal data. However, we may share it with:</li>
        <li>Trusted partners and service providers (e.g., Firebase, Cloudinary) who help us operate the platform</li>
        <li>Authorities or law enforcement if required to comply with legal obligations</li>
      </ul>
    ),
  },
  {
    id: 'cookies',
    content: (
      <p>
        We use cookies and similar tracking technologies to deliver a better experience, remember your preferences, and understand usage patterns. You can manage or disable cookies via your browser settings at any time.
      </p>
    ),
  },
  {
    id: 'security',
    content: (
      <p>
        We apply strong security practices to safeguard your personal information. While we continuously work to protect your data, no online service can guarantee complete security.
      </p>
    ),
  },
  {
    id: 'rights',
    content: (
      <ul className="list-disc ml-6 space-y-1">
        <li>Access, review, or update your profile information</li>
        <li>Request deletion of your account and associated data</li>
        <li>Withdraw your consent to data processing at any time</li>
      </ul>
    ),
  },
  {
    id: 'children',
    content: (
      <p>
        Coffee Chat is designed for users aged 13 and above. We do not knowingly collect personal data from children under 13. If we become aware of such collection, we will take steps to remove the information promptly.
      </p>
    ),
  },
  {
    id: 'changes',
    content: (
      <p>
        This policy may be updated periodically. Significant changes will be communicated through our platform or via email so you remain informed about how your data is handled.
      </p>
    ),
  },
  {
    id: 'contact',
    content: (
      <p>
        Have questions or concerns about your data? Contact our privacy team anytime at:{" "}
        <a href="mailto:privacy@coffeechat.com" className="text-orange-600 underline">
          privacy@coffeechat.com
        </a>
      </p>
    ),
  },
];

const Privacy = () => {
  const [openSection, setOpenSection] = React.useState(null);

  const handleToggle = (id) => {
    setOpenSection(openSection === id ? null : id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Header with Logo and Back Link */}
      <header className="w-full py-8 bg-white shadow-sm flex flex-col items-center pt-24">
        <img src="/Main Logo.png" alt="Coffee Chat Logo" className="h-12 mb-2" />
        <Link to="/" className="text-orange-600 hover:underline text-sm">← Back to Home</Link>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">Privacy Policy</h1>
        <p className="text-center text-gray-500 mb-6">Effective Date: July 3, 2025</p>

        {/* Table of Contents */}
        <nav className="mb-8 bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Table of Contents</h2>
          <ul className="space-y-1">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  className="text-orange-600 hover:underline text-left w-full"
                  onClick={() => handleToggle(section.id)}
                >
                  {section.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sections */}
        <div className="space-y-6">
          {privacyContent.map((section, idx) => (
            <section
              key={section.id}
              id={section.id}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpenSection(openSection === section.id ? null : section.id)}>
                <h3 className="text-xl font-semibold mb-2">{sections[idx].title}</h3>
                <span className="ml-2 text-orange-600">{openSection === section.id ? '−' : '+'}</span>
              </div>
              {openSection === section.id && (
                <div className="mt-2 text-gray-800 text-base">
                  {section.content}
                </div>
              )}
            </section>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 bg-gray-100 text-center mt-10 border-t border-gray-200">
        <Link to="/" className="text-orange-600 hover:underline">Return to Home</Link>
      </footer>
    </div>
  );
};

export default Privacy;
