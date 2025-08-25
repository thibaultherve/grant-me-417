import { EmployersList } from '@/features/employers/components/employers-list';

export const EmployersRoute = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Employers</h1>
        <p className="text-muted-foreground">
          Manage your employers and their information
        </p>
      </div>
      <EmployersList />
    </div>
  );
};