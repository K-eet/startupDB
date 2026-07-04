import type { LucideIcon } from 'lucide-react';

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border border-dashed border-border bg-secondary/40 px-7 py-12 flex flex-col items-center text-center">
      <div className="w-14 h-14 border border-border bg-muted flex items-center justify-center text-muted-foreground mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <p className="text-base font-bold tracking-tight mb-1.5">{title}</p>
      <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-5 last:mb-0">{body}</p>
      {action}
    </div>
  );
}
