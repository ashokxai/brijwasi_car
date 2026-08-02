import '../models/user_model.dart';

enum PhoneSignInOutcome { success, needsEmail, failed }

class PhoneAuthSyncResult {
  const PhoneAuthSyncResult._({
    required this.needsEmail,
    this.token,
    this.user,
    this.phone,
  });

  final bool needsEmail;
  final String? token;
  final UserModel? user;
  final String? phone;

  factory PhoneAuthSyncResult.signedIn({
    required String token,
    required UserModel user,
  }) =>
      PhoneAuthSyncResult._(needsEmail: false, token: token, user: user);

  factory PhoneAuthSyncResult.needsEmail({String? phone}) =>
      PhoneAuthSyncResult._(needsEmail: true, phone: phone);
}
