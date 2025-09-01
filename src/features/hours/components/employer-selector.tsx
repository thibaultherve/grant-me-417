import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Employer } from "@/features/employers/types";
import { cn } from "@/lib/utils";
import { ArrowRight, Building2, CheckCircle } from "lucide-react";

interface EmployerSelectorProps {
  employers: Employer[];
  selectedEmployer: Employer | null;
  onSelectEmployer: (employer: Employer) => void;
  onContinue?: () => void;
  loading?: boolean;
  className?: string;
}

const industryLabels: Record<string, string> = {
  plant_and_animal_cultivation: "Plant & Animal Cultivation",
  fishing_and_pearling: "Fishing & Pearling",
  tree_farming_and_felling: "Tree Farming & Felling",
  mining: "Mining",
  construction: "Construction",
  hospitality_and_tourism: "Hospitality & Tourism",
  bushfire_recovery_work: "Bushfire Recovery",
  critical_covid19_work: "Critical COVID-19 Work",
  other: "Other",
};

export function EmployerSelector({
  employers,
  selectedEmployer,
  onSelectEmployer,
  onContinue,
  loading = false,
  className,
}: EmployerSelectorProps) {
  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading employers...</p>
        </div>
      </div>
    );
  }

  if (employers.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <Card>
          <CardContent className="p-8 text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Employers Found</h3>
            <p className="text-muted-foreground mb-4">
              You need to add at least one employer before logging work hours.
            </p>
            <Button variant="outline" asChild>
              <a href="/app/employers">
                <Building2 className="w-4 h-4 mr-2" />
                Add Employer
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <h3 className="text-lg font-medium mb-2">Select Employer</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose the employer for whom you want to add work hours.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {employers.map((employer) => {
          const isSelected = selectedEmployer?.id === employer.id;

          return (
            <Card
              key={employer.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                isSelected
                  ? "ring-2 ring-primary border-primary shadow-md"
                  : "border hover:border-primary/50"
              )}
              onClick={() => onSelectEmployer(employer)}
            >
              <CardContent className="p-2">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-6 h-6 rounded flex items-center justify-center flex-shrink-0 transition-colors",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {isSelected ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <Building2 className="w-3 h-3" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm truncate">
                          {employer.name}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {industryLabels[employer.industry] ||
                            employer.industry}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {employer.is_eligible ? (
                          <Badge variant="default" className="text-xs h-5 px-2">
                            ✓
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="text-xs h-5 px-2"
                          >
                            ✗
                          </Badge>
                        )}
                        {isSelected && (
                          <ArrowRight className="w-3 h-3 text-primary" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {onContinue && (
        <div className="mt-4">
          <Button
            onClick={onContinue}
            disabled={!selectedEmployer}
            className="w-full"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
