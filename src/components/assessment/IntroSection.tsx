import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface IntroSectionProps {
  form: UseFormReturn<any>;
}

export const IntroSection = ({ form }: IntroSectionProps) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Welcome to the FLDI Assessment
        </h2>
        <p className="text-muted-foreground mb-6">
          This assessment will help you understand your leadership development across five key domains.
          Please answer honestly – there are no right or wrong answers. Your growth depends on accurate self-reflection.
        </p>
      </div>

      <FormField
        control={form.control}
        name="semester_label"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Semester Label *</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Fall 2025" {...field} />
            </FormControl>
            <FormDescription>
              Enter the current semester (e.g., "Fall 2025" or "Spring 2025")
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="timepoint"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Assessment Timepoint *</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-2"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="pre" />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    Pre-semester (Beginning of semester)
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="mid" />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    Mid-semester (Middle of semester)
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="end" />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    End-semester (End of semester)
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
        <h3 className="font-semibold text-foreground mb-2">Assessment Guidelines</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Take your time with each question</li>
          <li>• Answer based on your current reality, not where you want to be</li>
          <li>• Use the full 1-5 scale (1 = Strongly Disagree, 5 = Strongly Agree)</li>
          <li>• Your honest answers help us provide better coaching</li>
        </ul>
      </div>
    </div>
  );
};
