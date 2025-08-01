export const getVerificationEmailTemplate = (otpCode, verifyUrl) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Verify Your Email</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Hello,</p>
    <p>Thank you for signing up! You can verify your account using the OTP code below or by clicking the verification link.</p>

    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">${otpCode}</span>
    </div>

    <p style="text-align: center; margin: 20px 0;">
      <a href="${verifyUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Verify My Email</a>
    </p>

    <p>This OTP and link will expire in 30 minutes for security reasons.</p>
    <p>If you didn't create an account, you can ignore this email.</p>
    <p>Best regards,<br>REDAN Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>This is an automated message. Please do not reply.</p>
  </div>
</body>
</html>
`;


export const WELCOME_EMAIL_TEMPLATE = (name) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto;">
  <div style="background-color: #4CAF50; padding: 20px; color: white; text-align: center;">
    <h1>Welcome to Our Platform!</h1>
  </div>
  <div style="background-color: #fff; padding: 20px;">
    <p>Hi ${name},</p>
    <p>We're excited to have you on board. Your account has been successfully verified.</p>
    <p>Feel free to explore our platform and make the most of our services.</p>
    <p>Cheers,<br/>The Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #aaa; font-size: 0.8em;">
    <p>This is an automated message. Please do not reply.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_EMAIL_TEMPLATE = (resetLink) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Password Reset</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto;">
  <div style="background-color: #f44336; padding: 20px; color: white; text-align: center;">
    <h1>Password Reset Request</h1>
  </div>
  <div style="background-color: #fff; padding: 20px;">
    <p>Hello,</p>
    <p>We received a request to reset your password. Click the button below to continue:</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a>
    </div>
    <p>If you didn't request this, you can safely ignore this email.</p>
    <p>This link will expire in 30 minutes.</p>
    <p>Regards,<br/>The Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #aaa; font-size: 0.8em;">
    <p>This is an automated message. Please do not reply.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_CHANGED_EMAIL_TEMPLATE = (name) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Password Changed</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto;">
  <div style="background-color: #2196F3; padding: 20px; color: white; text-align: center;">
    <h1>Password Changed</h1>
  </div>
  <div style="background-color: #fff; padding: 20px;">
    <p>Hi ${name},</p>
    <p>Your password has been successfully updated.</p>
    <p>If you did not perform this action, please reset your password immediately or contact support.</p>
    <p>Regards,<br/>The Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #aaa; font-size: 0.8em;">
    <p>This is an automated message. Please do not reply.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = (name = "there") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Password Reset Successful</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 6px;">
    <h2 style="color: #4CAF50;">Your Password Has Been Reset</h2>
    <p>Hi ${name},</p>
    <p>Your password was successfully updated. If you didn’t perform this action, please contact support immediately.</p>
    <p>You can now log in to your account using your new password.</p>
    <p>Thank you,<br>The REDAN Team</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #999; font-size: 0.85rem;">
    <p>This is an automated email. Please do not reply.</p>
  </div>
</body>
</html>
`;
