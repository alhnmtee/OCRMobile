import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string | null;
  };
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    const token = await userCredential.user.getIdToken();
    
    // Token'ı AsyncStorage'a kaydet
    await AsyncStorage.setItem('userToken', token);
    
    return {
      token,
      user: {
        id: userCredential.user.uid,
        email: userCredential.user.email,
      },
    };
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(getFirebaseErrorMessage(error.code));
  }
};

export const register = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const token = await userCredential.user.getIdToken();
    
    await AsyncStorage.setItem('userToken', token);
    
    return {
      token,
      user: {
        id: userCredential.user.uid,
        email: userCredential.user.email,
      },
    };
  } catch (error: any) {
    console.error('Register error:', error);
    throw new Error(getFirebaseErrorMessage(error.code));
  }
};

export const logout = async (): Promise<void> => {
  try {
    await auth().signOut();
    await AsyncStorage.removeItem('userToken');
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    const currentUser = auth().currentUser;
    if (currentUser) {
      return await currentUser.getIdToken();
    }
    return null;
  } catch (error) {
    console.error('Get token error:', error);
    return null;
  }
};

const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Geçersiz e-posta adresi';
    case 'auth/user-disabled':
      return 'Bu kullanıcı hesabı devre dışı bırakılmış';
    case 'auth/user-not-found':
      return 'Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı';
    case 'auth/wrong-password':
      return 'Yanlış şifre';
    case 'auth/email-already-in-use':
      return 'Bu e-posta adresi zaten kullanımda';
    case 'auth/operation-not-allowed':
      return 'Bu işlem şu anda kullanılamıyor';
    case 'auth/weak-password':
      return 'Şifre çok zayıf';
    default:
      return 'Bir hata oluştu. Lütfen tekrar deneyin.';
  }
};