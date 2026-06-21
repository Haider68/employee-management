"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/context/auth"
import { SalaryRecord } from "@/components/types/salary"

export default function SalaryPage() {
  const { user } = useAuth()
  const [salaries, setSalaries] = useState<SalaryRecord[]>([])
  const [loading, setLoading] = useState(true)

  const userRole = (user as any)?.data?.user?.role || (user as any)?.role || "employee"
  const isAdmin = userRole === "admin"

  useEffect(() => {
    fetchSalaries()
  }, [])

  const fetchSalaries = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      
      const userId = (user as any)?.data?.user?._id || (user as any)?._id
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || ""
      const url = isAdmin 
        ? `${baseUrl}/salary/records`
        : `${baseUrl}/salary/records?employeeId=${userId}`

      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })
      const data = await res.json()
      if (data.success) {
        setSalaries(data.data)
      }
    } catch (err) {
      console.error("Failed to fetch salaries", err)
    } finally {
      setLoading(false)
    }
  }

  const markAsPaid = async (id: string) => {
    try {
      const token = localStorage.getItem("token")
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || ""
      const res = await fetch(`${baseUrl}/salary/records/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: "paid" })
      })
      const data = await res.json()
      if (data.success) {
        setSalaries(prev => prev.map(s => s._id === id ? data.data : s))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleProcessSalaries = async () => {
    const month = prompt("Enter month number (1-12):")
    if (!month) return
    const year = new Date().getFullYear()

    try {
      const token = localStorage.getItem("token")
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") || ""
      await fetch(`${baseUrl}/salary/process-all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ month, year })
      })
      fetchSalaries()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div className="p-8">Loading salary data...</div>

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-600 to-indigo-600">
            {isAdmin ? "Global Salary Management" : "My Salary Records"}
          </h1>
          <p className="text-gray-500 mt-2">Manage and view monthly payslips, overtime, and deductions.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={handleProcessSalaries}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-md font-medium shadow-sm transition-all"
          >
            Process Salaries
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Period</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Base</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">OT / Deductions</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Net</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              {isAdmin && <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {salaries.map(salary => (
              <tr key={salary._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{salary.employee?.fullName || "Employee"}</div>
                  <div className="text-sm text-gray-500">{salary.employee?.department || "N/A"}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {salary.month}/{salary.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium font-mono">
                  RS.{salary.baseSalary?.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-xs text-green-600">+ RS.{salary.overtimePay?.toFixed(2)} (OT)</div>
                  <div className="text-xs text-red-600">- RS.{salary.deductionAmount?.toFixed(2)} (Shortage)</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 font-mono">
                  RS.{salary.netSalary?.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${salary.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                    {salary.status.toUpperCase()}
                  </span>
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {salary.status === 'pending' && (
                      <button 
                        onClick={() => markAsPaid(salary._id)}
                        className="text-white bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded transition-colors text-xs font-medium shadow-sm"
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {salaries.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                  No salary records found. Try processing salaries for this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
