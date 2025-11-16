import { UseFormReturn } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface ReflectionsSectionProps {
  form: UseFormReturn<any>;
}

export const ReflectionsSection = ({ form }: ReflectionsSectionProps) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Reflections
        </h2>
        <p className="text-muted-foreground">
          These open-ended questions help you reflect deeply on your leadership journey.
          Your responses are optional but encouraged for maximum growth.
        </p>
      </div>

      <FormField
        control={form.control}
        name="reflections.habits_gap"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              What gap exists between your daily habits and the leader you aspire to become? (max 2000 characters)
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Reflect on the difference between your current routines and where you want to be..."
                className="min-h-[120px]"
                maxLength={2000}
                {...field}
              />
            </FormControl>
            <FormDescription className="flex justify-between items-center">
              <span>Consider specific habits you could develop or change</span>
              <span className="text-right">{field.value?.length || 0}/2000 characters</span>
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="reflections.lead_from_discomfort"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              When was the last time you led from a place of discomfort? What did you learn? (max 2000 characters)
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe a challenging leadership moment and what it taught you..."
                className="min-h-[120px]"
                maxLength={2000}
                {...field}
              />
            </FormControl>
            <FormDescription className="flex justify-between items-center">
              <span>Growth often happens outside our comfort zone</span>
              <span className="text-right">{field.value?.length || 0}/2000 characters</span>
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="reflections.who_challenges_you"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Who challenges you to be better, and how do you respond to their feedback? (max 2000 characters)
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Think about mentors, coaches, or teammates who push you to grow..."
                className="min-h-[120px]"
                maxLength={2000}
                {...field}
              />
            </FormControl>
            <FormDescription className="flex justify-between items-center">
              <span>Strong leaders seek and value constructive criticism</span>
              <span className="text-right">{field.value?.length || 0}/2000 characters</span>
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="reflections.legacy"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              What legacy do you want to leave through your leadership? (max 2000 characters)
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder="Envision the lasting impact you want to have on your team and community..."
                className="min-h-[120px]"
                maxLength={2000}
                {...field}
              />
            </FormControl>
            <FormDescription className="flex justify-between items-center">
              <span>Define the mark you want to leave</span>
              <span className="text-right">{field.value?.length || 0}/2000 characters</span>
            </FormDescription>
          </FormItem>
        )}
      />
    </div>
  );
};
