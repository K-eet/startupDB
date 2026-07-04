'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Clock } from 'lucide-react';
import {
  eventCategoryOrder,
  categoryBarClass,
  categoryDotClass,
  categorySolidClass,
  type Affiliation,
  type EventCategory,
  type EventType,
} from '@/lib/events-data';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { authedFetch, errorMessage } from '@/lib/api-client';

const SELF_VALUE = '__self__';

export function PostEventDialog({
  open,
  onOpenChange,
  editing,
  affiliations,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing: EventType | null;
  affiliations: Affiliation[];
  onSaved: () => void;
}) {
  const isEdit = !!editing;
  const affiliated = affiliations.length > 0;
  const { user } = useAuth();
  const { toast } = useToast();
  const selfName = user?.displayName ?? user?.email ?? 'yourself';

  const [title, setTitle] = React.useState('');
  const [date, setDate] = React.useState('');
  const [time, setTime] = React.useState('');
  const [location, setLocation] = React.useState('');
  const [category, setCategory] = React.useState<EventCategory>('Meetup');
  const [tags, setTags] = React.useState('');
  const [postAs, setPostAs] = React.useState(SELF_VALUE);
  const [touched, setTouched] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Reset the form whenever the dialog opens (new or edit).
  React.useEffect(() => {
    if (!open) return;
    setTitle(editing?.title ?? '');
    setDate(editing?.date ?? '');
    setTime(editing?.time ?? '');
    setLocation(editing?.location ?? '');
    setCategory(editing?.category ?? 'Meetup');
    setTags((editing?.tags ?? []).join(', '));
    const match = editing?.companySlug ?? (editing?.org ? affiliations.find((a) => a.name === editing.org)?.id : undefined);
    setPostAs(match ?? (affiliations[0]?.id ?? SELF_VALUE));
    setTouched(false);
    setSaving(false);
  }, [open, editing, affiliations]);

  const valid = title.trim() && date && time.trim() && location.trim();

  async function submit() {
    setTouched(true);
    if (!valid) return;
    setSaving(true);
    const payload = {
      title: title.trim(),
      date,
      time: time.trim(),
      location: location.trim(),
      online: /online/i.test(location),
      category,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      companySlug: postAs === SELF_VALUE ? undefined : postAs,
    };
    try {
      const res = isEdit
        ? await authedFetch(`/api/events/${editing!.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
        : await authedFetch('/api/events', { method: 'POST', body: JSON.stringify(payload) });
      if (!res.ok) {
        toast({ title: 'Could not save event', description: await errorMessage(res), variant: 'destructive' });
        setSaving(false);
        return;
      }
      if (isEdit) {
        toast({ title: 'Event updated', description: title.trim() });
      } else {
        const { status } = (await res.json()) as { status: 'live' | 'pending_review' };
        if (status === 'live') {
          toast({ title: 'Event published', description: "It's now live on the Events page." });
        } else {
          toast({ title: 'Submitted for review', description: 'An admin will approve it before it goes live.' });
        }
      }
      onSaved();
      onOpenChange(false);
    } catch {
      toast({ title: 'Could not save event', description: 'Please try again.', variant: 'destructive' });
      setSaving(false);
    }
  }

  const invalidCls = (bad: boolean) => (bad ? 'border-destructive' : '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0 overflow-hidden">
        <div className={`h-1 ${categoryBarClass[category]} transition-colors`} />
        <div className="p-6">
          <DialogHeader>
            <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {isEdit ? 'Edit event' : 'Post an event'}
            </DialogDescription>
            <DialogTitle className="text-xl tracking-tight">
              {isEdit ? editing!.title : 'Add an event'}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            {/* Post as */}
            {affiliated ? (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide">Post as</Label>
                <Select value={postAs} onValueChange={setPostAs}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SELF_VALUE}>Yourself ({selfName})</SelectItem>
                    {affiliations.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground leading-snug">
                  Posting as a company publishes <span className="text-foreground font-medium">instantly</span> and shows in the attribution tag.
                </p>
              </div>
            ) : (
              <div className="flex gap-2.5 items-start border border-border bg-muted p-3">
                <Clock className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You&apos;re posting as <span className="text-foreground font-medium">{selfName}</span>. Since you&apos;re not on a company, this goes to the{' '}
                  <span className="text-foreground font-medium">moderation queue</span> for review before it&apos;s live.
                </p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide">
                Event title <span className="text-destructive">*</span>
              </Label>
              <Input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fintech Founders Breakfast"
                className={invalidCls(touched && !title.trim())}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={invalidCls(touched && !date)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide">
                  Time <span className="text-destructive">*</span>
                </Label>
                <Input value={time} onChange={(e) => setTime(e.target.value)} placeholder="6:00pm – 9:00pm" className={invalidCls(touched && !time.trim())} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide">
                Location <span className="text-destructive">*</span>
              </Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Venue, city — or 'Online'" className={invalidCls(touched && !location.trim())} />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide">
                Category <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {eventCategoryOrder.map((c) => {
                  const on = category === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border transition-colors ${
                        on ? `${categorySolidClass[c]} border-transparent font-bold` : 'border-border text-foreground hover:bg-muted'
                      }`}
                    >
                      {!on && <span className={`h-2 w-2 rounded-full ${categoryDotClass[c]}`} />}
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wide">Tags</Label>
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Comma separated — e.g. Fintech, Free" />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={submit} disabled={saving || !valid}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? 'Saving…' : isEdit ? 'Save changes' : affiliated ? 'Publish event' : 'Submit for review'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
