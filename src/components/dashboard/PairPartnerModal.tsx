"use client";

import { useState, FormEvent } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function PairPartnerModal({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to pair");
        return;
      }
      window.location.reload();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-1">Pair with partner</h2>
        <p className="text-sm text-gray-500 mb-5">Enter your partner&apos;s invite code to connect</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="code"
            label="Invite code"
            placeholder="e.g. A3F2B9C1"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={8}
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Pairing…" : "Pair up"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
