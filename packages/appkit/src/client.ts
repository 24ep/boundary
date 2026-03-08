import type {
  AppKitConfig,
  AppKitEvent,
  AppKitEventHandler,
  AppKitUser,
  CreateCircleRequest,
  UpdateCircleRequest,
  CircleType,
  RegisterRequest,
  AuthResponse,
  LoginOptions,
  LogoutOptions,
  AuthUrlOptions,
  CallbackResult,
  TokenSet,
  Circle,
  LoginRequest,
  CheckUserRequest,
  CheckUserResponse,
  OtpRequest,
  VerifyOtpRequest,
  VerifyEmailRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from './types';
import { createStorage, TokenStorage } from './storage';
import { HttpClient } from './http';
import { AuthModule } from './auth';
import { IdentityModule } from './identity';
import { MFAModule } from './mfa';
import { CMSModule } from './cms';
import { LocalizationModule } from './localization';
import { GroupsModule } from './groups';
import { SafetyModule } from './safety';
import { BrandingModule } from './branding';
import { WebhooksModule } from './webhooks';
import { CommunicationModule } from './communication';
import { SurveysModule } from './surveys';
import { LegalModule } from './legal';
import { BillingModule } from './billing';

export class AppKit {
  private authModule: AuthModule;
  private listeners = new Map<string, Set<AppKitEventHandler>>();
  private tokenStorage: TokenStorage;
  private http: HttpClient;

  /** Identity sub-module */
  public readonly identity: IdentityModule;
  /** MFA sub-module */
  public readonly mfa: MFAModule;
  /** CMS sub-module */
  public readonly cms: CMSModule;
  /** Localization sub-module */
  public readonly localization: LocalizationModule;
  /** Groups / Circles sub-module */
  public readonly groups: GroupsModule;
  /** Safety sub-module */
  public readonly safety: SafetyModule;
  /** Branding sub-module */
  public readonly branding: BrandingModule;
  /** Webhooks sub-module */
  public readonly webhooks: WebhooksModule;
  /** Communication sub-module */
  public readonly communication: CommunicationModule;
  /** Surveys sub-module */
  public readonly surveys: SurveysModule;
  /** Legal & Compliance sub-module */
  public readonly legal: LegalModule;
  /** Billing & Subscriptions sub-module */
  public readonly billing: BillingModule;

  constructor(private appConfig: AppKitConfig) {
    const storageAdapter = createStorage(appConfig.storage || 'localStorage');
    this.tokenStorage = new TokenStorage(storageAdapter);

    this.http = new HttpClient(
      appConfig.domain,
      () => this.tokenStorage.getTokens()?.accessToken ?? null,
      appConfig.fetch,
    );

    const emit = (event: string, payload?: unknown) => this.emit(event as AppKitEvent, payload);

    this.authModule = new AuthModule(appConfig, this.tokenStorage, this.http, emit);
    this.identity = new IdentityModule(this.http);
    this.mfa = new MFAModule(this.http);
    this.cms = new CMSModule(this.http);
    this.localization = new LocalizationModule(this.http);
    this.groups = new GroupsModule(this.http);
    this.safety = new SafetyModule(this.http);
    this.branding = new BrandingModule(this.http);
    this.webhooks = new WebhooksModule(this.http);
    this.communication = new CommunicationModule(this.http);
    this.surveys = new SurveysModule(this.http);
    this.legal = new LegalModule(this.http);
    this.billing = new BillingModule(this.http);
  }

  // ─── Auth shortcuts ────────────────────────────────────────────

  /** Redirect the browser to the AppKit login page */
  async login(options?: LoginOptions): Promise<void> {
    return this.authModule.login(options);
  }

  /** Log out — clear local tokens and optionally revoke server-side */
  async logout(options?: LogoutOptions): Promise<void> {
    return this.authModule.logout(options);
  }

  /** Build an OAuth authorization URL (useful for custom UI) */
  async buildAuthUrl(options?: AuthUrlOptions): Promise<string> {
    return this.authModule.buildAuthUrl(options);
  }

  /** Handle callback from OAuth provider */
  async handleCallback(callbackUrl?: string) {
    return this.authModule.handleCallback(callbackUrl);
  }

  /** Sign up / Register a new user */
  async signup(data: RegisterRequest): Promise<AuthResponse> {
    return this.authModule.register(data);
  }

  /** Refresh the access token */
  async refreshToken(): Promise<TokenSet> {
    return this.authModule.refreshToken();
  }

  /** Get the current access token (auto-refreshes if expired) */
  async getAccessToken(): Promise<string | null> {
    return this.authModule.getAccessToken();
  }

  /** Check if the user is authenticated */
  isAuthenticated(): boolean {
    return this.authModule.isAuthenticated();
  }

  /** Get the raw token set */
  getTokens(): TokenSet | null {
    return this.authModule.getTokens();
  }

  /** Direct login with credentials (email/password) */
  async loginWithCredentials(data: LoginRequest): Promise<AuthResponse> {
    return this.authModule.loginWithCredentials(data);
  }

  /** Check if a user exists by email or phone */
  async checkUserExists(data: CheckUserRequest): Promise<CheckUserResponse> {
    return this.authModule.checkUserExists(data);
  }

  /** Request an OTP code */
  async requestOtp(data: OtpRequest): Promise<{ success: boolean; message?: string }> {
    return this.authModule.requestOtp(data);
  }

  /** Login with an OTP code */
  async loginWithOtp(data: VerifyOtpRequest): Promise<AuthResponse> {
    return this.authModule.loginWithOtp(data);
  }

  /** Verify email with a code */
  async verifyEmail(data: VerifyEmailRequest): Promise<AuthResponse> {
    return this.authModule.verifyEmail(data);
  }

  /** Request password reset email */
  async forgotPassword(data: ForgotPasswordRequest): Promise<{ success: boolean; message?: string }> {
    return this.authModule.forgotPassword(data);
  }

  /** Reset password using a token */
  async resetPassword(data: ResetPasswordRequest): Promise<{ success: boolean; message?: string }> {
    return this.authModule.resetPassword(data);
  }

  /** Complete user onboarding */
  async completeOnboarding(data: any): Promise<AuthResponse> {
    return this.authModule.completeOnboarding(data);
  }

  // ─── Identity shortcuts ────────────────────────────────────────

  /** Get the current user's profile */
  async getUser(): Promise<AppKitUser> {
    return this.identity.getUser();
  }

  /** Update the current user's profile */
  async updateProfile(data: Partial<Pick<AppKitUser, 'firstName' | 'lastName' | 'phone' | 'avatar'>>): Promise<AppKitUser> {
    return this.identity.updateProfile(data);
  }

  /** Get custom attributes for the current user */
  async getAttributes(): Promise<Record<string, unknown>> {
    return this.identity.getAttributes();
  }

  /** Update custom attributes for the current user */
  async updateAttributes(attributes: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.identity.updateAttributes(attributes);
  }

  /** Check if the current user has a PIN set */
  async getPinStatus(): Promise<{ hasPin: boolean }> {
    return this.identity.getPinStatus();
  }

  /** Set or update the current user's PIN */
  async setPin(pin: string): Promise<{ success: boolean; message: string }> {
    return this.identity.setPin(pin);
  }

  /** Verify the current user's PIN */
  async verifyPin(pin: string): Promise<{ success: boolean; verified: boolean; message: string }> {
    return this.identity.verifyPin(pin);
  }

  // ─── Groups shortcuts ──────────────────────────────────────────

  /** Get circles the current user belongs to */
  async getUserCircles(): Promise<Circle[]> {
    return this.groups.getUserCircles();
  }

  /** Join a circle using an invite code and optional PIN */
  async joinCircle(inviteCode: string, pinCode?: string): Promise<{ success: boolean; circle: Circle }> {
    return this.groups.joinCircle(inviteCode, pinCode);
  }

  /** Get circle security codes */
  async getCircleSecurityCodes(circleId: string) {
    return this.groups.getSecurityCodes(circleId);
  }

  /** Generate new security codes (PIN and invite code) for a circle */
  async generateCircleSecurityCodes(circleId: string): Promise<{ pinCode: string; circleCode: string }> {
    return this.groups.generateSecurityCodes(circleId);
  }

  /** Create a new circle */
  async createCircle(data: CreateCircleRequest): Promise<Circle> {
    return this.groups.createCircle(data);
  }

  /** Update a circle's details */
  async updateCircle(circleId: string, data: UpdateCircleRequest): Promise<Circle> {
    return this.groups.updateCircle(circleId, data);
  }

  /** Delete a circle */
  async deleteCircle(circleId: string): Promise<void> {
    return this.groups.deleteCircle(circleId);
  }

  /** Leave a circle */
  async leaveCircle(circleId: string): Promise<void> {
    return this.groups.leaveCircle(circleId);
  }

  /** Get available circle types/categories */
  async getCircleTypes(): Promise<{ success: boolean; data: CircleType[] }> {
    return this.groups.getCircleTypes();
  }

  // ─── Event system ──────────────────────────────────────────────

  /** Subscribe to SDK events */
  on(event: AppKitEvent, handler: AppKitEventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  /** Remove a specific event handler */
  off(event: AppKitEvent, handler: AppKitEventHandler): void {
    this.listeners.get(event)?.delete(handler);
  }

  /** Clean up timers and listeners */
  destroy(): void {
    this.authModule.destroy();
    this.listeners.clear();
  }

  // ─── Private ───────────────────────────────────────────────────

  private emit(event: AppKitEvent, payload?: unknown): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      for (const handler of handlers) {
        try {
          handler(payload);
        } catch (err) {
          console.error(`[AppKit] Event handler error for "${event}":`, err);
        }
      }
    }
  }
}
