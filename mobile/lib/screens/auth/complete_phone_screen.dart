import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../utils/validators.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/brand_header.dart';

class CompletePhoneScreen extends ConsumerStatefulWidget {
  const CompletePhoneScreen({super.key});

  @override
  ConsumerState<CompletePhoneScreen> createState() => _CompletePhoneScreenState();
}

class _CompletePhoneScreenState extends ConsumerState<CompletePhoneScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phoneCtrl = TextEditingController();

  @override
  void dispose() {
    _phoneCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();
    if (!_formKey.currentState!.validate()) return;

    final ok = await ref.read(authProvider.notifier).completePhone(
          Validators.tenDigitPhone(_phoneCtrl.text),
        );
    if (!mounted) return;
    if (ok) {
      context.go('/home');
      return;
    }

    final error =
        ref.read(authProvider).error ?? 'Could not save phone number. Try again.';
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(error), backgroundColor: Colors.red.shade700),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: AppColors.softGray,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: AppColors.charcoal,
        automaticallyImplyLeading: false,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                const BrandHeader(
                  subtitle:
                      'Google sign-in successful. Add your mobile number to finish signup.',
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
                      style: TextStyle(
                        color: Colors.red.shade800,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
                AppTextField(
                  controller: _phoneCtrl,
                  label: 'Mobile number',
                  hintText: '10-digit Indian mobile',
                  prefixText: '+91 ',
                  keyboardType: TextInputType.phone,
                  maxLength: 10,
                  textInputAction: TextInputAction.done,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(10),
                  ],
                  validator: Validators.phone,
                ),
                const SizedBox(height: 22),
                AppButton(
                  label: 'CONTINUE',
                  loading: auth.isLoading,
                  onPressed: _submit,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
