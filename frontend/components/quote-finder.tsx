"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { YouTubePlayer } from "@/components/youtube-player";

export function QuoteFinder() {
  const [url, setUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Extract video ID from YouTube URL
  const getVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // TODO: Implement quote search functionality
      // This would involve calling your backend API to search for quotes


      console.log("Searching for quotes:", searchQuery);
    } catch (err) {
      console.error("Error in handleSearch:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const videoId = getVideoId(url);

  return (
    <section className="flex flex-col w-full gap-12 border-2 border-border/50 p-4 md:p-6 bg-muted/30 rounded-3xl">
      <h1 className="text-2xl font-bold tracking-tight">Quote Finder</h1>
      <form onSubmit={handleSearch} className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="url">YouTube URL</Label>
          <Input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="searchQuery">Search Query</Label>
          <Input
            type="text"
            id="searchQuery"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter text to search for in the video"
            required
          />
        </div>
        <div className="flex gap-4">
          <Button 
            type="button" 
            onClick={handlePreview} 
            className="flex-1" 
            size="lg"
            disabled={!videoId}
          >
            Preview Video
          </Button>
          <Button 
            type="submit" 
            disabled={loading} 
            className="flex-1" 
            size="lg"
          >
            {loading ? "Searching..." : "Find Quotes"}
          </Button>
        </div>
        {error && (
          <div className="text-destructive text-sm mt-2">{error}</div>
        )}
      </form>

      {/* Video Preview */}
      {videoId && showPreview && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Preview</h2>
          <YouTubePlayer
            videoId={videoId}
            startTime="00:00:00"
            endTime="00:00:00"
          />
        </div>
      )}
    </section>
  );
} 