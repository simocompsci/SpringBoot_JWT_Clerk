type StatusMessageProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function StatusMessage({
  title,
  description,
  actionLabel,
  onAction,
}: StatusMessageProps) {
  return (
    <div className="border border-neutral-200 bg-white px-6 py-12 text-center">
      <p className="text-base font-medium text-black">{title}</p>

      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-neutral-500">
          {description}
        </p>
      ) : null}

      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-black"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
