function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
          <Icon size={22} />
        </div>
      )}

      <h3 className="text-sm font-semibold text-neutral-800">
        {title}
      </h3>

      <p className="mt-1.5 max-w-sm text-sm leading-5 text-neutral-400">
        {description}
      </p>

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default EmptyState;