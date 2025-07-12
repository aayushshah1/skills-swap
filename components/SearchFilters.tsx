'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SearchFilters({ filters, setFilters }: {
  filters: { skill: string, availability: string },
  setFilters: (f: any) => void
}) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex flex-col">
        <Label>Search by Skill</Label>
        <Input
          placeholder="e.g. Photoshop"
          value={filters.skill}
          onChange={(e) => setFilters({ ...filters, skill: e.target.value })}
        />
      </div>
      <div className="flex flex-col">
        <Label>Availability</Label>
        <Select
          value={filters.availability}
          onValueChange={(val) => setFilters({ ...filters, availability: val })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="weekdays">Weekdays</SelectItem>
            <SelectItem value="weekends">Weekends</SelectItem>
            <SelectItem value="evenings">Evenings</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
