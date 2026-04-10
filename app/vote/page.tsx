"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckIcon, TrendingUpIcon } from "lucide-react";
import { Button } from "@/presentation/components/ui/Button";
import { Badge } from "@/presentation/components/ui/Badge";
import type { VoteCandidate } from "@/domain/entities/vote";
import { staggerContainer, gridItem } from "@/presentation/lib/animations";

export default function VotePage() {
  const [candidates, setCandidates] = useState<VoteCandidate[]>([]);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  // Fetch candidates from API
  useEffect(() => {
    async function fetchCandidates() {
      try {
        const response = await fetch("/api/votes");
        const result = await response.json();
        if (result.success) {
          setCandidates(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch candidates:", error);
      } finally {
        setPageLoading(false);
      }
    }
    fetchCandidates();
  }, []);

  // Load user votes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("userVotes");
    if (saved) {
      setUserVotes(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save user votes to localStorage
  useEffect(() => {
    localStorage.setItem("userVotes", JSON.stringify([...userVotes]));
  }, [userVotes]);

  const handleVote = async (candidateId: string) => {
    if (userVotes.has(candidateId)) return;

    setIsLoading(candidateId);

    try {
      // Call API to cast vote
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === candidateId ? { ...c, voteCount: c.voteCount + 1 } : c
          )
        );
        setUserVotes((prev) => new Set([...prev, candidateId]));
      } else {
        alert(result.error || "Failed to cast vote");
      }
    } catch (error) {
      console.error("Failed to vote:", error);
      alert("Failed to cast vote. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#A07850]">Loading vote candidates...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-[#F0E6D6]/30 py-16">
        <div className="mx-auto w-full px-4 sm:px-8 lg:px-12 max-w-[1400px]">
          <div className="max-w-2xl mx-auto text-center">
            <Badge variant="pink" className="mb-4">
              <TrendingUpIcon className="w-3 h-3 mr-1" />
              Community Vote
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl text-[#2C1810] mb-4">
              Bring It Back!
            </h1>
            <p className="text-[#A07850]">
              Vote for your favorite retired flavors. The most popular cookies
              might make a comeback!
            </p>
          </div>
        </div>
      </section>

      {/* Candidates */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto w-full px-4 sm:px-8 lg:px-12 max-w-[1400px]">
          {candidates.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#A07850] text-lg">No vote candidates yet. Check back soon!</p>
            </div>
          ) : (
            <>
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {candidates.map((candidate, index) => {
                  const hasVoted = userVotes.has(candidate.id);
                  const percentage =
                    totalVotes > 0
                      ? Math.round((candidate.voteCount / totalVotes) * 100)
                      : 0;

                  return (
                    <motion.div
                      key={candidate.id}
                      variants={gridItem}
                      className="bg-white rounded-3xl shadow-[0_2px_12px_rgba(44,24,16,0.08)] overflow-hidden"
                    >
                      <div className="relative aspect-square bg-[#FFF0F5] flex items-center justify-center text-6xl">
                        🍪
                        {hasVoted && (
                          <div className="absolute inset-0 bg-[#F4538A]/20 flex items-center justify-center">
                            <div className="bg-white rounded-full p-3 shadow-lg">
                              <CheckIcon className="w-6 h-6 text-[#F4538A]" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <h3 className="font-bold text-[#2C1810] text-lg mb-1">
                          {candidate.cookieName}
                        </h3>
                        <p className="text-[#A07850] text-sm mb-4">
                          {candidate.description}
                        </p>

                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-[#A07850] mb-1">
                            <span>{candidate.voteCount} votes</span>
                            <span>{percentage}%</span>
                          </div>
                          <div className="h-2 bg-[#F0E6D6] rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-[#F4538A] rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                            />
                          </div>
                        </div>

                        <Button
                          variant={hasVoted ? "ghost" : "primary"}
                          fullWidth
                          disabled={hasVoted}
                          isLoading={isLoading === candidate.id}
                          onClick={() => handleVote(candidate.id)}
                          className="cursor-pointer"
                        >
                          {hasVoted ? "Voted!" : "Vote"}
                        </Button>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              <p className="text-center text-[#A07850] mt-10">
                {totalVotes.toLocaleString()} total votes cast
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
