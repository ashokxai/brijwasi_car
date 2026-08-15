import 'dart:async';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/app_config.dart';
import '../../config/theme.dart';
import '../../models/phone_auth_result.dart';
import '../../providers/auth_provider.dart';
import '../../services/auth_service.dart';
import '../../services/firebase_service.dart';
import '../../services/phone_auth_service.dart';
import '../../utils/contact.dart';
import '../../utils/validators.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/brand_header.dart';

enum _OtpStep { phone, code }

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phoneCtrl = TextEditingController();
  final _otpCtrl = TextEditingController();

  _OtpStep _step = _OtpStep.phone;
  String? _verificationId;
  int? _resendToken;
  String _displayPhone = '';
  int _resendSeconds = 0;
  Timer? _resendTimer;
  bool _sendingOtp = false;

  @override
  void dispose() {
    _phoneCtrl.dispose();
    _otpCtrl.dispose();
    _resendTimer?.cancel();
    super.dispose();
  }

  void _startResendTimer() {
    _resendTimer?.cancel();
    setState(() => _resendSeconds = 45);
    _resendTimer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) return;
      if (_resendSeconds <= 1) {
        t.cancel();
        setState(() => _resendSeconds = 0);
      } else {
        setState(() => _resendSeconds -= 1);
      }
    });
  }

  Future<void> _sendOtp({bool isResend = false}) async {
    FocusScope.of(context).unfocus();
    if (!FirebaseService.isConfigured) {
      _showError('Firebase is not configured. Use email login instead.');
      return;
    }
    if (!isResend && _step == _OtpStep.phone) {
      if (!_formKey.currentState!.validate()) return;
    }

    final raw = (isResend || _step == _OtpStep.code)
        ? _displayPhone
        : _phoneCtrl.text;
    final phone = Validators.tenDigitPhone(raw);
    if (phone.length != 10) {
      _showError('Enter a valid 10-digit mobile number');
      return;
    }
    final e164 = PhoneAuthService.toE164(phone);

    setState(() {
      _sendingOtp = true;
      ref.read(authProvider.notifier).clearError();
    });

    try {
      await PhoneAuthService.sendOtp(
        phoneE164: e164,
        forceResendingToken: isResend ? _resendToken : null,
        onAutoVerified: (credential) async {
          if (!mounted) return;
          await FirebaseService.auth.signInWithCredential(credential);
          await _afterFirebasePhoneSignIn();
        },
        onFailed: (e) {
          if (!mounted) return;
          setState(() => _sendingOtp = false);
          _showError(AuthService.mapFirebaseAuthError(e));
        },
        onCodeSent: (verificationId, resendToken) {
          if (!mounted) return;
          setState(() {
            _sendingOtp = false;
            _verificationId = verificationId;
            _resendToken = resendToken;
            _displayPhone = phone;
            _step = _OtpStep.code;
          });
          _startResendTimer();
        },
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _sendingOtp = false);
      _showError(e.toString());
    }
  }

  Future<void> _verifyOtp() async {
    FocusScope.of(context).unfocus();
    if (_verificationId == null) {
      _showError('Request OTP first');
      return;
    }
    if (!_formKey.currentState!.validate()) return;

    final code = _otpCtrl.text.trim();

    ref.read(authProvider.notifier).clearError();
    try {
      await PhoneAuthService.verifySmsCode(
        verificationId: _verificationId!,
        smsCode: code,
      );
      await _afterFirebasePhoneSignIn();
    } on FirebaseAuthException catch (e) {
      _showError(AuthService.mapFirebaseAuthError(e));
    } catch (e) {
      _showError(e.toString());
    }
  }

  Future<void> _signInWithGoogle() async {
    FocusScope.of(context).unfocus();
    if (!FirebaseService.isConfigured) {
      _showError('Firebase is not configured. Use phone or email login.');
      return;
    }
    final ok = await ref.read(authProvider.notifier).loginWithGoogle();
    if (!mounted) return;
    if (ok) {
      context.go('/home');
      return;
    }
    final error = ref.read(authProvider).error;
    if (error != null && error.isNotEmpty) _showError(error);
  }

  Future<void> _afterFirebasePhoneSignIn() async {
    final outcome = await ref.read(authProvider.notifier).finishPhoneSignIn();
    if (!mounted) return;

    switch (outcome) {
      case PhoneSignInOutcome.success:
        context.go('/home');
      case PhoneSignInOutcome.needsEmail:
        context.go('/complete-profile');
      case PhoneSignInOutcome.failed:
        final error = ref.read(authProvider).error;
        if (error != null && error.isNotEmpty) _showError(error);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: Colors.red.shade700,
          behavior: SnackBarBehavior.floating,
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);
    final loading = auth.isLoading || _sendingOtp;

    return Scaffold(
      body: Container(
        width: double.infinity,
        decoration: const BoxDecoration(
          gradient: AppGradients.authBackground,
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(24, 16, 24, 32),
            child: Form(
              key: _formKey,
              autovalidateMode: AutovalidateMode.onUserInteraction,
              child: Column(
                children: [
                  const SizedBox(height: 8),
                  const BrandHeader(
                    subtitle: 'Sign in with Google, or continue with mobile OTP.',
                  ),
                  const SizedBox(height: 28),
                if (auth.error != null && auth.error!.isNotEmpty) ...[
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 14),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.red.shade200),
                    ),
                    child: Text(
                      auth.error!,
                      style: TextStyle(color: Colors.red.shade800, fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
                if (_step == _OtpStep.phone) ...[
                  SizedBox(
                    width: double.infinity,
                    height: 54,
                    child: OutlinedButton(
                      onPressed: loading ? null : _signInWithGoogle,
                      style: OutlinedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: AppColors.charcoal,
                        side: const BorderSide(color: AppColors.border),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(AppRadii.button),
                        ),
                        elevation: 0,
                      ),
                      child: loading && auth.isLoading
                          ? const SizedBox(
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: AppColors.teal,
                              ),
                            )
                          : const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.g_mobiledata, size: 32, color: Color(0xFF4285F4)),
                                SizedBox(width: 4),
                                Text(
                                  'Continue with Google',
                                  style: TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                    ),
                  ),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      Expanded(child: Divider(color: Colors.grey.shade300)),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                        child: Text(
                          'OR',
                          style: TextStyle(
                            color: Colors.grey.shade600,
                            fontWeight: FontWeight.w600,
                            fontSize: 12,
                          ),
                        ),
                      ),
                      Expanded(child: Divider(color: Colors.grey.shade300)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  AppTextField(
                    controller: _phoneCtrl,
                    label: 'Enter Mobile Number',
                    hintText: '10-digit number',
                    keyboardType: TextInputType.phone,
                    textInputAction: TextInputAction.done,
                    validator: Validators.phone,
                    prefix: const Icon(Icons.phone, color: AppColors.teal),
                    prefixText: '+91 ',
                    maxLength: 10,
                    inputFormatters: [
                      FilteringTextInputFormatter.digitsOnly,
                    ],
                  ),
                  const SizedBox(height: 24),
                  AppButton(
                    label: 'GET OTP',
                    loading: _sendingOtp,
                    onPressed: _sendOtp,
                  ),
                ] else ...[
                  Text(
                    'OTP sent to +91 $_displayPhone',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey.shade700),
                  ),
                  const SizedBox(height: 16),
                  AppTextField(
                    controller: _otpCtrl,
                    label: 'Enter OTP',
                    hintText: '6-digit code',
                    keyboardType: TextInputType.number,
                    textInputAction: TextInputAction.done,
                    validator: Validators.otp,
                    maxLength: 6,
                    inputFormatters: [
                      FilteringTextInputFormatter.digitsOnly,
                    ],
                  ),
                  const SizedBox(height: 22),
                  AppButton(
                    label: 'VERIFY & LOGIN',
                    loading: auth.isLoading,
                    onPressed: _verifyOtp,
                  ),
                  const SizedBox(height: 12),
                  TextButton(
                    onPressed: loading || _resendSeconds > 0 ? null : () => _sendOtp(isResend: true),
                    child: Text(
                      _resendSeconds > 0
                          ? 'Resend OTP in $_resendSeconds s'
                          : 'Resend OTP',
                    ),
                  ),
                  TextButton(
                    onPressed: loading
                        ? null
                        : () {
                            setState(() {
                              _step = _OtpStep.phone;
                              _otpCtrl.clear();
                            });
                          },
                    child: const Text('Change mobile number'),
                  ),
                ],
                if (loading) const SizedBox(height: 8),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () => context.push('/login/email'),
                  child: const Text(
                    'Or continue with Email',
                    style: TextStyle(
                      color: AppColors.teal,
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Text.rich(
                    textAlign: TextAlign.center,
                    TextSpan(
                      style: TextStyle(color: Colors.grey.shade600, fontSize: 12, height: 1.4),
                      children: [
                        const TextSpan(text: 'By continuing, you agree to our '),
                        WidgetSpan(
                          alignment: PlaceholderAlignment.baseline,
                          baseline: TextBaseline.alphabetic,
                          child: GestureDetector(
                            onTap: () => launchExternalUrl(AppConfig.termsOfServiceUrl),
                            child: const Text(
                              'Terms',
                              style: TextStyle(
                                color: AppColors.teal,
                                fontWeight: FontWeight.w600,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ),
                        const TextSpan(text: ' & '),
                        WidgetSpan(
                          alignment: PlaceholderAlignment.baseline,
                          baseline: TextBaseline.alphabetic,
                          child: GestureDetector(
                            onTap: () => launchExternalUrl(AppConfig.privacyPolicyUrl),
                            child: const Text(
                              'Privacy Policy',
                              style: TextStyle(
                                color: AppColors.teal,
                                fontWeight: FontWeight.w600,
                                fontSize: 12,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Container(
                  height: 120,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        AppColors.tealLight.withValues(alpha: 0.3),
                        Colors.white.withValues(alpha: 0),
                      ],
                    ),
                  ),
                  child: const Icon(
                    Icons.directions_car_filled,
                    size: 72,
                    color: AppColors.teal,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    ),
    );
  }
}
