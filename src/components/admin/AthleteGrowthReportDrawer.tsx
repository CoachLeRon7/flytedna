import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { AthleteGrowthReport } from "./AthleteGrowthReport";

interface AthleteGrowthReportDrawerProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AthleteGrowthReportDrawer({
  userId,
  open,
  onOpenChange,
}: AthleteGrowthReportDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Athlete Growth Report</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto">
          {userId && <AthleteGrowthReport userId={userId} />}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
