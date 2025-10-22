import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Employer } from "@/features/employers/types";
import { cn } from "@/lib/utils";
import { ArrowRight, Building2, MapPin } from "lucide-react";

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
      <div className="space-y-2">
        <Label htmlFor="employer-select">Select Employer</Label>
        <Select
          value={selectedEmployer?.id || ""}
          onValueChange={(value) => {
            const employer = employers.find((e) => e.id === value);
            if (employer) {
              onSelectEmployer(employer);
            }
          }}
        >
          <SelectTrigger id="employer-select" className="w-full h-auto py-3">
            <SelectValue placeholder="Choose an employer">
              {selectedEmployer && (
                <div className="flex items-start gap-3 text-left">
                  <Building2 className="w-5 h-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {selectedEmployer.name}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {industryLabels[selectedEmployer.industry] ||
                        selectedEmployer.industry}
                      {selectedEmployer.postcode && (
                        <span> · {selectedEmployer.postcode}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {employers.map((employer) => (
              <SelectItem
                key={employer.id}
                value={employer.id}
                className="h-auto py-3"
              >
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="font-medium">{employer.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {industryLabels[employer.industry] || employer.industry}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>
                        {employer.postcode || "No postcode"}
                      </span>
                    </div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
