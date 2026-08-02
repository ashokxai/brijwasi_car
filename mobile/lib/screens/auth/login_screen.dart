import 'dart:async';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../models/phone_auth_result.dart';
import '../../providers/auth_provider.dart';
import '../../services/auth_service.dart';
import '../../services/firebase_service.dart';
import '../../services/phone_auth_service.dart';
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
    if (_step == _OtpStep.phone && !_formKey.currentState!.validate()) return;

    final phone = (isResend || _step == _OtpStep.code)
        ? _displayPhone
        : _phoneCtrl.text.trim();
    if (phone.isEmpty) return;
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
    final code = _otpCtrl.text.trim();
    if (code.length < 6) {
      _showError('Enter the 6-digit OTP');
      return;
    }

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
      backgroundColor: AppColors.softGray,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                const BrandHeader(
                  subtitle: 'Login with OTP sent to your mobile number.',
                ),
                const SizedBox(height: 24),
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
                  AppTextField(
                    controller: _phoneCtrl,
                    label: 'Mobile number',
                    keyboardType: TextInputType.phone,
                    validator: Validators.phone,
                    prefixText: '+91 ',
                  ),
                  const SizedBox(height: 22),
                  AppButton(
                    label: 'SEND OTP',
                    loading: loading,
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
                    keyboardType: TextInputType.number,
                    validator: (v) {
                      if (v == null || v.trim().length < 6) return 'Enter 6-digit OTP';
                      return null;
                    },
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
                if (loading) ...[
                  const SizedBox(height: 10),
                  Text(
                    'Server may take up to 45 seconds to wake up. Please keep this screen open.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey.shade700, fontSize: 13, height: 1.35),
                  ),
                ],
                const SizedBox(height: 20),
                TextButton(
                  onPressed: () => context.push('/login/email'),
                  child: const Text(
                    'Login with email instead',
                    style: TextStyle(
                      color: AppColors.goldDark,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
