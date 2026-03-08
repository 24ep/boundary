// ─── Configuration ───────────────────────────────────────────────

export interface AppKitConfig {
  /** OAuth Client ID from the AppKit Admin Dashboard */
  clientId: string;
  /** Your AppKit domain (e.g. https://auth.your-app.com) */
  domain: string;
  /** Default redirect URI after login */
  redirectUri?: string;
  /** OAuth scopes to request (default: 'openid profile email') */
  scopes?: string[];
  /** Token storage strategy (default: 'localStorage') */
  storage?: 'localStorage' | 'sessionStorage' | 'cookie' | 'memory';
  /** Automatically refresh tokens before expiry (default: true) */
  autoRefresh?: boolean;
  /** Custom fetch implementation for SSR/testing */
  fetch?: typeof globalThis.fetch;
}

export interface MobileBranding {
  mobileAppName?: string;
  logoUrl?: string;
  iconUrl?: string;
  analytics?: Record<string, unknown>;
  legal?: Record<string, unknown>;
  screens?: any[];
  categories?: any[];
  flows?: any[];
}

export interface RegisterRequest {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  [key: string]: unknown;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: AppKitUser;
  accessToken?: string;
  refreshToken?: string;
}

// ─── Auth ────────────────────────────────────────────────────────

export interface AuthUrlOptions {
  redirect_uri?: string;
  scope?: string;
  state?: string;
  /** Use PKCE (default: true for public clients) */
  usePKCE?: boolean;
  /** Additional query parameters */
  extraParams?: Record<string, string>;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
}

export interface TokenSet {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt: number;
  scope?: string;
}

export interface LoginOptions {
  /** Override the default redirect URI */
  redirectUri?: string;
  /** Override the default scopes */
  scope?: string;
  /** Pre-fill login hint (email) */
  loginHint?: string;
  /** Force re-authentication */
  prompt?: 'none' | 'login' | 'consent';
}

export interface LogoutOptions {
  /** URL to redirect to after logout */
  post_logout_redirect_uri?: string;
  /** Whether to revoke the refresh token on the server (default: true) */
  revokeToken?: boolean;
}

export interface CallbackResult {
  /** The parsed token set */
  tokens: TokenSet;
  /** The state parameter returned from the authorization server */
  state?: string;
}

// ─── PKCE ────────────────────────────────────────────────────────

export interface PKCEChallenge {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256';
}

// ─── User / Identity ─────────────────────────────────────────────

export interface AppKitUser {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  emailVerified?: boolean;
  phone?: string;
  attributes?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
  points?: number;
  appPoints?: number;
}

// ─── MFA ─────────────────────────────────────────────────────────
export interface UserMFA {
  id: string;
  mfaType: 'totp' | 'sms' | 'email';
  isEnabled: boolean;
  isVerified?: boolean;
}

export type MFAType = 'totp' | 'sms' | 'email';

export interface MFAEnrollResponse {
  /** QR code data URL for TOTP */
  qrCodeUrl?: string;
  /** TOTP secret for manual entry */
  secret?: string;
  /** Challenge ID for SMS/email verification */
  challengeId?: string;
}

export interface MFAVerifyOptions {
  type: MFAType;
  code: string;
  challengeId?: string;
}

export interface MFAStatus {
  enabled: boolean;
  methods: MFAType[];
}

export interface UserSession {
  id: string;
  deviceType?: string;
  deviceName?: string;
  ipAddress?: string;
  lastActivityAt: string;
  isActive: boolean;
}

export interface UserDevice {
  id: string;
  deviceName?: string;
  deviceType: string;
  isTrusted: boolean;
  lastSeenAt: string;
}

// ─── Safety ─────────────────────────────────────────────────────

export interface SafetyAlert {
  id: string;
  userId: string;
  circleId: string;
  alertType: string;
  status: string;
  priority: string;
  locationLatitude?: number;
  locationLongitude?: number;
  locationAddress?: string;
  createdAt: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  relationship: string;
  isPrimary: boolean;
}

// ─── Groups / Circles ────────────────────────────────────────────

export interface Circle {
  id: string;
  name: string;
  description?: string;
  role: string;
  memberCount?: number;
  createdAt?: string;
}

export interface CircleType {
  id: string;
  name: string;
  code: string;
  icon?: string;
  sort_order?: number;
}

export interface CircleMember {
  userId: string;
  role: string;
  joinedAt: string;
  user?: AppKitUser;
}

export interface CreateCircleRequest {
  name: string;
  description?: string;
  type?: string;
  settings?: Record<string, unknown>;
}

export interface UpdateCircleRequest {
  name?: string;
  description?: string;
  settings?: Record<string, unknown>;
}

// ─── CMS ─────────────────────────────────────────────────────────

export interface CMSContent {
  id: string;
  title: string;
  slug: string;
  type?: string;
  status?: string;
  components?: unknown[];
  metadata?: Record<string, unknown>;
  publishedAt?: string;
}

// ─── Localization ────────────────────────────────────────────────

export type TranslationMap = Record<string, string>;

// ─── Events ──────────────────────────────────────────────────────

export type AppKitEvent =
  | 'login'
  | 'logout'
  | 'token_refreshed'
  | 'token_expired'
  | 'user_updated'
  | 'error';

export type AppKitEventHandler = (payload?: unknown) => void;

// ─── Errors ──────────────────────────────────────────────────────

export class AppKitError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'AppKitError';
  }
}

// ─── Extended Auth Types ─────────────────────────────────────────

export interface LoginRequest {
  email?: string;
  phone?: string;
  password?: string;
  [key: string]: unknown;
}

export interface OtpRequest {
  email?: string;
  phone?: string;
}

export interface VerifyOtpRequest {
  email?: string;
  phone?: string;
  otp: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  password: string;
  token: string;
}

export interface CheckUserRequest {
  email?: string;
  phone?: string;
}

export interface CheckUserResponse {
  exists: boolean;
}
