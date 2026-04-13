import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface LikertItemProps {
  form: UseFormReturn<any>;
  name: string;
  question: string;
  questionNumber: number;
  reversed?: boolean;
}

const LIKERT_LABELS = [
  "Never Me",
  "Rarely Me",
  "Sometimes Me",
  "Usually Me",
  "Always Me",
];

export const LikertItem = ({ form, name, question, questionNumber, reversed = false }: LikertItemProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="border border-border rounded-lg p-4 bg-background">
          <FormLabel className="text-base font-medium">
            {questionNumber}. {question}
            {reversed && (
              <span className="ml-2 text-xs text-orange-600 dark:text-orange-400 font-normal italic">
                (Reverse scored)
              </span>
            )}
          </FormLabel>
          <FormControl>
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-muted-foreground px-1">
                <span className="font-medium">Never Me</span>
                <span className="font-medium">Always Me</span>
              </div>
              <RadioGroup
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value?.toString()}
                className="grid grid-cols-5 gap-2"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <FormItem
                    key={value}
                    className="flex flex-col items-center space-y-2 space-x-0"
                  >
                    <FormControl>
                      <RadioGroupItem value={value.toString()} className="h-5 w-5" />
                    </FormControl>
                    <FormLabel className="text-xs text-center cursor-pointer leading-tight px-1">
                      <span className="font-semibold block">{value}</span>
                      <span className="text-muted-foreground text-[10px] block mt-1">{LIKERT_LABELS[value - 1]}</span>
                    </FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
