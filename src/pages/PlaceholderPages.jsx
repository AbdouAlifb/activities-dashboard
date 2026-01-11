import React from 'react';
import Card, { CardTitle, CardDescription } from '../components/Card';
import { Construction } from 'lucide-react';

const PlaceholderPage = ({ title, description }) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
      <Card className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
          <Construction className="w-8 h-8 text-slate-400" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="mt-2">
          {description || 'This page is a placeholder for demonstration purposes. The actual content would be implemented based on your specific requirements.'}
        </CardDescription>
      </Card>
    </div>
  );
};

// KPIs Pages
export const KpisOverviewPage = () => (
  <PlaceholderPage 
    title="KPIs Overview" 
    description="View and analyze key performance indicators for your activities and bookings."
  />
);

export const KpisEditPage = () => (
  <PlaceholderPage 
    title="KPIs Edit" 
    description="Configure and modify KPI targets and thresholds."
  />
);

// Reports Pages
export const MonthlyReportsPage = () => (
  <PlaceholderPage 
    title="Monthly Reports" 
    description="Access and generate monthly performance and claims reports."
  />
);

export const AnnualReportsPage = () => (
  <PlaceholderPage 
    title="Annual Reports" 
    description="View comprehensive annual summaries and analytics."
  />
);

// Claims Pages
export const ViewClaimsPage = () => (
  <PlaceholderPage 
    title="View Claims" 
    description="Browse and search through all submitted claims."
  />
);

export const ProcessClaimsPage = () => (
  <PlaceholderPage 
    title="Process Claims" 
    description="Review, approve, or reject pending claims."
  />
);

export default PlaceholderPage;
