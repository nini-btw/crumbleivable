"use client";

import * as React from "react";
import { PlusIcon, Trash2Icon, RotateCcwIcon, ChevronUpIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "@/presentation/components/ui/Button";
import { Input } from "@/presentation/components/ui/Input";
import { mockVoteCandidates } from "@/infrastructure/db/mock-data";

type SortField = "name" | "votes";
type SortDirection = "asc" | "desc";

export default function AdminVotesPage() {
  const [candidates, setCandidates] = React.useState(mockVoteCandidates);
  const [newCandidate, setNewCandidate] = React.useState("");
  const [sortField, setSortField] = React.useState<SortField>("votes");
  const [sortDirection, setSortDirection] = React.useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedCandidates = React.useMemo(() => {
    return [...candidates].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.cookieName.localeCompare(b.cookieName);
          break;
        case "votes":
          comparison = a.voteCount - b.voteCount;
          break;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [candidates, sortField, sortDirection]);

  const handleAdd = () => {
    if (!newCandidate.trim()) return;
    setCandidates([
      ...candidates,
      {
        id: Date.now().toString(),
        cookieName: newCandidate,
        description: "",
        imageUrl: "",
        voteCount: 0,
        isActive: true,
        createdAt: new Date(),
      },
    ]);
    setNewCandidate("");
  };

  const handleDelete = (id: string) => {
    setCandidates(candidates.filter((c) => c.id !== id));
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all votes?")) {
      setCandidates(candidates.map((c) => ({ ...c, voteCount: 0 })));
    }
  };

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      className="px-4 sm:px-6 py-3 text-left text-xs font-bold uppercase tracking-widest text-brown-400 cursor-pointer hover:text-brown-600 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === "asc" ? (
            <ChevronUpIcon className="w-4 h-4" />
          ) : (
            <ChevronDownIcon className="w-4 h-4" />
          )
        )}
      </div>
    </th>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-brown-900">Vote Management</h1>
          <p className="text-brown-400 mt-1">Manage community vote candidates</p>
        </div>
        <Button variant="danger" onClick={handleReset} className="cursor-pointer">
          <RotateCcwIcon className="w-4 h-4 mr-2" />
          Reset All Votes
        </Button>
      </div>

      {/* Add New Candidate */}
      <div className="bg-white rounded-3xl border border-brown-100 p-4 sm:p-6">
        <h2 className="font-bold text-brown-900 text-lg mb-4">Add Candidate</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Cookie name..."
            value={newCandidate}
            onChange={(e) => setNewCandidate(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleAdd} className="cursor-pointer">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {/* Candidates List */}
      <div className="bg-white rounded-3xl border border-brown-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[400px]">
            <thead className="bg-sand/50">
              <tr>
                <SortHeader field="name">Cookie Name</SortHeader>
                <SortHeader field="votes">Votes</SortHeader>
                <th className="px-4 sm:px-6 py-3 text-right text-xs font-bold uppercase tracking-widest text-brown-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brown-100">
              {sortedCandidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-pink-50/50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 font-medium text-brown-900">
                    {candidate.cookieName}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-700 tabular-nums">
                      {candidate.voteCount} votes
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDelete(candidate.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2Icon className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
