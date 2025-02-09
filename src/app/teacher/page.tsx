"use client";

import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ToastProvider, useToast } from "../components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Search, LogOut, FileText, Download, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog"

const API_URL = "http://localhost:3001";

interface BatchMember {
  name: string;
  registrationNumber: string;
  _id: { $oid: string };
}

interface Submission {
  _id: { $oid: string };
  branch: string;
  course: string;
  rollNumber: string;
  section: string;
  name: string;
  batchInfo: string;
  pptFile: { filename: string; path: string };
  ieeeFile: { filename: string; path: string };
  batchMembers: BatchMember[];
  remarks: string;
  submittedAt: { $date: { $numberLong: string } };
}

const DepartmentMap: { [key: string]: string } = {
  cs: "Computer Science",
  ee: "Electrical Engineering",
  me: "Mechanical Engineering",
};

export default function TeacherDashboard() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBranch, setFilterBranch] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedCourse, setSelectedCourse] = useState("all");

  const [activeDocument, setActiveDocument] = useState<{
    url: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("teacherToken");
    if (token) {
      setIsLoggedIn(true);
      fetchSubmissions(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/teacher/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("teacherToken", data.token);
      setIsLoggedIn(true);
      await fetchSubmissions(data.token);

      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.teacher.name}`,
        variant: "error",
      });
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      toast({
        title: "Login Failed",
        description:
          error instanceof Error ? error.message : "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubmissions = async (token: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch submissions: ${response.statusText}`);
      }

      const data = await response.json();
      setSubmissions(data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch submissions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSubmissions = submissions
    .filter((submission) => {
      const matchesSearch =
        submission.batchInfo
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        submission.batchMembers.some(
          (member) =>
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.registrationNumber.includes(searchQuery)
        );
      const matchesBranch =
        filterBranch === "all" || submission.branch === filterBranch;
      const matchesCourse =
        selectedCourse === "all" ||
        submission.course.toLowerCase() === selectedCourse.toLowerCase();
      return matchesSearch && matchesBranch && matchesCourse;
    })
    .sort((a, b) => {
      const dateA = Number(a.submittedAt.$date.$numberLong);
      const dateB = Number(b.submittedAt.$date.$numberLong);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

  const uniqueCourses = Array.from(
    new Set(submissions.map((s) => s.course.toLowerCase()))
  );

  const handleFileView = (filePath: string, title: string) => {
    console.log("Opening file:", filePath); 
    setActiveDocument({
      url: `${API_URL}/${filePath}`,
      title: title,
    });
  };

  const handleFileDownload = async (filePath: string, fileName: string) => {
    try {
      const response = await fetch(`${API_URL}/${filePath}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Success",
        description: "File downloaded successfully",
        variant: "destructive"
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download the file",
        variant: "destructive",
      });
    }
  };

  if (!isLoggedIn) {
    return (
      <ToastProvider>
        <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center p-8">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-[#6C63FF]">
                Teacher Login
              </CardTitle>
              <CardDescription className="text-center">
                Sign in to access the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#6C63FF] hover:bg-[#5B54FF] h-12"
                >
                  Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#F8F7FF] p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-[#6C63FF]">
                Teacher Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                {filteredSubmissions.length}{" "}
                {filterBranch !== "all"
                  ? DepartmentMap[filterBranch as keyof typeof DepartmentMap]
                  : ""}{" "}
                submissions found
              </p>
            </div>
            <Button
              onClick={() => {
                localStorage.removeItem("teacherToken");
                setIsLoggedIn(false);
              }}
              variant="outline"
              className="gap-2"
            >
              <LogOut size={18} /> Logout
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by batch info or student name..."
                className="pl-10 h-12"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={filterBranch} onValueChange={setFilterBranch}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {Object.entries(DepartmentMap).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {uniqueCourses.map((course) => (
                  <SelectItem key={course} value={course}>
                    {course.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6">
            {filteredSubmissions.map((submission) => (
              <Card key={typeof submission._id === 'object' ? submission._id.$oid : submission._id || Math.random()} className="overflow-hidden">
                <CardHeader className="bg-black text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">
                        Batch {submission.batchInfo}
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        {DepartmentMap[submission.branch]} •{" "}
                        {submission.course.toUpperCase()} • Section{" "}
                        {submission.section}
                      </CardDescription>
                    </div>
                    <div className="text-right text-sm text-gray-300">
                      Submitted:{" "}
                      {submission.submittedAt?.$date?.$numberLong
                        ? new Date(
                            Number(submission.submittedAt.$date.$numberLong)
                          ).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Team Members</h3>
                    <div className="space-y-2">
                      {submission.batchMembers.map((member, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-gray-500">
                            {member.registrationNumber}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid gap-3">
                    <div className="flex gap-2">
                        <Button 
                          onClick={() => handleFileView(submission.pptFile.path, "Presentation")}
                          className="flex-1 bg-[#6C63FF] hover:bg-[#5B54FF]"
                        >
                          <FileText className="mr-2" size={18} />
                          View Presentation
                        </Button>
                        <Button 
                          onClick={() => handleFileDownload(submission.pptFile.path, submission.pptFile.filename)}
                          variant="outline"
                          className="px-3"
                        >
                          <Download size={18} />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                      <Button 
                          onClick={() => handleFileView(submission.ieeeFile.path, "IEEE Document")}
                          className="flex-1 bg-[#6C63FF] hover:bg-[#5B54FF]"
                        >
                          <FileText className="mr-2" size={18} />
                          View IEEE Document
                        </Button>
                        <Button 
                          onClick={() => handleFileDownload(submission.ieeeFile.path, submission.ieeeFile.filename)}
                          variant="outline"
                          className="px-3"
                        >
                          <Download size={18} />
                        </Button>
                      </div>
                    </div>

                    {submission.remarks && (
                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <h4 className="font-medium text-yellow-800">Remarks</h4>
                        <p className="mt-1 text-yellow-700">
                          {submission.remarks}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredSubmissions.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No submissions found matching your criteria
              </div>
            )}
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
