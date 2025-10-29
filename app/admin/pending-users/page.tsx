"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle, XCircle, Clock, Search, Users, Filter } from "lucide-react"

interface User {
  id: string
  email: string
  name: string | null
  username: string | null
  user_type: string | null
  approval_status: string
  instagram_username: string | null
  instagram_verification_status: string | null
  created_at: string
  image: string | null
}

export default function AdminPendingUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [filterStatus, setFilterStatus] = useState("pending")
  const [filterUserType, setFilterUserType] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/login")
      return
    }

    checkAdminAndLoadUsers()
  }, [session, status, router, filterStatus, filterUserType])

  const checkAdminAndLoadUsers = async () => {
    try {
      setLoading(true)

      // 관리자 권한 확인
      const adminCheckResponse = await fetch("/api/auth/session")
      const sessionData = await adminCheckResponse.json()

      if (!sessionData?.user?.is_admin) {
        alert("관리자 권한이 필요합니다.")
        router.push("/")
        return
      }

      setIsAdmin(true)

      // 사용자 목록 로드
      let url = `/api/admin/pending-users?status=${filterStatus}`
      if (filterUserType !== "all") {
        url += `&user_type=${filterUserType}`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setUsers(data.users)
        setFilteredUsers(data.users)
      } else {
        console.error("사용자 목록 로드 실패:", data.error)
      }
    } catch (error) {
      console.error("데이터 로드 오류:", error)
      alert("데이터를 불러오는데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  // 검색 필터링
  useEffect(() => {
    if (!searchQuery) {
      setFilteredUsers(users)
      return
    }

    const filtered = users.filter(
      (user) =>
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.instagram_username?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredUsers(filtered)
  }, [searchQuery, users])

  const handleApprove = async (userId: string) => {
    if (!confirm("이 사용자를 승인하시겠습니까?")) return

    setProcessingId(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}/approval`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      })

      const data = await response.json()

      if (data.success) {
        alert("사용자가 승인되었습니다.")
        checkAdminAndLoadUsers()
      } else {
        alert(data.error || "승인에 실패했습니다.")
      }
    } catch (error) {
      console.error("승인 오류:", error)
      alert("승인 중 오류가 발생했습니다.")
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = (user: User) => {
    setSelectedUser(user)
    setShowRejectDialog(true)
  }

  const confirmReject = async () => {
    if (!selectedUser) return

    setProcessingId(selectedUser.id)
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/approval`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "rejected",
          rejection_reason: rejectionReason,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert("사용자가 거절되었습니다.")
        setShowRejectDialog(false)
        setRejectionReason("")
        setSelectedUser(null)
        checkAdminAndLoadUsers()
      } else {
        alert(data.error || "거절에 실패했습니다.")
      }
    } catch (error) {
      console.error("거절 오류:", error)
      alert("거절 중 오류가 발생했습니다.")
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            대기중
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            승인됨
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            거절됨
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getUserTypeBadge = (userType: string | null) => {
    if (!userType) return <Badge variant="outline">미선택</Badge>
    return (
      <Badge variant={userType === "INFLUENCER" ? "default" : "secondary"}>
        {userType === "INFLUENCER" ? "인플루언서" : "광고주"}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7b68ee] mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">가입 승인 관리</h1>
          <p className="text-gray-600">회원가입 신청을 검토하고 승인/거절할 수 있습니다.</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">승인 대기</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {users.filter((u) => u.approval_status === "pending").length}명
                  </p>
                </div>
                <Clock className="w-10 h-10 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">승인 완료</p>
                  <p className="text-2xl font-bold text-green-600">
                    {users.filter((u) => u.approval_status === "approved").length}명
                  </p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">거절됨</p>
                  <p className="text-2xl font-bold text-red-600">
                    {users.filter((u) => u.approval_status === "rejected").length}명
                  </p>
                </div>
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 필터 & 검색 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="이메일, 이름, 아이디로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">승인 대기</SelectItem>
                  <SelectItem value="approved">승인됨</SelectItem>
                  <SelectItem value="rejected">거절됨</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterUserType} onValueChange={setFilterUserType}>
                <SelectTrigger>
                  <SelectValue placeholder="회원 유형" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="INFLUENCER">인플루언서</SelectItem>
                  <SelectItem value="ADVERTISER">광고주</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 사용자 목록 테이블 */}
        <Card>
          <CardContent className="pt-6">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">표시할 사용자가 없습니다.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이메일</TableHead>
                    <TableHead>이름</TableHead>
                    <TableHead>회원 유형</TableHead>
                    <TableHead>인스타그램</TableHead>
                    <TableHead>가입일</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>{user.name || user.username || "-"}</TableCell>
                      <TableCell>{getUserTypeBadge(user.user_type)}</TableCell>
                      <TableCell>
                        {user.instagram_username ? (
                          <div className="flex items-center gap-2">
                            <span className="text-sm">@{user.instagram_username}</span>
                            {user.instagram_verification_status === "verified" && (
                              <CheckCircle className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString("ko-KR")}</TableCell>
                      <TableCell>{getStatusBadge(user.approval_status)}</TableCell>
                      <TableCell className="text-right">
                        {user.approval_status === "pending" && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                              onClick={() => handleApprove(user.id)}
                              disabled={processingId === user.id}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              승인
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                              onClick={() => handleReject(user)}
                              disabled={processingId === user.id}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              거절
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 거절 사유 입력 다이얼로그 */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>가입 거절</DialogTitle>
            <DialogDescription>
              {selectedUser?.email} 님의 가입을 거절하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              거절 사유 (선택사항)
            </label>
            <Textarea
              placeholder="거절 사유를 입력하세요..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false)
                setRejectionReason("")
                setSelectedUser(null)
              }}
            >
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={confirmReject}
              disabled={!!processingId}
            >
              거절
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}