import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, TrendingUp, Shield, Clock, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-green-600">Farmeely</div>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/auth/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-foreground mb-6">
          Group Livestock Buying
          <span className="text-green-600"> Made Simple</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Join Livestock groups, pool resources with other buyers. Start with as
          little as ₦5,000.
        </p>
        <div className="space-x-4">
          <Link href="/auth/signup">
            <Button size="lg" className="px-8 py-3">
              Start Buying Today
            </Button>
          </Link>
          <Button
            variant="outline"
            size="lg"
            className="px-8 py-3 bg-transparent"
          >
            How It Works
          </Button>
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">₦2.5M+</div>
            <div className="text-muted-foreground">Total Transaction</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">15,000+</div>
            <div className="text-muted-foreground">Active Buyers</div>
          </div>
          {/* <div className="text-center">
            <div className="text-3xl font-bold text-green-600">25%</div>
            <div className="text-muted-foreground">Average Returns</div>
          </div> */}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
          How Group Buying Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              Browse Groups
            </h3>
            <p className="text-muted-foreground">
              Explore active groups for different livestock types. Each group
              shows real-time progress and available slots.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              Buy Slots
            </h3>
            <p className="text-muted-foreground">
              Purchase slots in groups that match your budget and risk
              preference. Pool resources with other Buyers to reduce individual
              risk.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-green-600">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">
              Track Progress
            </h3>
            <p className="text-muted-foreground">
              Track your group progress and know when your livestock are
              available for dispatch. Get updates on group activities and
              performance.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Why Choose Group Buying?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader>
                <Users className="w-12 h-12 text-green-600 mb-4" />
                <CardTitle>Shared Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Reduce individual risk by pooling resources with other
                  investors. Share both costs and leave the rest for us to take
                  care of.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-green-600 mb-4" />
                <CardTitle>Live Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Track real-time progress of your groups. See slots taken,
                  funding progress, and updates.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="w-12 h-12 text-green-600 mb-4" />
                <CardTitle>Secure Platform</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Your Money are protected with secure payment processing and
                  transparent group management.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="w-12 h-12 text-green-600 mb-4" />
                <CardTitle>Flexible Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Start with small amounts, join multiple groups.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Live Groups Preview */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            Active Groups
          </h2>
          <p className="text-muted-foreground">
            Join these trending groups with live progress updates
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Mock group cards */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Premium Cattle Group</CardTitle>
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-900 dark:text-green-400">
                  Active
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Progress:</span>
                  <span className="font-semibold">75% funded</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>₦50,000 per slot</span>
                  <span>5 slots left</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  Goat Farming Collective
                </CardTitle>
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-900 dark:text-green-400">
                  Active
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Progress:</span>
                  <span className="font-semibold">60% funded</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: "60%" }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>₦25,000 per slot</span>
                  <span>8 slots left</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Poultry Hub</CardTitle>
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded dark:bg-green-900 dark:text-green-400">
                  Active
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Progress:</span>
                  <span className="font-semibold">90% funded</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: "90%" }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>₦15,000 per slot</span>
                  <span>2 slots left</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Link href="/auth/signup">
            <Button size="lg">
              View All Groups
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Group Buying?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of Buyers through collaborative livestock Buying
          </p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary" className="px-8 py-3">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-green-600 mb-4">
                Farmeely
              </div>
              <p className="text-muted-foreground">
                Making livestock cheper and accessible through group
                collaboration
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>How It Works</li>
                <li>Livestock Groups</li>
                <li>Live Progress</li>
                {/* <li></li> */}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>FAQ</li>
                <li>Buying Guide</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>Terms of Service</li>
                <li>Privacy Policy</li>
                <li>Risk Disclosure</li>
                <li>Agreement</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 Farmeely. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
// Auto-deployment test - Sat, Oct  4, 2025  5:28:47 PM
