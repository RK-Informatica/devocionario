import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default async function Home() {
  const supabase = await createClient()

  const { data: pages = [] } = await supabase
    .from("pages")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(12)

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">NotionClone</h1>
            <p className="text-sm text-muted-foreground">Editable, open, collaborative</p>
          </div>
          <div className="flex gap-2">
            <Link href="/auth/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="space-y-6 text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Your Collaborative Workspace</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create, share, and edit pages just like Notion. Invite others with a secret code and collaborate in
            real-time.
          </p>
        </div>
      </section>

      {/* Published Pages Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h3 className="text-2xl font-bold mb-8">Explore Published Pages</h3>
        {pages.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            <p>No published pages yet. Create and share your first page!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pages.map((page) => (
              <Link key={page.id} href={`/public/${page.id}`}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <div className="flex items-start gap-3 mb-3">
                    {page.icon && <span className="text-2xl">{page.icon}</span>}
                    <h4 className="text-lg font-semibold line-clamp-2 flex-1">{page.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Published on {new Date(page.created_at).toLocaleDateString()}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-sm text-muted-foreground">NotionClone - A collaborative workspace built for teams</p>
        </div>
      </footer>
    </main>
  )
}
