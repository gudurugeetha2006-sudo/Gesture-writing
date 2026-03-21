import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Camera, Zap, Share2, BarChart3, Lock, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Camera className="w-6 h-6 text-primary" />
          <span className="text-xl font-bold">Gesture Writer</span>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/writer">Start Writing</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20 max-w-6xl mx-auto">
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Revolutionary Input Method</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-balance">
            Write with Your <span className="text-primary">Hand Gestures</span>
          </h1>
          
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Experience the future of text input. Use hand gestures detected through your webcam to write text in real-time. No keyboard or mouse needed.
          </p>

          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" asChild>
              <Link href="/writer">Try It Now</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <FeatureCard
            icon={<Camera className="w-6 h-6" />}
            title="Real-Time Recognition"
            description="Advanced hand gesture recognition powered by MediaPipe and computer vision."
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            title="Instant Text Output"
            description="Watch your gestures transform into text instantly on your screen."
          />
          <FeatureCard
            icon={<Share2 className="w-6 h-6" />}
            title="Easy Sharing"
            description="Copy, share via email, download as files, or export to different formats."
          />
          <FeatureCard
            icon={<Lock className="w-6 h-6" />}
            title="Secure & Private"
            description="Your texts and data are encrypted and stored securely in the cloud."
          />
          <FeatureCard
            icon={<BarChart3 className="w-6 h-6" />}
            title="Document History"
            description="Access and manage all your previously written documents in one place."
          />
          <FeatureCard
            icon={<Sparkles className="w-6 h-6" />}
            title="Smart Features"
            description="Auto-save, manual editing, and text-to-speech for accessibility."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 bg-primary/5 border-y border-border">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Transform Your Writing?</h2>
          <p className="text-lg text-muted-foreground">
            Try hand gestures to write right now. No sign up required.
          </p>
          <Button size="lg" asChild>
            <Link href="/writer">Start Writing Free</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-border text-center text-sm text-muted-foreground">
        <p>&copy; 2024 Gesture Writer. All rights reserved.</p>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-lg border border-border bg-card hover:bg-secondary/30 transition-colors">
      <div className="text-primary mb-3">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
