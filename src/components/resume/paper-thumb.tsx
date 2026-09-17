import type { TemplateId } from "@/lib/resume/types";
import { cn } from "@/lib/cn";

function Bar({
  w = "100%",
  h = "h-[3px]",
  tone = "muted",
}: {
  w?: string;
  h?: string;
  tone?: "ink" | "muted" | "faint" | "accent";
}) {
  const bg =
    tone === "ink"
      ? "bg-ink"
      : tone === "accent"
        ? "bg-vermilion/70"
        : tone === "faint"
          ? "bg-ink/10"
          : "bg-ink/20";
  return <span className={cn("block rounded-[1px]", h, bg)} style={{ width: w }} />;
}

function Lines({ n, last }: { n: number; last?: string }) {
  return (
    <div className="flex flex-col gap-[5px]">
      {Array.from({ length: n }, (_, i) => (
        <Bar key={i} w={i === n - 1 ? (last ?? "72%") : "100%"} tone="faint" />
      ))}
    </div>
  );
}

function JobBlock() {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-4">
        <Bar w="46%" h="h-[4px]" tone="ink" />
        <Bar w="18%" h="h-[3px]" tone="muted" />
      </div>
      <Bar w="32%" h="h-[3px]" tone="muted" />
      <Lines n={3} last="64%" />
    </div>
  );
}

function LetterThumb() {
  return (
    <div className="flex h-full flex-col gap-3 p-[14%] pt-[16%]">
      <Bar w="54%" h="h-2" tone="ink" />
      <Bar w="40%" h="h-[3px]" tone="muted" />
      <span className="mt-1 block h-px w-full bg-vermilion/50" />
      <Bar w="16%" h="h-[3px]" tone="accent" />
      <Lines n={3} />
      <Bar w="20%" h="h-[3px]" tone="accent" />
      <JobBlock />
      <JobBlock />
    </div>
  );
}

function CompactThumb() {
  return (
    <div className="flex h-full flex-col gap-2 p-[10%] pt-[12%]">
      <Bar w="48%" h="h-1.5" tone="ink" />
      <Bar w="36%" h="h-[2px]" tone="muted" />
      <span className="block h-px w-full bg-ink/15" />
      <Lines n={2} last="80%" />
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex flex-col gap-1">
          <Bar w="42%" h="h-[3px]" tone="ink" />
          <Lines n={3} last="70%" />
        </div>
      ))}
    </div>
  );
}

function ExecThumb() {
  return (
    <div className="flex h-full flex-col">
      <div className="bg-night px-[12%] py-[14%]">
        <span className="block h-2 w-[58%] rounded-[1px] bg-white/80" />
        <span className="mt-2 block h-[3px] w-[36%] rounded-[1px] bg-white/35" />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-[12%]">
        <Bar w="18%" h="h-[3px]" tone="accent" />
        <Lines n={3} />
        <Bar w="22%" h="h-[3px]" tone="accent" />
        <JobBlock />
      </div>
    </div>
  );
}

function EditThumb() {
  return (
    <div className="flex h-full flex-col gap-3 bg-cream p-[14%] pt-[12%]">
      <Bar w="72%" h="h-3" tone="ink" />
      <Bar w="44%" h="h-[3px]" tone="muted" />
      <span className="mt-1 block h-px w-full bg-vermilion/50" />
      <Bar w="18%" h="h-[3px]" tone="accent" />
      <Lines n={4} last="55%" />
      <Bar w="22%" h="h-[3px]" tone="accent" />
      <JobBlock />
    </div>
  );
}

function SideThumb() {
  return (
    <div className="grid h-full grid-cols-[0.34fr_0.66fr]">
      <div className="flex flex-col gap-2 bg-cream px-[18%] py-[22%]">
        <Bar w="80%" h="h-[3px]" tone="accent" />
        <Lines n={4} last="60%" />
        <Bar w="70%" h="h-[3px]" tone="accent" />
        <Lines n={3} last="50%" />
      </div>
      <div className="flex flex-col gap-2.5 px-[12%] py-[16%]">
        <Bar w="20%" h="h-[3px]" tone="accent" />
        <JobBlock />
        <JobBlock />
      </div>
    </div>
  );
}

function ClassicThumb() {
  return (
    <div className="flex h-full flex-col items-center gap-2.5 p-[14%] pt-[16%]">
      <Bar w="48%" h="h-2" tone="ink" />
      <Bar w="36%" h="h-[3px]" tone="muted" />
      <span className="mt-1 block h-px w-full bg-ink/25" />
      <span className="block h-px w-full bg-ink/10" />
      <div className="w-full">
        <Bar w="16%" h="h-[3px]" tone="accent" />
      </div>
      <div className="w-full">
        <Lines n={3} />
      </div>
      <div className="w-full">
        <JobBlock />
      </div>
    </div>
  );
}

export function PaperThumb({
  template,
  className,
}: {
  template: TemplateId;
  className?: string;
}) {
  return (
    <div data-template={template} className={cn("paper-thumb", className)} aria-hidden>
      {template === "compact" ? (
        <CompactThumb />
      ) : template === "executive" ? (
        <ExecThumb />
      ) : template === "editorial" ? (
        <EditThumb />
      ) : template === "sidebar" ? (
        <SideThumb />
      ) : template === "classic" ? (
        <ClassicThumb />
      ) : (
        <LetterThumb />
      )}
    </div>
  );
}
