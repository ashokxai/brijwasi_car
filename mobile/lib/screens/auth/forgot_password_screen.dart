import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../config/app_config.dart';
import '../../config/theme.dart';
import '../../utils/contact.dart';
import '../../utils/validators.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/brand_header.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  bool _submitted = false;

  @override
  void dispose() {
    _emailCtrl.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _submitted = true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.softGray,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: AppColors.charcoal,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                const BrandHeader(
                  subtitle: 'Reset help — our team will assist you securely.',
                ),
                const SizedBox(height: 24),
                if (!_submitted) ...[
                  AppTextField(
                    controller: _emailCtrl,
                    label: 'Email / Phone',
                    keyboardType: TextInputType.emailAddress,
                    validator: Validators.emailOrPhone,
                  ),
                  const SizedBox(height: 20),
                  AppButton(label: 'REQUEST RESET HELP', onPressed: _submit),
                ] else ...[
                  const Icon(Icons.mark_email_read_outlined, size: 56, color: AppColors.gold),
                  const SizedBox(height: 12),
                  const Text(
                    'Request received',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'For security, password resets are handled by our team. WhatsApp or call ${AppConfig.contactPhone} with your registered email/phone and we will help within 24 hours.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey.shade700, height: 1.4),
                  ),
                  const SizedBox(height: 20),
                  AppButton(label: 'WHATSAPP US', onPressed: launchWhatsApp),
                  const SizedBox(height: 10),
                  OutlinedButton(
                    onPressed: launchCall,
                    style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(48)),
                    child: const Text('Call us'),
                  ),
                ],
                TextButton(
                  onPressed: () => context.go('/login'),
                  child: const Text('Back to Login'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
