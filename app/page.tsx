import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-svh items-center justify-center bg-gradient-to-b from-background to-background/80">
      <div className="space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold tracking-tight">NotionClone</h1>
          <p className="text-xl text-muted-foreground">Your personal productivity workspace</p>
        </div>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/login">
            <Button variant="outline" size="lg">
              Login
            </Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button size="lg">Sign Up</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
