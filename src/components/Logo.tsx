import Image from "next/image";
import { cn } from "@/lib/utils";

const sizes = {
  sm: { box: "h-8 w-8", px: 32 },
  md: { box: "h-9 w-9", px: 36 },
  lg: { box: "h-10 w-10", px: 40 },
  xl: { box: "h-14 w-14", px: 56 },
} as const;

export function Logo({
  size = "md",
  className,
}: {
  size?: keyof typeof sizes;
  className?: string;
}) {
  const { box, px } = sizes[size];

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-xl",
        box,
        className
      )}
    >
      <Image
        src="/images/idevio-logo.png"
        alt="Idevio logo"
        width={px}
        height={px}
        className="h-full w-full object-cover"
        priority
      />
    </div>
  );
}
