'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { Tab } from '@headlessui/react';
import { motion } from 'framer-motion';
import MemberTable from '@/components/cms/MemberTable';
import EmailSignupTable from '@/components/cms/EmailSignupTable';
import PartnerTable from '@/components/cms/PartnerTable';
import PointSubmissionsTable from '@/components/cms/PointSubmissionsTable';
import OfficerManager from '@/components/cms/OfficerManager';
import EventManager from '@/components/cms/EventManager';
import HeroManager from '@/components/cms/HeroManager';
import ApplicationSettings from '@/components/cms/ApplicationSettings';
import MemberApplicationsTable from '@/components/cms/MemberApplicationsTable';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

type TabItem = {
  name: string;
} & (
  | { type: 'function'; component: () => React.ReactNode }
  | { type: 'component'; component: React.ComponentType }
);

export default function CMSDashboard() {
  const { user, loading, logOut } = useAuth();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  const tabs: TabItem[] = [
    { 
      name: 'Members',
      type: 'function', 
      component: () => (
        <div className="space-y-8">
          <MemberApplicationsTable />
          <MemberTable />
        </div>
      )
    },
    { name: 'Point Submissions', type: 'component', component: PointSubmissionsTable },
    { name: 'Email Signups', type: 'component', component: EmailSignupTable },
    { name: 'Partner Requests', type: 'component', component: PartnerTable },
    { name: 'Officers', type: 'component', component: OfficerManager },
    { name: 'Events', type: 'component', component: EventManager },
    { name: 'Hero Images', type: 'component', component: HeroManager },
    { name: 'Settings', type: 'component', component: ApplicationSettings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl sm:text-2xl font-semibold text-brand-dark">CMS Dashboard</h1>
            <button
              onClick={() => logOut()}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary rounded-lg transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <div className="bg-white rounded-lg shadow-sm p-2 mb-8 overflow-x-auto">
            <Tab.List className="flex space-x-1 min-w-max">
              {tabs.map((tab) => (
                <Tab
                  key={tab.name}
                  className={({ selected }) =>
                    classNames(
                      'px-4 py-2.5 text-sm font-medium leading-5 rounded-lg whitespace-nowrap',
                      'ring-white/60 ring-offset-2 ring-offset-brand-primary focus:outline-none focus:ring-2',
                      'transition-all duration-200',
                      selected
                        ? 'bg-brand-primary text-white shadow'
                        : 'text-brand-dark/70 hover:bg-brand-primary/10 hover:text-brand-dark'
                    )
                  }
                >
                  {tab.name}
                </Tab>
              ))}
            </Tab.List>
          </div>
          <Tab.Panels>
            {tabs.map((tab, idx) => (
              <Tab.Panel
                key={idx}
                className="rounded-xl bg-white p-4 sm:p-6 shadow-sm"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {tab.type === 'function' ? tab.component() : <tab.component />}
                </motion.div>
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
} 