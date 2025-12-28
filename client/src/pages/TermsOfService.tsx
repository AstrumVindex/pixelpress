import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function TermsOfService() {
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
            <h1 className="text-4xl font-display font-bold mb-2">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">Last updated: December 2024</p>

            <section className="space-y-6">
              <div>
                <h2 className="text-2xl font-display font-bold mb-4">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using PixelPress, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold mb-4">2. Description of Service</h2>
                <p>
                  PixelPress is a free, browser-based image compression and optimization tool. The service:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Compresses images locally in your web browser</li>
                  <li>Does not upload files to our servers</li>
                  <li>Allows you to download compressed images to your device</li>
                  <li>Is provided on an "as-is" basis without guarantees</li>
                </ul>
                <p className="mt-4">
                  We reserve the right to modify or discontinue PixelPress at any time with or without notice.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold mb-4">3. User Responsibilities</h2>
                <p>
                  As a user of PixelPress, you are responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Ensuring you own or have the legal right to upload and compress the images you use</li>
                  <li>Not uploading images that violate copyright, trademark, or other intellectual property rights</li>
                  <li>Using compressed images only for lawful purposes and in compliance with all applicable laws</li>
                  <li>Being responsible for all consequences that result from your use of the service</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold mb-4">4. Intellectual Property</h2>
                <p>
                  <strong>PixelPress ownership:</strong> The PixelPress name, logo, design, code, and all related materials are owned by PixelPress and protected by copyright and trademark laws. You may not use, reproduce, or distribute these without explicit permission.
                </p>
                <p className="mt-4">
                  <strong>Your images:</strong> You retain full ownership of all images you upload to PixelPress. We do not claim any ownership rights over your images. By using PixelPress, you grant us the limited right to process your images for compression purposes only.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold mb-4">5. Prohibited Use</h2>
                <p>
                  You agree not to use PixelPress to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Upload or compress images for illegal purposes or in violation of any laws</li>
                  <li>Infringe on the rights of others (copyright, privacy, etc.)</li>
                  <li>Attempt to hack, break, or abuse the PixelPress service or website</li>
                  <li>Use automated tools, bots, or scripts to access PixelPress without permission</li>
                  <li>Overload or damage PixelPress systems through malicious activity</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold mb-4">6. Disclaimer of Warranties</h2>
                <p>
                  PixelPress is provided on an "as-is" and "as-available" basis without warranties of any kind, either express or implied.
                </p>
                <p className="mt-4">
                  Specifically, we do not warrant that:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>The service will always work perfectly or be free of errors</li>
                  <li>Compression results will be suitable for your specific needs</li>
                  <li>The service will be available at all times</li>
                  <li>Your images will never be lost or corrupted</li>
                </ul>
                <p className="mt-4">
                  Results vary depending on image type, quality, and compression settings. You are responsible for testing compression quality before using images in production.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold mb-4">7. Limitation of Liability</h2>
                <p>
                  To the fullest extent permitted by law, PixelPress is not responsible for:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>Loss, corruption, or damage to your images or data</li>
                  <li>Quality decisions you make regarding image compression</li>
                  <li>How you use the compressed images</li>
                  <li>Any indirect, incidental, or consequential damages</li>
                  <li>Loss of profits, revenue, or business opportunities</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold mb-4">8. Changes to the Service</h2>
                <p>
                  PixelPress features, functionality, compression algorithms, and any other aspects of the service may be updated, modified, or removed at any time. We may also add new features or change pricing (if applicable) without notice.
                </p>
                <p className="mt-4">
                  We will make efforts to notify users of major changes, but we reserve the right to make changes without prior notification.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold mb-4">9. Termination</h2>
                <p>
                  We reserve the right to restrict, suspend, or terminate your access to PixelPress at any time if:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>You violate these Terms of Service</li>
                  <li>You attempt to misuse the service</li>
                  <li>We believe your use is harmful or illegal</li>
                  <li>We discontinue PixelPress or the service in your region</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold mb-4">10. Governing Law</h2>
                <p>
                  These Terms of Service are governed by and construed in accordance with the laws applicable in the jurisdiction where PixelPress is provided, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold mb-4">11. Severability</h2>
                <p>
                  If any provision of these Terms is found to be invalid or unenforceable, that provision will be enforced to the maximum extent possible, and the remaining provisions will remain in full force and effect.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold mb-4">12. Contact Us</h2>
                <p>
                  If you have questions about these Terms of Service, please contact us at:
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
