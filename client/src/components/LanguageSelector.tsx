import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LANGUAGES, LANGUAGE_NAMES } from "@/types/speech-services";

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  includeAuto?: boolean;
  label?: string;
}

export const LanguageSelector = ({ value, onChange, includeAuto = true, label = "Language" }: LanguageSelectorProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(LANGUAGES)
          .filter(([key]) => includeAuto || key !== 'auto')
          .map(([key, value]) => (
            <SelectItem key={key} value={key}>
              {LANGUAGE_NAMES[key as keyof typeof LANGUAGE_NAMES]}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
};

export function VoiceSelector({
  value,
  onChange,
  label = "Voice",
  className = ""
}: Omit<LanguageSelectorProps, 'includeAutoDetect'>) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-sm font-medium">{label}</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a voice" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(LANGUAGE_NAMES).map(([language, name]) => {
            if (language === 'auto') return null;
            return (
              <SelectItem key={language} value={language}>
                {name} Voice
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
} 