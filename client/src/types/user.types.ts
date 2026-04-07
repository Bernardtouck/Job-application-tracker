export interface UserProfile {
  id:           string;
  email:        string;
  username:     string | null;
  avatarBase64: string | null;
  createdAt:    string;
}

export interface UpdateProfilePayload {
  username?:     string;
  avatarBase64?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id:           string;
    email:        string;
    username:     string | null;
    avatarBase64: string | null;
  };
}