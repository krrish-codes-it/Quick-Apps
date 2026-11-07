import { UserProfileState, UserSavedAddress } from '@/types';
import { PRESET_METRO_ZONES } from '../engine/geo-resolver';

export const DEFAULT_USER_PROFILE: UserProfileState = {
  id: 'guest_user_' + Math.random().toString(36).substring(2, 9),
  name: 'Quick Shopper',
  isGuest: true,
  savedAddresses: [
    {
      id: 'addr_home',
      label: 'Home',
      addressLine: 'Flat 402, Green Glen Layout, Bellandur',
      zoneName: 'Indiranagar 100ft Rd',
      city: 'Bengaluru',
      pincode: '560103',
      coordinates: PRESET_METRO_ZONES[0].coordinates,
      isDefault: true,
    },
    {
      id: 'addr_work',
      label: 'Work',
      addressLine: 'Building 10B, DLF Cyber City, Phase 2',
      zoneName: 'DLF Cyber City, Gurgaon',
      city: 'Delhi NCR',
      pincode: '122002',
      coordinates: PRESET_METRO_ZONES[2].coordinates,
      isDefault: false,
    },
  ],
  activeAddressId: 'addr_home',
  preferences: {
    priorityMode: 'cheapest',
    maxEtaMinutes: 20,
    favoriteProviders: ['blinkit', 'zepto', 'flipkart_minutes', 'bigbasket_now'],
  },
};

const PROFILE_STORAGE_KEY = 'quickbuy_user_profile_v1';

export class SessionManager {
  static getProfile(): UserProfileState {
    if (typeof window === 'undefined') {
      return DEFAULT_USER_PROFILE;
    }

    try {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed reading user profile from localStorage:', e);
    }

    return DEFAULT_USER_PROFILE;
  }

  static saveProfile(profile: UserProfileState): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed saving user profile to localStorage:', e);
    }
  }

  static addAddress(profile: UserProfileState, newAddress: Omit<UserSavedAddress, 'id'>): UserProfileState {
    const addressWithId: UserSavedAddress = {
      ...newAddress,
      id: 'addr_' + Date.now(),
    };

    const updated: UserProfileState = {
      ...profile,
      savedAddresses: [...profile.savedAddresses, addressWithId],
      activeAddressId: addressWithId.id,
    };

    this.saveProfile(updated);
    return updated;
  }

  static setActiveAddress(profile: UserProfileState, addressId: string): UserProfileState {
    const updated = {
      ...profile,
      activeAddressId: addressId,
    };
    this.saveProfile(updated);
    return updated;
  }

  static updatePreferences(
    profile: UserProfileState,
    preferences: Partial<UserProfileState['preferences']>
  ): UserProfileState {
    const updated = {
      ...profile,
      preferences: {
        ...profile.preferences,
        ...preferences,
      },
    };
    this.saveProfile(updated);
    return updated;
  }

  /**
   * Google OAuth Extension Stub:
   * Ready for future integration with Google Identity Services / Chrome autofill.
   */
  static linkGoogleAccountStub(profile: UserProfileState, email: string, name: string): UserProfileState {
    const updated: UserProfileState = {
      ...profile,
      email,
      name,
      isGuest: false,
    };
    this.saveProfile(updated);
    return updated;
  }
}
