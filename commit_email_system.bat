@echo off
echo Adding all files to git...
git add -A
echo.
echo Current git status:
git status
echo.
echo Committing files...
git commit -m "✨ Add Email Notification System

- Implemented complete email service with Nodemailer
- Added 5 beautiful HTML email templates  
- Integrated welcome emails on user registration
- Integrated payment verification/rejection emails
- Support for Gmail, SendGrid, and AWS SES
- Fixed all TypeScript errors
- Added comprehensive documentation

Features:
- Welcome emails on registration
- Payment verification emails
- Payment rejection emails
- Password reset email template
- Money request approval email template
- Professional HTML design
- Mobile-responsive templates
- Async sending
- Error handling
- Multi-provider SMTP support

Files:
- server/services/email.ts
- server/routes/auth.ts
- server/routes/manualPayment.ts
- server/database.ts
- server/services/payment.ts
- EMAIL_*.md documentation
- package.json updates"

echo.
echo Pushing to GitHub...
git push
echo.
echo Done!
pause
