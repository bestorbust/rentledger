import { AlertTriangle, X } from "lucide-react";

function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between px-6 pt-6">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              danger
                ? "bg-red-50 text-red-600"
                : "bg-[#f9e9e4] text-[#b9563e]"
            }`}
          >
            <AlertTriangle size={19} />
          </div>

          <button
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-50 hover:text-neutral-700"
          >
            <X size={17} />
          </button>
        </div>

        <div className="px-6 pb-6 pt-4">
          <h2 className="text-base font-semibold text-neutral-900">
            {title}
          </h2>

          <p className="mt-2 text-sm leading-6 text-neutral-500">
            {description}
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onCancel}
              className="rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-50"
            >
              {cancelText}
            </button>

            <button
              onClick={onConfirm}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white ${
                danger
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-neutral-900 hover:bg-neutral-800"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;