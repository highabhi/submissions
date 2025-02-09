import Link from "next/link"
import { Button } from "./components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { ToastProvider } from "./components/ui/use-toast"

export default function Home() {
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

  return (
    <ToastProvider>
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl text-black font-bold">College Submission System</CardTitle>
          <CardDescription>Choose your role to continue</CardDescription>
        </CardHeader>
        <CardContent className="flex  flex-col space-y-4">
          <Link href="/student" passHref>
            <Button className="w-full  text-white text-lg py-6">Student</Button>
          </Link>
          <Link href="/teacher" passHref>
            <Button variant="outline" className="w-full text-black text-lg py-6">
              Teacher
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
    </ToastProvider>
  )
}

