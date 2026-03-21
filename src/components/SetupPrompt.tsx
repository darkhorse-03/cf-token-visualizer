import { KeyRound, Building2 } from "lucide-react";

export function SetupPrompt() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="card bg-base-100 shadow-xl w-full max-w-lg">
        <div className="card-body items-center text-center gap-4">
          <h2 className="card-title text-xl">Welcome to CF Visualizer</h2>
          <p className="text-base-content/50 text-sm">
            To get started, add a personal Cloudflare API token or create an organization.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              className="btn btn-outline flex-1 gap-2"
              onClick={() =>
                (document.getElementById("add-token-modal") as HTMLDialogElement)?.showModal()
              }
            >
              <KeyRound className="size-4" />
              Add Personal Token
            </button>
            <button
              className="btn btn-primary flex-1 gap-2"
              onClick={() =>
                (document.getElementById("create-org-modal") as HTMLDialogElement)?.showModal()
              }
            >
              <Building2 className="size-4" />
              Create Organization
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
