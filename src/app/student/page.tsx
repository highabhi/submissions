"use client";

import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Progress } from "../components/ui/progress";
import { ToastProvider, useToast } from "../components/ui/use-toast";

const API_URL = "http://localhost:3001";

export default function StudentSubmissionForm() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    branch: "",
    course: "",
    rollNumber: "",
    section: "",
    name: "",
    batchInfo: "",
    pptFile: null as File | null,
    ieeeFile: null as File | null,
    batchMembers: [{ name: "", registrationNumber: "" }],
    remarks: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleBatchMemberChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedBatchMembers = [...formData.batchMembers];
    updatedBatchMembers[index] = {
      ...updatedBatchMembers[index],
      [field]: value,
    };
    setFormData((prev) => ({ ...prev, batchMembers: updatedBatchMembers }));
  };

  const addBatchMember = () => {
    setFormData((prev) => ({
      ...prev,
      batchMembers: [
        ...prev.batchMembers,
        { name: "", registrationNumber: "" },
      ],
    }));
  };

  const removeBatchMember = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      batchMembers: prev.batchMembers.filter((_, i) => i !== index),
    }));
  };

  const nextStep = () => {
    let isValid = true;
    switch (step) {
      case 1:
        isValid =
          !!formData.branch &&
          !!formData.course &&
          !!formData.rollNumber &&
          !!formData.section;
        break;
      case 2:
        isValid =
          !!formData.name &&
          !!formData.batchInfo &&
          !!formData.pptFile &&
          !!formData.ieeeFile;
        break;
      case 3:
        isValid = formData.batchMembers.every(
          (member) => member.name.trim() && member.registrationNumber.trim()
        );
        break;
    }

    if (!isValid) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields before proceeding",
        variant: "destructive",
      });
      return;
    }

    setStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "batchMembers") {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (value instanceof File) {
          formDataToSend.append(key, value);
        } else {
          formDataToSend.append(key, String(value));
        }
      });

      const response = await fetch(`${API_URL}/api/submit`, {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        toast({
          title: "Submission Successful",
          description: "Your documents have been submitted successfully.",
          variant: "default",
        });
        // Reset form
        setFormData({
          branch: "",
          course: "",
          rollNumber: "",
          section: "",
          name: "",
          batchInfo: "",
          pptFile: null,
          ieeeFile: null,
          batchMembers: [{ name: "", registrationNumber: "" }],
          remarks: "",
        });
        setStep(1);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Submission failed");
      }
    } catch (error) {
      toast({
        title: "Submission Failed",
        description:
          error instanceof Error
            ? error.message
            : "There was an error submitting your documents. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const savedFormData = localStorage.getItem("studentFormData");
    if (savedFormData) {
      setFormData(JSON.parse(savedFormData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("studentFormData", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    return () => {
      localStorage.removeItem("studentFormData");
    };
  }, []);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#F8F7FF] p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-[#6C63FF]">
              Student Document Submission
            </h1>
            <p className="text-gray-600 text-lg">
              Step {step} of 4:{" "}
              {step === 1
                ? "Basic Information"
                : step === 2
                ? "Personal Details"
                : step === 3
                ? "Batch Members"
                : "Final Details"}
            </p>
            <Progress value={(step / 4) * 100} className="h-2 bg-gray-100">
              <div
                className="bg-[#6C63FF] h-full rounded-full transition-all duration-300"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </Progress>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Branch
                  </Label>
                  <Select
                    name="branch"
                    onValueChange={(value) =>
                      handleSelectChange("branch", value)
                    }
                  >
                    <SelectTrigger className="h-12 bg-gray-800 text-white border-0">
                      <SelectValue placeholder="Select Branch" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="ca">Computer Applications</SelectItem>
                      <SelectItem value="cs">Computer Science</SelectItem>
                      <SelectItem value="ee">Electrical Engineering</SelectItem>
                      <SelectItem value="me">Mechanical Engineering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Course
                  </Label>
                  <Select
                    name="course"
                    onValueChange={(value) =>
                      handleSelectChange("course", value)
                    }
                  >
                    <SelectTrigger className="h-12 bg-gray-800 text-white border-0">
                      <SelectValue placeholder="Select Course" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="mtech">BCA</SelectItem>
                      <SelectItem value="phd">BBA</SelectItem>
                      <SelectItem value="btech">B.Tech</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Roll Number
                  </Label>
                  <Input
                    name="rollNumber"
                    value={formData.rollNumber}
                    onChange={handleInputChange}
                    className="h-12 bg-gray-800 text-white border-0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Section
                  </Label>
                  <Input
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    className="h-12 bg-gray-800 text-white border-0"
                    required
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Your Name
                  </Label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="h-12 bg-gray-800 text-white border-0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Batch Information
                  </Label>
                  <Input
                    name="batchInfo"
                    value={formData.batchInfo}
                    onChange={handleInputChange}
                    className="h-12 bg-gray-800 text-white border-0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Upload PPT
                  </Label>
                  <Input
                    name="pptFile"
                    type="file"
                    onChange={handleFileChange}
                    accept=".ppt,.pptx,.pdf"
                    className="h-12 bg-white border-2 border-gray-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Upload IEEE Document
                  </Label>
                  <Input
                    name="ieeeFile"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    className="h-12 bg-white border-2 border-gray-200"
                    required
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                {formData.batchMembers.map((member, index) => (
                  <div
                    key={index}
                    className="p-6 bg-gray-100 rounded-lg space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Member {index + 1}</h3>
                      {index > 0 && (
                        <Button
                          type="button"
                          onClick={() => removeBatchMember(index)}
                          variant="destructive"
                          size="sm"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name</Label>
                        <Input
                          value={member.name}
                          onChange={(e) =>
                            handleBatchMemberChange(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Registration Number</Label>
                        <Input
                          value={member.registrationNumber}
                          onChange={(e) =>
                            handleBatchMemberChange(
                              index,
                              "registrationNumber",
                              e.target.value
                            )
                          }
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="space-y-2">
                  <Button
                    type="button"
                    onClick={addBatchMember}
                    disabled={formData.batchMembers.length >= 5}
                    className="w-full"
                  >
                    Add Batch Member{" "}
                    {formData.batchMembers.length >= 5 && "(Maximum 5)"}
                  </Button>
                  {formData.batchMembers.length < 3 && (
                    <p className="text-red-500 text-sm">
                      Minimum 3 members required
                    </p>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Remarks (Optional)
                  </Label>
                  <Textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    placeholder="Any additional comments or remarks"
                    className="min-h-[150px] bg-gray-800 text-white border-0"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              {step > 1 && (
                <Button
                  type="button"
                  onClick={prevStep}
                  className="bg-gray-800 text-white hover:bg-gray-700"
                >
                  Previous
                </Button>
              )}
              <div className="ml-auto">
                {step < 4 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-gray-800 text-white hover:bg-gray-700"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-[#6C63FF] text-white hover:bg-[#5B54FF]"
                  >
                    Submit
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </ToastProvider>
  );
}
