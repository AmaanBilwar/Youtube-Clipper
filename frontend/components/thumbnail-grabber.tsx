"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { YouTubePlayer } from "@/components/youtube-player";

interface ThumbnailResolution {
  label: string;
  width: number;
  height: number;
  url: string;
}

export function ThumbnailGrabber() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [thumbnails, setThumbnails] = useState<ThumbnailResolution[]>([]);

  // Extract video ID from YouTube URL
  const getVideoId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    const videoId = getVideoId(newUrl);

    if (videoId) {
      // Generate thumbnail URLs for different resolutions
      const resolutions: ThumbnailResolution[] = [
        {
          label: "Default",
          width: 120,
          height: 90,
          url: `https://img.youtube.com/vi/${videoId}/default.jpg`,
        },
        {
          label: "Medium Quality",
          width: 320,
          height: 180,
          url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        },
        {
          label: "High Quality",
          width: 480,
          height: 360,
          url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        },
        {
          label: "Standard Definition",
          width: 640,
          height: 480,
          url: `https://img.youtube.com/vi/${videoId}/sddefault.jpg`,
        },
        {
          label: "Maximum Resolution",
          width: 1280,
          height: 720,
          url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        },
      ];
      setThumbnails(resolutions);
    } else {
      setThumbnails([]);
    }
  };

  const handleDownload = async (thumbnailUrl: string, resolution: string) => {
    try {
      const response = await fetch(thumbnailUrl, { mode: "cors" });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const safeResolution = resolution.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const link = document.createElement("a");
      link.href = url;
      link.download = `thumbnail_${safeResolution}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Failed to download image. Please try again.");
    }
  };

  const videoId = getVideoId(url);

  return (
    <section className="flex flex-col w-full gap-12 border-2 border-border/50 p-4 md:p-6 bg-muted/30 rounded-3xl">
      <h1 className="text-2xl font-bold tracking-tight">Thumbnail Grabber</h1>
      <div className="flex flex-col gap-4">
        <div className="space-y-2">
          <Label htmlFor="url">YouTube URL</Label>
          <Input
            type="text"
            id="url"
            value={url}
            onChange={handleUrlChange}
            required
          />
        </div>
      </div>

      {/* Thumbnail Grid */}
      {thumbnails.length > 0 && (
        <div className="">
          <h2 className="text-lg font-semibold mb-4">Available Thumbnails</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {thumbnails.map((thumbnail, index) => (
              <div
                key={index}
                className="flex flex-col h-full justify-between items-center p-4 bg-background rounded-lg"
              >
                <img
                  src={thumbnail.url}
                  alt={`${thumbnail.label} thumbnail`}
                  className="w-full h-auto rounded-lg mb-1"
                />
                <div className="flex flex-col flex-1 w-full justify-between items-center">
                  <div className="text-sm text-muted-foreground mb-1 text-center">
                    {thumbnail.label} ({thumbnail.width}x{thumbnail.height})
                  </div>
                  <div className="mt-auto w-full flex justify-center">
                    <Button
                      className="hover:cursor-pointer w-full"
                      onClick={() => handleDownload(thumbnail.url, thumbnail.label)}
                      size="sm"
                    >
                      Download
                    </Button>
                  </div>
                </div>
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
            startTime="00:00:00"
            endTime="00:00:00"
          />
        </div>
      )}
    </section>
  );
}
