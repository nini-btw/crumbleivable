"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { CheckIcon, TrendingUpIcon } from "lucide-react";
import { Button } from "@/presentation/components/ui/Button";
import { Badge } from "@/presentation/components/ui/Badge";
import { mockVoteCandidates } from "@/infrastructure/db/mock-data";
import { staggerContainer, gridItem } from "@/presentation/lib/animations";

export default function VotePage() {
  const [candidates, setCandidates] = React.useState(mockVoteCandidates);
  const [userVotes, setUserVotes] = React.useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = React.useState<string | null>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem("userVotes");
    if (saved) {
      setUserVotes(new Set(JSON.parse(saved)));
    }
  }, []);

  React.useEffect(() => {
    localStorage.setItem("userVotes", JSON.stringify([...userVotes]));
  }, [userVotes]);

  const handleVote = async (candidateId: string) => {
    if (userVotes.has(candidateId)) return;

    setIsLoading(candidateId);

    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId ? { ...c, voteCount: c.voteCount + 1 } : c
      )
    );
    setUserVotes((prev) => new Set([...prev, candidateId]));

    setTimeout(() => {
      setIsLoading(null);
    }, 500);
  };

  const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-sand/30 py-16">
        <div className="mx-auto w-full px-4 sm:px-8 lg:px-12 max-w-[1400px]">
          <div className="max-w-2xl mx-auto text-center">
            <Badge variant="pink" className="mb-4">
              <TrendingUpIcon className="w-3 h-3 mr-1" />
              Community Vote
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl text-brown-900 mb-4">
              Bring It Back!
            </h1>
            <p className="text-brown-400">
              Vote for your favorite retired flavors. The most popular cookies
              might make a comeback!
            </p>
          </div>
        </div>
      </section>

      {/* Candidates */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto w-full px-4 sm:px-8 lg:px-12 max-w-[1400px]">
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
                  <div className="relative aspect-square bg-pink-50 flex items-center justify-center text-6xl">
                    🍪
                    {hasVoted && (
                      <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                        <div className="bg-white rounded-full p-3 shadow-lg">
                          <CheckIcon className="w-6 h-6 text-pink-500" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-brown-900 text-lg mb-1">
                      {candidate.cookieName}
                    </h3>
                    <p className="text-brown-400 text-sm mb-4">
                      {candidate.description}
                    </p>

                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-brown-400 mb-1">
                        <span>{candidate.voteCount} votes</span>
                        <span>{percentage}%</span>
                      </div>
                      <div className="h-2 bg-sand rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-pink-500 rounded-full"
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

          <p className="text-center text-brown-400 mt-10">
            {totalVotes.toLocaleString()} total votes cast
          </p>
        </div>
      </section>
    </div>
  );
}
