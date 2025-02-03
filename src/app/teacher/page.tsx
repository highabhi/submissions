"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { ToastProvider, useToast } from "../components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Search, LogOut } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const API_URL = 'http://localhost:3001';

export default function TeacherDashboard() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [submissions, setSubmissions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBranch, setFilterBranch] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")



  // useEffect(() => {
  //   const token = localStorage.getItem("teacherToken")
  //   if (token) {
  //     setIsLoggedIn(true)
  //     fetchSubmissions(token)
  //   }
  // }, [])
  useEffect(() => {
    // Check auth status ONLY on client side
    const token = localStorage.getItem("teacherToken")
    setIsLoggedIn(!!token)
    if (token) fetchSubmissions(token)
  }, [])


  // return (
  //   <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center">
  //     <div className="animate-pulse text-[#6C63FF]">Loading...</div>
  //   </div>
  // )

  // const handleLogin = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   try {
  //     const response = await fetch(`${API_URL}/api/teacher/login`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ email, password }),
  //     })

  //     if (response.ok) {
  //       const data = await response.json()
  //       localStorage.setItem("teacherToken", data.token)
  //       setIsLoggedIn(true)
  //       fetchSubmissions(data.token)
  //       toast({ title: "Login Successful", description: "Welcome back!", variant:'success' })
  //     } else {
  //       throw new Error("Login failed")
  //     }
  //   } catch (error) {
  //     toast({
  //       title: "Login Failed",
  //       description: "Invalid email or password",
  //       variant: "destructive"
  //     })
  //   }
  // }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_URL}/api/teacher/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
  
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }
  
      localStorage.setItem("teacherToken", data.token)
      setIsLoggedIn(true)
      await fetchSubmissions(data.token) // Add await here
      
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("teacherToken")
    if (token) {
      fetchSubmissions(token).finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])
  
  // In render:
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center">
        <div className="animate-pulse text-[#6C63FF]">Loading...</div>
      </div>
    )
  }

  const fetchSubmissions = async (token: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_URL}/api/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setSubmissions(data)
      } else {
        throw new Error("Failed to fetch submissions")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch submissions",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("teacherToken")
    setIsLoggedIn(false)
    setSubmissions([])
  }

  const filteredSubmissions = submissions
    .filter(submission => 
      submission.batchInfo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.batchMembers.some((member: any) => 
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .filter(submission => 
      filterBranch === "all" || submission.branch === filterBranch
    )
    .sort((a, b) => sortOrder === "newest" ? 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() :
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )

  if (!isLoggedIn) {
    return (
      <ToastProvider>
        <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-[#6C63FF]">Teacher Login</h1>
              <p className="mt-2 text-gray-600">Sign in to access your dashboard</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-black text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-black text-white"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-[#6C63FF] hover:bg-[#5B54FF] h-12">
                Login
              </Button>
            </form>
          </div>
        </div>
      </ToastProvider>
    )
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#F8F7FF] p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-[#6C63FF]">Teacher Dashboard</h1>
              <p className="mt-2 text-gray-600">{submissions.length} submissions found</p>
            </div>
            <Button onClick={handleLogout} className="gap-2" variant="ghost">
              <LogOut size={18} /> Logout
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search batches..."
                className="pl-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterBranch} onValueChange={setFilterBranch}>
              <SelectTrigger className="h-12 w-[180px]">
                <SelectValue placeholder="Filter by branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                <SelectItem value="cs">Computer Science</SelectItem>
                <SelectItem value="ee">Electrical Engineering</SelectItem>
                <SelectItem value="me">Mechanical Engineering</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="h-12 w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="grid gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[200px] w-full rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredSubmissions.map((submission) => (
                <Card key={submission.id} className="bg-white shadow-lg">
                  <CardHeader className="bg-black text-white">
                    <CardTitle className="text-xl">{submission.batchInfo}</CardTitle>
                    <CardDescription className="text-gray-300">
                      {submission.branch.toUpperCase()} - {submission.course} • 
                      Submitted on {new Date(submission.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold mb-3">Batch Members</h3>
                        <ul className="space-y-2">
                          {submission.batchMembers.map((member: any, idx: number) => (
                            <li key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span>{member.name}</span>
                              <span className="text-gray-500 text-sm">{member.registrationNumber}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <Button
                            onClick={() => window.open(submission.pptFile, "_blank")}
                            className="w-full bg-black hover:bg-gray-900 h-12"
                          >
                            View Presentation
                          </Button>
                          <Button
                            onClick={() => window.open(submission.ieeeFile, "_blank")}
                            className="w-full bg-black hover:bg-gray-900 h-12"
                          >
                            View IEEE Doc
                          </Button>
                        </div>
                        {submission.remarks && (
                          <div className="p-4 bg-yellow-50 rounded-lg">
                            <h4 className="font-medium text-sm text-yellow-800">Remarks</h4>
                            <p className="text-sm text-yellow-700 mt-1">{submission.remarks}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && filteredSubmissions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No submissions found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </ToastProvider>
  )
}