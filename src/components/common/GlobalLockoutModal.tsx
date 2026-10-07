import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  Linking,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { clearLockout, LockoutType } from '../../store/slices/appStatusSlice';
import { logout } from '../../store/slices/authSlice';

const SUPPORT_EMAIL = 'support@wealthconomy.com';
const SUPPORT_PHONE = '+2348000000000'; // TODO: replace with actual Wealthconomy support number

const THEME_PRIMARY = '#155D5F';
const THEME_ERROR = '#DC2626';

const LOCKOUT_CONFIG: Record<
  NonNullable<LockoutType>,
  { icon: string; contactLabel: string }
> = {
  MAINTENANCE: {
    icon: '🛠️',
    contactLabel: 'Check back shortly',
  },
  SUSPENDED: {
    icon: '⛔',
    contactLabel: 'Contact Support',
  },
  BLOCKED: {
    icon: '🚫',
    contactLabel: 'Contact Support',
  },
};

const MAINTENANCE_POLL_INTERVAL_MS = 30_000;

/**
 * GlobalLockoutModal
 * Mounts at the root of the app. When `isLocked` is true it renders an unclosable,
 * full-screen overlay above all navigation. The ONLY available action is "Log Out".
 * For Maintenance mode it polls every 30 s; once the server is reachable again it
 * forces a clean logout so the user re-authenticates with a fresh session.
 */
export const GlobalLockoutModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLocked, lockoutType, title, message } = useSelector(
    (state: RootState) => state.appStatus
  );

  // Fade-in animation
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLocked) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    } else {
      opacity.setValue(0);
    }
  }, [isLocked]);

  // Disable Android hardware back button while locked
  useEffect(() => {
    if (!isLocked) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => sub.remove();
  }, [isLocked]);

  // Poll the server every 30 s when in maintenance mode
  useEffect(() => {
    if (!isLocked || lockoutType !== 'MAINTENANCE') return;

    const poll = setInterval(async () => {
      try {
        const baseUrl = process.env.EXPO_PUBLIC_API_URL ?? '';
        const res = await fetch(`${baseUrl}/health`, { method: 'GET' });
        if (res.ok) {
          // Server is back — clear lockout and force logout for a fresh session
          dispatch(clearLockout());
          dispatch(logout());
        }
      } catch {
        // Still down — do nothing, keep showing the modal
      }
    }, MAINTENANCE_POLL_INTERVAL_MS);

    return () => clearInterval(poll);
  }, [isLocked, lockoutType, dispatch]);

  if (!isLocked || !lockoutType) return null;

  const config = LOCKOUT_CONFIG[lockoutType];

  const handleLogout = () => {
    dispatch(clearLockout());
    dispatch(logout());
    // Navigation is handled by the auth guard in _layout.tsx —
    // setting isAuthenticated: false will automatically redirect to login.
  };

  const handleContactEmail = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Account%20Issue%20-%20${encodeURIComponent(lockoutType)}`);
  };

  const handleContactPhone = () => {
    Linking.openURL(`tel:${SUPPORT_PHONE}`);
  };

  return (
    <Modal
      transparent
      visible={isLocked}
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {}} // Disallow Android gesture dismiss
    >
      <Animated.View style={[styles.overlay, { opacity }]}>
        <View style={styles.card}>
          {/* Icon */}
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: `${THEME_PRIMARY}18` },
            ]}
          >
            <Text style={styles.iconText}>{config.icon}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message / Reason */}
          {lockoutType !== 'MAINTENANCE' ? (
            <View style={styles.reasonBox}>
              <Text style={styles.reasonLabel}>Reason</Text>
              <Text style={styles.message}>{message}</Text>
            </View>
          ) : (
            <Text style={styles.message}>{message}</Text>
          )}

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: `${THEME_PRIMARY}25` }]} />

          {/* Contact Support (email + phone) — hidden for maintenance */}
          {lockoutType !== 'MAINTENANCE' && (
            <View style={styles.contactRow}>
              <Text style={styles.contactLabel}>Need help?</Text>
              <TouchableOpacity onPress={handleContactEmail} activeOpacity={0.7}>
                <Text style={[styles.contactLink, { color: THEME_PRIMARY }]}>
                  Email Support
                </Text>
              </TouchableOpacity>
              <Text style={styles.contactSep}>·</Text>
              <TouchableOpacity onPress={handleContactPhone} activeOpacity={0.7}>
                <Text style={[styles.contactLink, { color: THEME_PRIMARY }]}>
                  Call Us
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Log Out — the ONLY navigation action */}
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: THEME_PRIMARY }]}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>

          {/* Footer note */}
          <Text style={styles.footer}>
            {lockoutType === 'MAINTENANCE'
              ? 'We will be back shortly. Thank you for your patience.'
              : `If you believe this is a mistake, please reach out at ${SUPPORT_EMAIL}`}
          </Text>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingVertical: 32,
    paddingHorizontal: 28,
    alignItems: 'center',
    // Shadow
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.3,
        shadowRadius: 28,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 32,
  },
  title: {
    fontSize: 21,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'KumbhSans_700Bold',
  },
  message: {
    fontSize: 14,
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 0,
    fontWeight: '600',
    fontFamily: 'KumbhSans_600SemiBold',
  },
  reasonBox: {
    width: '100%',
    backgroundColor: `${'#155D5F'}12`,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#155D5F',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  reasonLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#155D5F',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
    fontFamily: 'KumbhSans_700Bold',
  },
  divider: {
    width: '100%',
    height: 1,
    marginBottom: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  contactLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontFamily: 'KumbhSans_400Regular',
  },
  contactLink: {
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
    fontFamily: 'KumbhSans_600SemiBold',
  },
  contactSep: {
    fontSize: 13,
    color: '#CBD5E1',
  },
  logoutButton: {
    width: '100%',
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
    fontFamily: 'KumbhSans_700Bold',
  },
  footer: {
    fontSize: 11,
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 17,
    fontWeight: '700',
    fontFamily: 'KumbhSans_700Bold',
  },
});
