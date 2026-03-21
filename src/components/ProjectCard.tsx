import { Link } from "@tanstack/react-router";
import { FolderOpen, Share2 } from "lucide-react";

interface ProjectCardProps {
  id: string;
  name: string;
  shared: boolean;
  resourceCount?: number;
}

export function ProjectCard({ id, name, shared, resourceCount }: ProjectCardProps) {
  return (
    <Link
      to="/dashboard/projects/$id"
      params={{ id }}
      className="card bg-base-100 shadow hover:shadow-md transition-shadow cursor-pointer no-underline"
    >
      <div className="card-body p-4 gap-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <FolderOpen className="size-4 text-primary" />
            {name}
          </h3>
          {shared && (
            <span className="badge badge-xs badge-outline gap-1">
              <Share2 className="size-2.5" />
              shared
            </span>
          )}
        </div>
        {resourceCount !== undefined && (
          <p className="text-xs text-base-content/50">
            {resourceCount} {resourceCount === 1 ? "resource" : "resources"}
          </p>
        )}
      </div>
    </Link>
  );
}
