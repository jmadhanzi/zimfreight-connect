import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/git-status")({
  head: () => ({
    meta: [
      { title: "GitHub Sync Status — ZimFreight" },
      {
        name: "description",
        content: "View GitHub sync status and the last synced commit for this project.",
      },
    ],
  }),
  component: GitStatusPage,
});

type Commit = {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { name: string; email: string; date: string };
  };
  author: { login: string; avatar_url: string; html_url: string } | null;
};

const STORAGE_KEY = "git-status:repo";

function GitStatusPage() {
  const [repo, setRepo] = useState("");
  const [branch, setBranch] = useState("main");
  const [commit, setCommit] = useState<Commit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved?.repo) {
        setRepo(saved.repo);
        setBranch(saved.branch || "main");
      }
    } catch {}
  }, []);

  async function fetchCommit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!repo.includes("/")) {
      setError("Repo must be in the form owner/repo (e.g. your-name/zimfreight).");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.github.com/repos/${repo}/commits/${encodeURIComponent(branch)}`,
        { headers: { Accept: "application/vnd.github+json" } }
      );
      if (!res.ok) {
        if (res.status === 404) throw new Error("Repository or branch not found (or it's private).");
        if (res.status === 403) throw new Error("GitHub rate limit reached. Try again later.");
        throw new Error(`GitHub API error (${res.status}).`);
      }
      const data = (await res.json()) as Commit;
      setCommit(data);
      setFetchedAt(new Date());
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ repo, branch }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch commit.");
      setCommit(null);
    } finally {
      setLoading(false);
    }
  }

  const ageMinutes = commit
    ? Math.round((Date.now() - new Date(commit.commit.author.date).getTime()) / 60000)
    : null;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight">GitHub Sync Status</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Lovable syncs bidirectionally with GitHub in real time. This page shows the latest commit
        on your tracked branch as reported by GitHub.
      </p>

      <Card className="mt-6 p-5">
        <form onSubmit={fetchCommit} className="grid gap-4 sm:grid-cols-[2fr_1fr_auto] sm:items-end">
          <div>
            <Label htmlFor="repo">Repository (owner/repo)</Label>
            <Input
              id="repo"
              value={repo}
              onChange={(e) => setRepo(e.target.value.trim())}
              placeholder="your-name/zimfreight"
              required
            />
          </div>
          <div>
            <Label htmlFor="branch">Branch</Label>
            <Input
              id="branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value.trim())}
              placeholder="main"
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? "Checking…" : "Check"}
          </Button>
        </form>
        <p className="mt-3 text-xs text-muted-foreground">
          Public repos only. Private repos return 404 from the unauthenticated GitHub API.
        </p>
      </Card>

      {error && (
        <Card className="mt-4 border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </Card>
      )}

      {commit && (
        <Card className="mt-6 p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{branch}</Badge>
              <Badge>
                {ageMinutes !== null && ageMinutes < 60
                  ? `Synced ${ageMinutes}m ago`
                  : ageMinutes !== null && ageMinutes < 1440
                    ? `Synced ${Math.round(ageMinutes / 60)}h ago`
                    : `Synced ${Math.round((ageMinutes ?? 0) / 1440)}d ago`}
              </Badge>
            </div>
            <a
              href={commit.html_url}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-sm text-primary hover:underline"
            >
              {commit.sha.slice(0, 7)}
            </a>
          </div>

          <p className="mt-4 whitespace-pre-wrap text-base font-medium">
            {commit.commit.message.split("\n")[0]}
          </p>

          <div className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
            {commit.author?.avatar_url && (
              <img
                src={commit.author.avatar_url}
                alt={commit.author.login}
                className="h-8 w-8 rounded-full"
              />
            )}
            <div>
              <div className="font-medium text-foreground">
                {commit.author?.login || commit.commit.author.name}
              </div>
              <div className="text-xs">
                {new Date(commit.commit.author.date).toLocaleString()}
              </div>
            </div>
          </div>

          {fetchedAt && (
            <p className="mt-4 text-xs text-muted-foreground">
              Checked at {fetchedAt.toLocaleTimeString()}.
            </p>
          )}
        </Card>
      )}

      <Card className="mt-6 p-5 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">About sync status</p>
        <p className="mt-2">
          This page reads the latest commit directly from GitHub's public API. If you've connected
          your repo to Lovable via the Plus (+) menu → GitHub, changes you push appear here within
          seconds, and changes made in Lovable are pushed to this same branch automatically.
        </p>
      </Card>
    </div>
  );
}