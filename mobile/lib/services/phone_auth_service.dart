import 'package:firebase_auth/firebase_auth.dart';
import 'firebase_service.dart';

class PhoneAuthService {
  PhoneAuthService._();

  static String toE164(String tenDigitPhone) => '+91$tenDigitPhone';

  static Future<void> sendOtp({
    required String phoneE164,
    required void Function(String verificationId, int? resendToken) onCodeSent,
    required void Function(FirebaseAuthException error) onFailed,
    required void Function(PhoneAuthCredential credential) onAutoVerified,
    int? forceResendingToken,
  }) async {
    await FirebaseService.auth.verifyPhoneNumber(
      phoneNumber: phoneE164,
      timeout: const Duration(seconds: 60),
      forceResendingToken: forceResendingToken,
      verificationCompleted: onAutoVerified,
      verificationFailed: onFailed,
      codeSent: onCodeSent,
      codeAutoRetrievalTimeout: (_) {},
    );
  }

  static Future<UserCredential> verifySmsCode({
    required String verificationId,
    required String smsCode,
  }) async {
    final credential = PhoneAuthProvider.credential(
      verificationId: verificationId,
      smsCode: smsCode.trim(),
    );
    return FirebaseService.auth.signInWithCredential(credential);
  }

  static Future<String?> currentIdToken() async {
    final user = FirebaseService.auth.currentUser;
    if (user == null) return null;
    return user.getIdToken();
  }
}
