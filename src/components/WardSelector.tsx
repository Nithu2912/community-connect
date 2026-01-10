import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin } from 'lucide-react';

interface WardSelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const wards = [
  { id: 'ward-32', name: 'Ward 32-Warje popular Nagar' },
  { id: 'ward-33', name: 'Ward 33-Shivne Khadakwasla' },
  { id: 'ward-34', name: 'Ward 34-Narhe Wadgaon Budruk' },
  { id: 'ward-35', name: 'Ward 35-Suncity-Manik Baug' },
  { id: 'ward-36', name: 'Ward 36-Sahkarnagar Padmavati' },
  { id: 'ward-37', name: 'Ward 37-Dhankawadi Katraj Dairy' },
  { id: 'ward-38', name: 'Ward 38-Ambegaon Katraj' },
  { id: 'ward-39', name: 'Ward 39-Upper Super Indiranagar' },
];

export function WardSelector({ value, onChange, placeholder = "Select your ward", className }: WardSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className}>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder={placeholder} />
        </div>
      </SelectTrigger>
      <SelectContent>
        {wards.map((ward) => (
          <SelectItem key={ward.id} value={ward.id}>
            {ward.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { wards };