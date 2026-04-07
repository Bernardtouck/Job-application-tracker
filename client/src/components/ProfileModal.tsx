import { useState, useRef, useEffect } from "react";
import { getProfile, updateProfile, fileToBase64 } from "../api/profile.api";
import type { UserProfile } from "../types/user.types";

interface Props {
  onClose: () => void;
  onUpdated: (profile: UserProfile) => void;
  isFirstLogin?: boolean; // true = modal shown automatically after first login
}

export default function ProfileModal({
  onClose,
  onUpdated,
  isFirstLogin = false,
}: Props) {
  const [username, setUsername] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [avatarB64, setAvatarB64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Load current profile on mount
  useEffect(() => {
    getProfile()
      .then((p) => {
        setUsername(p.username ?? "");
        if (p.avatarBase64) setPreview(p.avatarBase64);
      })
      .catch(() => { })
      .finally(() => setFetching(false));
  }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      setError("Image must be smaller than 2MB");
      return;
    }
    const b64 = await fileToBase64(file);
    setPreview(b64);
    setAvatarB64(b64);
    setError("");
  };

  const handleSave = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!username.trim() && !avatarB64) {
      setError("Please enter a username or choose a photo");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const payload: { username?: string; avatarBase64?: string } = {};
      if (username.trim()) payload.username = username.trim();
      if (avatarB64) payload.avatarBase64 = avatarB64;

      const updated = await updateProfile(payload);
      localStorage.setItem("userProfile", JSON.stringify(updated));
      onUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={isFirstLogin ? undefined : onClose}
    >
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isFirstLogin ? "Complete your profile" : "Edit profile"}
          </h2>
          {!isFirstLogin && (
            <button className="modal-close" onClick={onClose}>
              ✕
            </button>
          )}
        </div>

        {fetching ? (
          <div style={{ padding: "2rem", textAlign: "center" }}>
            <div className="spinner-large" style={{ margin: "0 auto" }} />
          </div>
        ) : (
          <form className="job-form" onSubmit={handleSave}>
            {isFirstLogin && (
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  marginBottom: 4,
                }}
              >
                Set a username and optionally add a profile photo.
              </p>
            )}

            {/* Avatar picker */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <div
                className="profile-avatar-large"
                onClick={() => fileRef.current?.click()}
                style={{ cursor: "pointer" }}
                title="Click to change photo"
              >
                {preview ? (
                  <img
                    src={preview}
                    alt="avatar"
                    className="profile-avatar-img"
                  />
                ) : (
                  <span className="profile-avatar-initials">
                    {username ? username.slice(0, 2).toUpperCase() : "?"}
                  </span>
                )}
                <div className="profile-avatar-overlay">
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    style={{ width: 18, height: 18 }}
                  >
                    <path d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
                </div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                style={{ display: "none" }}
                onChange={handleFile}
              />
              {preview && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ fontSize: 12, padding: "4px 12px" }}
                  onClick={() => {
                    setPreview(null);
                    setAvatarB64("");
                  }}
                >
                  Remove photo
                </button>
              )}
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                PNG, JPG, WEBP · max 100MB
              </span>
            </div>

            {/* Username */}
            <div className="form-group">
              <label>Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. John Doe"
                minLength={2}
                maxLength={32}
              />
            </div>

            {error && (
              <div className="parse-error">
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  style={{ width: 14, height: 14, flexShrink: 0 }}
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            )}

            <div className="form-actions">
              {!isFirstLogin && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
              )}
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <span className="btn-spinner" />
                ) : isFirstLogin ? (
                  "Save & continue"
                ) : (
                  "Save changes"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
