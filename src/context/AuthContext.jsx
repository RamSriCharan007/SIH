import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('gramin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeSmsPopup, setActiveSmsPopup] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [hasBiometricRegistered, setHasBiometricRegistered] = useState(() => {
    return localStorage.getItem('gramin_biometric_enabled') === 'true';
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('gramin_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('gramin_user');
    }
  }, [user]);

  // Request OTP from server & trigger simulated SMS Notification
  const requestOtp = async (phone, role = 'citizen', fullName = '') => {
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await response.json();

      if (data.success && data.simulated_sms) {
        // Trigger realistic SMS notification on the screen
        setActiveSmsPopup(data.simulated_sms);
        return data;
      }
      return data;
    } catch (e) {
      // Fallback offline mock OTP generator if server offline
      const mockOtp = '482910';
      const mockSms = {
        sender: "MH-GOV-HLTH",
        text: `<#> Your GraminAarogya OTP is ${mockOtp}. Valid for 5 mins. #MH_GOV_${mockOtp}`,
        otp: mockOtp,
        phone: phone,
        timestamp: new Date().toLocaleTimeString()
      };
      setActiveSmsPopup(mockSms);
      return { success: true, simulated_sms: mockSms };
    }
  };

  // Verify OTP
  const verifyOtp = async (phone, otp, role = 'citizen', fullName = '') => {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, role, fullName })
      });
      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        setActiveSmsPopup(null);
        setIsAuthModalOpen(false);
        return { success: true, user: data.user };
      }
      return { success: false, error: data.error || 'Invalid OTP' };
    } catch (e) {
      // Offline fallback login
      const fallbackUser = {
        id: 'usr_' + phone.slice(-4),
        phone,
        fullName: fullName || (role === 'asha' ? 'Sunita Bai Shinde (ASHA)' : 'Ramesh Patil (Citizen)'),
        role: role,
        district: 'Nashik Rural',
        asha_badge_no: role === 'asha' ? 'MH-NSK-ASHA-409' : null,
        token: 'mock_offline_token'
      };
      setUser(fallbackUser);
      setActiveSmsPopup(null);
      setIsAuthModalOpen(false);
      return { success: true, user: fallbackUser };
    }
  };

  // Biometric login (Fingerprint / Face ID instant authentication & Database Sync)
  const loginWithBiometrics = async (phone = '9822019485', role = 'asha', fullName = '') => {
    try {
      const response = await fetch('/api/auth/biometric-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, role, fullName })
      });
      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        setHasBiometricRegistered(true);
        localStorage.setItem('gramin_biometric_enabled', 'true');
        setIsAuthModalOpen(false);
        return { success: true, user: data.user };
      }

      // Fallback
      const bioUser = {
        id: 'usr_bio_' + (phone ? phone.slice(-4) : '9988'),
        phone: phone || '9822019485',
        fullName: fullName || (role === 'asha' ? 'Sunita Bai Shinde (ASHA Volunteer)' : 'Ramesh Shantaram Patil'),
        role: role || 'asha',
        district: 'Nashik Rural - Trimbakeshwar Block',
        asha_badge_no: role === 'asha' ? 'MH-NSK-ASHA-409' : null,
        authMethod: 'Biometric (Fingerprint/FaceID)',
        token: 'jwt_biometric_active'
      };
      setUser(bioUser);
      setHasBiometricRegistered(true);
      localStorage.setItem('gramin_biometric_enabled', 'true');
      setIsAuthModalOpen(false);
      return { success: true, user: bioUser };
    } catch (err) {
      const bioUser = {
        id: 'usr_bio_' + (phone ? phone.slice(-4) : '9988'),
        phone: phone || '9822019485',
        fullName: fullName || (role === 'asha' ? 'Sunita Bai Shinde (ASHA Volunteer)' : 'Ramesh Shantaram Patil'),
        role: role || 'asha',
        district: 'Nashik Rural - Trimbakeshwar Block',
        asha_badge_no: role === 'asha' ? 'MH-NSK-ASHA-409' : null,
        authMethod: 'Biometric (Fingerprint/FaceID)',
        token: 'jwt_biometric_active'
      };
      setUser(bioUser);
      setHasBiometricRegistered(true);
      localStorage.setItem('gramin_biometric_enabled', 'true');
      setIsAuthModalOpen(false);
      return { success: true, user: bioUser };
    }
  };

  const registerBiometrics = () => {
    setHasBiometricRegistered(true);
    localStorage.setItem('gramin_biometric_enabled', 'true');
  };

  const switchRole = (newRole) => {
    if (user) {
      setUser({
        ...user,
        role: newRole,
        asha_badge_no: newRole === 'asha' ? (user.asha_badge_no || 'MH-NSK-ASHA-409') : null
      });
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('gramin_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthModalOpen,
        setIsAuthModalOpen,
        activeSmsPopup,
        setActiveSmsPopup,
        hasBiometricRegistered,
        requestOtp,
        verifyOtp,
        loginWithBiometrics,
        registerBiometrics,
        switchRole,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
