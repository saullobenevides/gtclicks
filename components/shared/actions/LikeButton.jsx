"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@stackframe/stack";
import { togglePhotoLike, getUserLikedPhotoIds } from "@/actions/photos";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function LikeButton({
  photoId,
  className,
  variant = "ghost",
  size = "icon",
  showCount = false,
  likesCount: initialLikesCount = 0,
}) {
  const user = useUser();
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!user || !photoId) {
      queueMicrotask(() => setChecked(true));
      return;
    }
    getUserLikedPhotoIds()
      .then((res) => {
        if (res.success && res.data?.includes(photoId)) {
          setIsLiked(true);
        }
        setChecked(true);
      })
      .catch(() => setChecked(true));
  }, [user, photoId]);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(
          typeof window !== "undefined" ? window.location.pathname : "/"
        )}`
      );
      return;
    }

    if (loading) return;

    setLoading(true);
    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!isLiked);
    setLikesCount((c) => (isLiked ? Math.max(0, c - 1) : c + 1));

    const result = await togglePhotoLike(photoId);

    setLoading(false);
    if (result?.error) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      toast.error(result.error);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn(className)}
      aria-label={isLiked ? "Descurtir foto" : "Curtir foto"}
      aria-pressed={isLiked}
      disabled={loading}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-colors",
          isLiked && "fill-action-primary text-action-primary"
        )}
      />
      {showCount && likesCount > 0 && (
        <span className="ml-1.5 text-sm font-medium">{likesCount}</span>
      )}
    </Button>
  );
}
