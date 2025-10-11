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
}

const LIKERT_LABELS = [
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree",
];

export const LikertItem = ({ form, name, question, questionNumber }: LikertItemProps) => {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="border border-border rounded-lg p-4 bg-background">
          <FormLabel className="text-base font-medium">
            {questionNumber}. {question}
          </FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={(value) => field.onChange(Number(value))}
              value={field.value?.toString()}
              className="flex flex-col md:flex-row md:justify-between gap-3 mt-4"
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <FormItem
                  key={value}
                  className="flex flex-col items-center space-y-2 space-x-0"
                >
                  <FormControl>
                    <RadioGroupItem value={value.toString()} />
                  </FormControl>
                  <FormLabel className="text-xs text-muted-foreground font-normal text-center cursor-pointer">
                    {value}
                    <br />
                    <span className="hidden md:inline">{LIKERT_LABELS[value - 1]}</span>
                  </FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <div className="md:hidden flex justify-between text-xs text-muted-foreground mt-2">
            <span>Strongly Disagree</span>
            <span>Strongly Agree</span>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
