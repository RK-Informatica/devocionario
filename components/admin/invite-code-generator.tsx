"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Copy, Check } from "lucide-react"

export function InviteCodeGenerator() {
  const [maxUses, setMaxUses] = useState<number | null>(null)
  const [expiresIn, setExpiresIn] = useState<number | null>(null)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [codes, setCodes] = useState<any[]>([])
  const [isLoadingCodes, setIsLoadingCodes] = useState(false)

  const generateCode = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()
      let expiresAt = null

      if (expiresIn) {
        const date = new Date()
        date.setHours(date.getHours() + expiresIn)
        expiresAt = date.toISOString()
      }

      const { data: user } = await supabase.auth.getUser()
      if (!user.user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("invite_codes")
        .insert([
          {
            code,
            created_by: user.user.id,
            max_uses: maxUses || null,
            expires_at: expiresAt,
          },
        ])
        .select()
        .single()

      if (error) throw error

      setGeneratedCode(code)
      setMaxUses(null)
      setExpiresIn(null)
      await loadCodes()
    } catch (error) {
      console.error("Error generating code:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCodes = async () => {
    const supabase = createClient()
    setIsLoadingCodes(true)

    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user.user) return

      const { data } = await supabase
        .from("invite_codes")
        .select("*")
        .eq("created_by", user.user.id)
        .order("created_at", { ascending: false })

      setCodes(data || [])
    } catch (error) {
      console.error("Error loading codes:", error)
    } finally {
      setIsLoadingCodes(false)
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate Invite Code</CardTitle>
          <CardDescription>Create a code to invite others to sign up</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="max-uses">Max Uses (Optional)</Label>
              <Input
                id="max-uses"
                type="number"
                placeholder="Leave empty for unlimited"
                value={maxUses || ""}
                onChange={(e) => setMaxUses(e.target.value ? Number.parseInt(e.target.value) : null)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expires-in">Expires In Hours (Optional)</Label>
              <Input
                id="expires-in"
                type="number"
                placeholder="Leave empty for never"
                value={expiresIn || ""}
                onChange={(e) => setExpiresIn(e.target.value ? Number.parseInt(e.target.value) : null)}
              />
            </div>
            <Button onClick={generateCode} disabled={isLoading} className="w-full">
              {isLoading ? "Generating..." : "Generate Code"}
            </Button>
            {generatedCode && (
              <div className="p-4 bg-muted rounded-lg flex items-center justify-between">
                <code className="font-mono font-bold">{generatedCode}</code>
                <button
                  onClick={() => copyToClipboard(generatedCode)}
                  className="p-2 hover:bg-background rounded transition-colors"
                  title="Copy code"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Invite Codes</CardTitle>
          <CardDescription>View and manage all your generated invite codes</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={loadCodes} className="mb-4 bg-transparent" disabled={isLoadingCodes}>
            {isLoadingCodes ? "Loading..." : "Refresh"}
          </Button>
          <div className="space-y-2">
            {codes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No codes generated yet</p>
            ) : (
              codes.map((code) => (
                <div key={code.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex-1">
                    <code className="font-mono font-bold">{code.code}</code>
                    <p className="text-xs text-muted-foreground mt-1">
                      Used: {code.used_count}/{code.max_uses || "∞"}{" "}
                      {code.expires_at && `• Expires: ${new Date(code.expires_at).toLocaleString()}`}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(code.code)}
                    className="p-2 hover:bg-background rounded transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
