import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Header />
      
      <main className="pt-24 pb-20 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <Link href="/">
            <a className="inline-flex items-center gap-2 text-primary hover:underline mb-8">
              <ChevronLeft className="w-4 h-4" />
              Back to home
            </a>
          </Link>

          <article className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
            <h1 className="text-4xl font-display font-bold mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground mb-8">Last updated: December 2024</p>

            <section className="space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold mb-4">1. Introduction</h2>
                <p>
                  PixelPress ("we," "us," "our," or "Company") operates the PixelPress website and service. This Privacy Policy explains how we handle your information when you use our image compression tool.
                </p>
                <p>
                  At PixelPress, we are committed to protecting your privacy. We believe that your images and personal data should remain yours alone. This policy describes our privacy practices in simple, straightforward terms.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold mb-4">2. Information We Do NOT Collect</h2>
                <p className="font-semibold mb-3">This is core to who we are:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>
                    <strong>We do not upload images to any server.</strong> All image compression happens entirely in your web browser. Your images never leave your device.
                  </li>
                  <li>
                    <strong>We do not store images.</strong> Compressed images are not saved, stored, or retained on any of our servers.
                  </li>
                  <li>
                    <strong>We do not collect image content.</strong> We cannot see, analyze, or access any of the images you process.
                  </li>
                  <li>
                    <strong>We do not share images.</strong> Your images are never shared with third parties under any circumstances.
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold mb-4">3. Information We May Collect</h2>
                <p>
                  We may collect limited, non-personal information to improve our service:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>
                    <strong>Anonymous usage analytics:</strong> Information about how many people use PixelPress, which features are most popular, and general usage patterns (without connecting this to your identity).
                  </li>
                  <li>
                    <strong>Device and browser information:</strong> Your browser type, operating system, and device type. This helps us ensure PixelPress works smoothly on all devices.
                  </li>
                  <li>
                    <strong>Cookies:</strong> Small files stored on your device to remember your preferences and keep you logged in, if applicable.
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold mb-4">4. How We Use Information</h2>
                <p>Any information we collect is used only to:</p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Improve the performance and reliability of PixelPress</li>
                  <li>Identify and fix bugs or technical issues</li>
                  <li>Enhance user experience and add new features</li>
                  <li>Comply with legal requirements</li>
                </ul>
                <p className="mt-4">
                  We do not use your information for marketing, advertising, or selling to third parties.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold mb-4">5. Cookies</h2>
                <p>
                  Cookies are small files stored on your device. We use cookies to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Remember your preferences (like theme and language)</li>
                  <li>Track basic usage metrics to improve our service</li>
                </ul>
                <p className="mt-4">
                  You can disable cookies in your browser settings. Disabling cookies may affect some features of PixelPress.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold mb-4">6. Third-Party Services</h2>
                <p>
                  PixelPress may use third-party services to enhance our platform:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>
                    <strong>Google AdSense:</strong> We may display ads through Google AdSense. Google may use cookies and other tracking technologies according to their own privacy policy.
                  </li>
                  <li>
                    <strong>Analytics services:</strong> We may use analytics tools to understand how people use PixelPress.
                  </li>
                </ul>
                <p className="mt-4">
                  These services have their own privacy policies. We are not responsible for their practices. We encourage you to review their privacy policies.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold mb-4">7. Data Security</h2>
                <p>
                  Your security is a top priority:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>
                    <strong>Client-side processing:</strong> All image compression happens on your device, using your browser's processing power. No data travels to our servers.
                  </li>
                  <li>
                    <strong>No uploads:</strong> Because images never leave your device, there is no risk of them being intercepted or stolen in transit.
                  </li>
                  <li>
                    <strong>Privacy-first design:</strong> PixelPress was built from the ground up with privacy as the core principle.
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold mb-4">8. Children's Privacy</h2>
                <p>
                  PixelPress does not knowingly collect personal information from children under the age of 13. If we become aware that a child under 13 has provided us with personal information, we will delete such information promptly. If you believe a child under 13 has used our service, please contact us immediately.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold mb-4">9. Changes to This Privacy Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices, technology, or legal requirements. We will notify you of significant changes by posting the updated policy on our website with an updated "Last Updated" date.
                </p>
                <p className="mt-4">
                  Your continued use of PixelPress after changes become effective means you accept the updated Privacy Policy.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold mb-4">10. Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy or our privacy practices, please contact us at:
                </p>
                <div className="bg-muted/30 p-4 rounded-lg mt-4 border border-border">
                  <p className="font-semibold">PixelPress Support</p>
                  <p className="text-sm text-muted-foreground">Email: pixelpresshelp4u@gmail.com</p>
                </div>
              </div>
            </section>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
}
