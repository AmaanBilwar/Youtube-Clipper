"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { YouTubePlayer } from "@/components/youtube-player";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Fuse from 'fuse.js';
import type { FuseResult } from 'fuse.js';

interface TranscriptEvent {
  text: string;
  start: number;
  end: number;
}

export function QuoteFinder() {
  const [url, setUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEvent[]>([]);
  const [searchResults, setSearchResults] = useState<TranscriptEvent[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [showTranscriptAlert, setShowTranscriptAlert] = useState(false);

  // Extract video ID from YouTube URL
  const getVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  // Fetch transcript when URL changes
  useEffect(() => {
    const videoId = getVideoId(url);
    if (videoId) {
      fetchTranscript(url);
    }
  }, [url]);

  const fetchTranscript = async (videoUrl: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch('http://localhost:3001/api/transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: videoUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch transcript');
      }

      const data = await response.json();
      if (!data.transcript || data.transcript.length === 0) {
        setShowTranscriptAlert(true);
        return;
      }
      setTranscript(data.transcript);
    } catch (err) {
      console.error("Error fetching transcript:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
      setShowTranscriptAlert(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const fuse = new Fuse(transcript, {
      keys: ['text'],
      threshold: 0.3,
      includeScore: true
    });

    const results = fuse.search(searchQuery);
    setSearchResults(results.map((result: FuseResult<TranscriptEvent>) => result.item));
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleTimestampClick = (startTime: number) => {
    setCurrentTime(startTime);
  };

  const videoId = getVideoId(url);

  return (
    <section className="flex flex-col w-full gap-12 border-2 border-border/50 p-4 md:p-6 bg-muted/30 rounded-3xl">
      <AlertDialog open={showTranscriptAlert} onOpenChange={setShowTranscriptAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transcript Not Available</AlertDialogTitle>
            <AlertDialogDescription>
              We couldn't find a transcript for this video. To access our advanced capabilities and automatic transcript generation, please subscribe to our pro version.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction onClick={() => window.open('/pricing', '_blank')}>
              View Pro Plans
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Search Results</h2>
          <div className="space-y-2">
            {searchResults.map((result, index) => (
              <div 
                key={index} 
                className="p-2 bg-background rounded-lg cursor-pointer hover:bg-muted"
                onClick={() => handleTimestampClick(result.start)}
              >
                <div className="text-sm text-muted-foreground">
                  {formatTime(result.start)}
                </div>
                <div>{result.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Preview */}
      {videoId && showPreview && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Preview</h2>
          <YouTubePlayer
            videoId={videoId}
            startTime={formatTime(currentTime)}
            endTime="00:00:00"
          />
        </div>
      )}
    </section>
  );
} 