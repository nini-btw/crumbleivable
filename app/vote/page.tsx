"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckIcon, TrendingUpIcon, ImageIcon } from "lucide-react";
import { Button } from "@/presentation/components/ui/Button";
import { Badge } from "@/presentation/components/ui/Badge";
import { useTranslations } from 'next-intl';
import type { VoteCandidate } from "@/domain/entities/vote";
import { staggerContainer, gridItem } from "@/presentation/lib/animations";

export default function VotePage() {
  const [candidates, setCandidates] = useState<VoteCandidate[]>([]);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const t = useTranslations();

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
          prev.map((c) => (c.id === candidateId ? { ...c, voteCount: c.voteCount + 1 } : c))
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-[#A07850]">{t("common.loading")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-[#F0E6D6]/30 py-16">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="pink" className="mb-4">
              <TrendingUpIcon className="mr-1 h-3 w-3" />
              {t("vote.badge")}
            </Badge>
            <h1 className="font-display mb-4 text-4xl text-[#2C1810] sm:text-5xl">
              {t("vote.title")}
            </h1>
            <p className="text-[#A07850]">{t("vote.subtitle")}</p>
          </div>
        </div>
      </section>

      {/* Candidates */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-8 lg:px-12">
          {candidates.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg text-[#A07850]">{t("vote.noCandidates")}</p>
            </div>
          ) : (
            <>
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {candidates.map((candidate, index) => {
                  const hasVoted = userVotes.has(candidate.id);
                  const percentage =
                    totalVotes > 0 ? Math.round((candidate.voteCount / totalVotes) * 100) : 0;

                  return (
                    <motion.div
                      key={candidate.id}
                      variants={gridItem}
                      className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_2px_12px_rgba(44,24,16,0.08)]"
                    >
                      {/* Image Container - Fixed aspect ratio */}
                      <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-[#FFF0F5]">
                        {candidate.imageUrl ? (
                          <img
                            src={candidate.imageUrl}
                            alt={candidate.cookieName}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              (e.target as HTMLImageElement).style.display = "none";
                              const parent = (e.target as HTMLImageElement).parentElement;
                              if (parent) {
                                parent.innerHTML = '<span class="text-6xl">🍪</span>';
                              }
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-[#F4538A]/30">
                            <ImageIcon className="mb-2 h-16 w-16" />
                            <span className="text-4xl">🍪</span>
                          </div>
                        )}
                        {hasVoted && (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#F4538A]/20">
                            <div className="rounded-full bg-white p-3 shadow-lg">
                              <CheckIcon className="h-6 w-6 text-[#F4538A]" />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Content - Flex grow to fill space */}
                      <div className="flex flex-1 flex-col p-5">
                        {/* Title - Fixed height */}
                        <h3 className="mb-1 line-clamp-1 text-lg font-bold text-[#2C1810]">
                          {candidate.cookieName}
                        </h3>

                        {/* Description - Fixed height with line clamp */}
                        <p className="mb-4 line-clamp-2 h-10 text-sm text-[#A07850]">
                          {candidate.description}
                        </p>

                        {/* Vote Progress - Always at same position */}
                        <div className="mb-4">
                          <div className="mb-1 flex justify-between text-xs text-[#A07850]">
                            <span>
                              {candidate.voteCount} {t("vote.votes")}
                            </span>
                            <span>{percentage}%</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-[#F0E6D6]">
                            <motion.div
                              className="h-full rounded-full bg-[#F4538A]"
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                            />
                          </div>
                        </div>

                        {/* Button - Always at bottom */}
                        <div className="mt-auto">
                          <Button
                            variant={hasVoted ? "ghost" : "primary"}
                            fullWidth
                            disabled={hasVoted}
                            isLoading={isLoading === candidate.id}
                            onClick={() => handleVote(candidate.id)}
                            className="cursor-pointer"
                          >
                            {hasVoted ? t("vote.voted") : t("vote.vote")}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>

              <p className="mt-10 text-center text-[#A07850]">
                {totalVotes.toLocaleString()} {t("vote.totalVotes")}
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
