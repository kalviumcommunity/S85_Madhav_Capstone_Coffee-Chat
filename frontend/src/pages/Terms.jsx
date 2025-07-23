import React from 'react';
import { Link } from 'react-router-dom';

const sections = [
  { id: 'acceptance', title: '1. Acceptance of Terms' },
  { id: 'overview', title: '2. Overview of the Service' },
  { id: 'eligibility', title: '3. Eligibility' },
  { id: 'accounts', title: '4. User Accounts' },
  { id: 'conduct', title: '5. User Conduct' },
  { id: 'creation', title: '6. Group and Event Creation' },
  { id: 'ownership', title: '7. Content Ownership' },
  { id: 'termination', title: '8. Termination' },
  { id: 'modifications', title: '9. Modifications' },
  { id: 'contact', title: '10. Contact' },
];

const termsContent = [
  {
    id: 'acceptance',
    content: (
      <p>
        By accessing or using Coffee Chat, you agree to comply with and be legally bound by these Terms of Service. If you do not agree to these terms, please refrain from using the platform.
      </p>
    ),
  },
  {
    id: 'overview',
    content: (
      <p>
        Coffee Chat is a community-based platform that enables users to discover, create, and participate in interest-based groups and events. The service is intended to foster meaningful connections and conversations.
      </p>
    ),
  },
  {
    id: 'eligibility',
    content: (
      <p>
        You must be at least 13 years old to use Coffee Chat. If you are under the legal age of majority in your jurisdiction, you must have permission from a parent or legal guardian to use the service.
      </p>
    ),
  },
  {
    id: 'accounts',
    content: (
      <ul className="list-disc ml-6 space-y-1">
        <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
        <li>Impersonation or creating fake accounts is strictly prohibited.</li>
        <li>We reserve the right to suspend or terminate accounts that violate our policies or pose a security risk.</li>
      </ul>
    ),
  },
  {
    id: 'conduct',
    content: (
      <ul className="list-disc ml-6 space-y-1">
        <li>Do not harass, threaten, or abuse other users.</li>
        <li>Do not post content that is harmful, illegal, hateful, or misleading.</li>
        <li>Do not use the platform for unauthorized advertising, spam, or fraudulent activities.</li>
      </ul>
    ),
  },
  {
    id: 'creation',
    content: (
      <p>
        Users can create and manage groups and events in accordance with our community standards. Content must remain respectful, inclusive, and free of discrimination or harmful intent.
      </p>
    ),
  },
  {
    id: 'ownership',
    content: (
      <ul className="list-disc ml-6 space-y-1">
        <li>You retain ownership of any content you create and share on the platform.</li>
        <li>By posting content, you grant Coffee Chat a non-exclusive license to use, display, and distribute it within the platform as part of providing our services.</li>
      </ul>
    ),
  },
  {
    id: 'termination',
    content: (
      <p>
        We reserve the right to suspend or permanently terminate your access to the platform if you violate these Terms, engage in abusive behavior, or otherwise jeopardize the integrity of the community.
      </p>
    ),
  },
  {
    id: 'modifications',
    content: (
      <p>
        These Terms may be updated from time to time to reflect changes in our services, legal requirements, or policies. Major updates will be communicated via email or the website.
      </p>
    ),
  },
  {
    id: 'contact',
    content: (
      <p>
        If you have any questions or concerns about these Terms, please contact us at:{' '}
        <a href="mailto:support@coffeechat.com" className="text-orange-600 underline">
          support@coffeechat.com
        </a>
      </p>
    ),
  },
];

const Terms = () => {
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
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">Terms of Service</h1>
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
          {termsContent.map((section, idx) => (
            <section
              key={section.id}
              id={section.id}
              className="bg-white rounded-lg shadow p-6"
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
              >
                <h3 className="text-xl font-semibold mb-2">{sections[idx].title}</h3>
                <span className="ml-2 text-orange-600">
                  {openSection === section.id ? '−' : '+'}
                </span>
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

export default Terms;
