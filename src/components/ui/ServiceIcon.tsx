import { Briefcase, Building2, FileText, Users } from "lucide-react";
import type { ServiceIcon as IconName } from "@content/services";
import { cn } from "@/lib/utils";

const icons = { users: Users, briefcase: Briefcase, building: Building2, "file-text": FileText } as const;

export const ServiceIcon = ({ name, className }: { name: IconName; className?: string }) => {
  const Icon = icons[name];
  return <Icon aria-hidden strokeWidth={1.25} className={cn("size-7", className)} />;
};
