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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
<<<<<<< HEAD
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { CheckCircle, XCircle, Clock, Search, Users, Instagram } from "lucide-react"
=======
import { CheckCircle, XCircle, Clock, Search, Users, Instagram } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
>>>>>>> 63e1c5b91733f1cf2ee204e6f5c1f3682e024ef5

interface User {
  id: string
  email: string
  name: string | null
  username: string | null
  user_type: string | null
  instagram_username: string | null
  instagram_data: string | null
  instagram_verification_status: string | null
  created_at: string
  image: string | null
}

<<<<<<< HEAD
export default function AdminUsersPage() {
=======
export default function AdminPage() {
>>>>>>> 63e1c5b91733f1cf2ee204e6f5c1f3682e024ef5
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
<<<<<<< HEAD
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
=======
  const [showInstagramDialog, setShowInstagramDialog] = useState(false)
>>>>>>> 63e1c5b91733f1cf2ee204e6f5c1f3682e024ef5
  const [filterUserType, setFilterUserType] = useState("all")
  const [filterInstagramStatus, setFilterInstagramStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState("pending") // pending, verified, all
=======
  const [activeTab, setActiveTab] = useState("instagram")
>>>>>>> 63e1c5b91733f1cf2ee204e6f5c1f3682e024ef5

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/login?type=advertiser")
      return
    }

    checkAdminAndLoadUsers()
<<<<<<< HEAD
  }, [session, status, router, filterUserType, activeTab])
=======
  }, [session, status, router, filterUserType, filterInstagramStatus])
>>>>>>> 63e1c5b91733f1cf2ee204e6f5c1f3682e024ef5

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

<<<<<<< HEAD
      // 사용자 목록 로드
      let url = `/api/admin/users?`
=======
      // 전체 사용자 목록 로드
      let url = `/api/admin/pending-users?status=approved`
>>>>>>> 63e1c5b91733f1cf2ee204e6f5c1f3682e024ef5
      if (filterUserType !== "all") {
        url += `user_type=${filterUserType}&`
      }
      if (activeTab !== "all") {
        url += `instagram_status=${activeTab}`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        let loadedUsers = data.users
        
        // 인스타그램 상태 필터링
        if (filterInstagramStatus !== "all") {
          loadedUsers = loadedUsers.filter((u: User) => 
            u.instagram_verification_status === filterInstagramStatus
          )
        }
        
        setUsers(loadedUsers)
        setFilteredUsers(loadedUsers)
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

<<<<<<< HEAD
  const handleApproveInstagram = async (userId: string) => {
    if (!confirm("인스타그램 인증을 승인하시겠습니까?")) return

    setProcessingId(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}/instagram-verification`, {
=======
  // ✅ 인스타그램 인증 승인
  const handleInstagramApprove = async (userId: string) => {
    if (!confirm("이 인플루언서의 인스타그램을 인증하시겠습니까?")) return

    setProcessingId(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}/instagram-verify`, {
>>>>>>> 63e1c5b91733f1cf2ee204e6f5c1f3682e024ef5
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "verified" }),
      })

      const data = await response.json()

      if (data.success) {
<<<<<<< HEAD
        alert("인스타그램 인증이 승인되었습니다.")
=======
        alert("인스타그램이 인증되었습니다.")
>>>>>>> 63e1c5b91733f1cf2ee204e6f5c1f3682e024ef5
        checkAdminAndLoadUsers()
      } else {
        alert(data.error || "인증에 실패했습니다.")
      }
    } catch (error) {
      console.error("인증 오류:", error)
      alert("인증 중 오류가 발생했습니다.")
    } finally {
      setProcessingId(null)
    }
  }

<<<<<<< HEAD
  const handleRejectInstagram = (user: User) => {
    setSelectedUser(user)
    setShowRejectDialog(true)
  }
=======
  // ✅ 인스타그램 인증 거절
  const handleInstagramReject = async (userId: string) => {
    if (!confirm("이 인플루언서의 인스타그램 인증을 거절하시겠습니까?")) return
>>>>>>> 63e1c5b91733f1cf2ee204e6f5c1f3682e024ef5

    setProcessingId(userId)
    try {
<<<<<<< HEAD
      const response = await fetch(`/api/admin/users/${selectedUser.id}/instagram-verification`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "idle",
          rejection_reason: rejectionReason,
        }),
=======
      const response = await fetch(`/api/admin/users/${userId}/instagram-verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
>>>>>>> 63e1c5b91733f1cf2ee204e6f5c1f3682e024ef5
      })

      const data = await response.json()

      if (data.success) {
        alert("인스타그램 인증이 거절되었습니다.")
<<<<<<< HEAD
        setShowRejectDialog(false)
        setRejectionReason("")
        setSelectedUser(null)
=======
>>>>>>> 63e1c5b91733f1cf2ee204e6f5c1f3682e024ef5
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

<<<<<<< HEAD
  const getInstagramBadge = (status: string | null) => {
    if (!status || status === "idle") {
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
          미인증
        </Badge>
      )
    }
    
=======
  // ✅ 인스타그램 정보 보기
  const showInstagramInfo = (user: User) => {
    setSelectedUser(user)
    setShowInstagramDialog(true)
  }

  const getInstagramStatusBadge = (status: string | null) => {
>>>>>>> 63e1c5b91733f1cf2ee204e6f5c1f3682e024ef5
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
<<<<<<< HEAD
            승인 대기
=======
            인증 대기
>>>>>>> 63e1c5b91733f1cf2ee204e6f5c1f3682e024ef5
          </Badge>
        )
      case "verified":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <CheckCircle className="w-3 h-3 mr-1" />
<<<<<<< HEAD
            인증 완료
=======
            인증됨
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            거절됨
>>>>>>> 63e1c5b91733f1cf2ee204e6f5c1f3682e024ef5
          </Badge>
        )
      default:
        return <Badge variant="outline">미인증</Badge>
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

  // ✅ 인스타그램 데이터 파싱
  const getInstagramData = (user: User) => {
    if (!user.instagram_data) return null
    try {
      return JSON.parse(user.instagram_data)
    } catch {
      return null
    }
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

<<<<<<< HEAD
  const pendingCount = users.filter((u) => u.instagram_verification_status === "pending").length
  const verifiedCount = users.filter((u) => u.instagram_verification_status === "verified").length
=======
  // 인스타그램 인증 대기 중인 사용자
  const instagramPendingUsers = users.filter(
    (u) => u.instagram_verification_status === "pending" && u.user_type === "INFLUENCER"
  )
>>>>>>> 63e1c5b91733f1cf2ee204e6f5c1f3682e024ef5

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
<<<<<<< HEAD
          <h1 className="text-3xl font-bold text-gray-900 mb-2">사용자 관리</h1>
          <p className="text-gray-600">인스타그램 인증 관리 및 사용자 조회</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">인증 대기</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}명</p>
                </div>
                <Clock className="w-10 h-10 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">인증 완료</p>
                  <p className="text-2xl font-bold text-green-600">{verifiedCount}명</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">전체 사용자</p>
                  <p className="text-2xl font-bold text-[#7b68ee]">{users.length}명</p>
                </div>
                <Users className="w-10 h-10 text-[#7b68ee]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 필터 & 검색 */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="이메일, 이름, 아이디로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

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
=======
          <h1 className="text-3xl font-bold text-gray-900 mb-2">관리자 대시보드</h1>
          <p className="text-gray-600">인스타그램 인증 및 회원 정보를 관리할 수 있습니다.</p>
        </div>

        {/* 탭 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="instagram">
              인스타그램 인증
              {instagramPendingUsers.length > 0 && (
                <Badge className="ml-2 bg-yellow-500">{instagramPendingUsers.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="members">회원 목록</TabsTrigger>
          </TabsList>

          {/* ✅ 인스타그램 인증 탭 */}
          <TabsContent value="instagram" className="space-y-6">
            {/* 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">인증 대기</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {users.filter((u) => u.instagram_verification_status === "pending").length}명
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
                      <p className="text-sm font-medium text-gray-600">인증 완료</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {users.filter((u) => u.instagram_verification_status === "verified").length}명
                      </p>
                    </div>
                    <CheckCircle className="w-10 h-10 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">거절됨</p>
                      <p className="text-2xl font-bold text-red-600">
                        {users.filter((u) => u.instagram_verification_status === "rejected").length}명
                      </p>
                    </div>
                    <XCircle className="w-10 h-10 text-red-500" />
                  </div>
                </CardContent>
              </Card>
>>>>>>> 63e1c5b91733f1cf2ee204e6f5c1f3682e024ef5
            </div>

<<<<<<< HEAD
        {/* 탭 & 사용자 목록 */}
        <Card>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="pending">
                  인증 대기 ({pendingCount})
                </TabsTrigger>
                <TabsTrigger value="verified">
                  인증 완료 ({verifiedCount})
                </TabsTrigger>
                <TabsTrigger value="all">
                  전체 ({users.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">표시할 사용자가 없습니다.</p>
=======
            {/* 필터 */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="인스타그램 계정으로 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={filterInstagramStatus} onValueChange={setFilterInstagramStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="인증 상태" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체</SelectItem>
                      <SelectItem value="pending">인증 대기</SelectItem>
                      <SelectItem value="verified">인증됨</SelectItem>
                      <SelectItem value="rejected">거절됨</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* 인스타그램 인증 테이블 */}
            <Card>
              <CardContent className="pt-6">
                {filteredUsers.filter(u => u.instagram_username).length === 0 ? (
                  <div className="text-center py-12">
                    <Instagram className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">인스타그램 인증 요청이 없습니다.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>이메일</TableHead>
                        <TableHead>이름</TableHead>
                        <TableHead>인스타그램</TableHead>
                        <TableHead>팔로워</TableHead>
                        <TableHead>요청일</TableHead>
                        <TableHead>상태</TableHead>
                        <TableHead className="text-right">작업</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers
                        .filter(u => u.instagram_username)
                        .map((user) => {
                          const instagramData = getInstagramData(user)
                          return (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.email}</TableCell>
                              <TableCell>{user.name || user.username || "-"}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Instagram className="w-4 h-4 text-pink-500" />
                                  <span className="text-sm">@{user.instagram_username}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {instagramData?.followersCount ? 
                                  instagramData.followersCount.toLocaleString() : '-'}
                              </TableCell>
                              <TableCell>
                                {user.created_at ? new Date(user.created_at).toLocaleDateString("ko-KR") : "-"}
                              </TableCell>
                              <TableCell>{getInstagramStatusBadge(user.instagram_verification_status)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => showInstagramInfo(user)}
                                  >
                                    상세보기
                                  </Button>
                                  {user.instagram_verification_status === "pending" && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                        onClick={() => handleInstagramApprove(user.id)}
                                        disabled={processingId === user.id}
                                      >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        인증
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                        onClick={() => handleInstagramReject(user.id)}
                                        disabled={processingId === user.id}
                                      >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        거절
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ✅ 회원 목록 탭 */}
          <TabsContent value="members" className="space-y-6">
            {/* 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">전체 회원</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {users.length}명
                      </p>
                    </div>
                    <Users className="w-10 h-10 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">인플루언서</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {users.filter((u) => u.user_type === "INFLUENCER").length}명
                      </p>
                    </div>
                    <Users className="w-10 h-10 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">광고주</p>
                      <p className="text-2xl font-bold text-green-600">
                        {users.filter((u) => u.user_type === "ADVERTISER").length}명
                      </p>
                    </div>
                    <Users className="w-10 h-10 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 필터 & 검색 */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="이메일, 이름, 아이디로 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

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

            {/* 회원 목록 테이블 */}
            <Card>
              <CardContent className="pt-6">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">표시할 회원이 없습니다.</p>
>>>>>>> 63e1c5b91733f1cf2ee204e6f5c1f3682e024ef5
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>이메일</TableHead>
                        <TableHead>이름</TableHead>
                        <TableHead>회원 유형</TableHead>
                        <TableHead>인스타그램</TableHead>
<<<<<<< HEAD
                        <TableHead>인증 상태</TableHead>
                        <TableHead>가입일</TableHead>
                        <TableHead className="text-right">작업</TableHead>
=======
                        <TableHead>가입일</TableHead>
>>>>>>> 63e1c5b91733f1cf2ee204e6f5c1f3682e024ef5
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
<<<<<<< HEAD
                              <span className="text-sm">@{user.instagram_username}</span>
=======
                              <div className="flex items-center gap-2">
                                <Instagram className="w-4 h-4 text-pink-500" />
                                <span className="text-sm">@{user.instagram_username}</span>
                                {user.instagram_verification_status === "verified" && (
                                  <CheckCircle className="w-4 h-4 text-blue-500" />
                                )}
                              </div>
>>>>>>> 63e1c5b91733f1cf2ee204e6f5c1f3682e024ef5
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
<<<<<<< HEAD
                          <TableCell>{getInstagramBadge(user.instagram_verification_status)}</TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString("ko-KR")}</TableCell>
                          <TableCell className="text-right">
                            {user.instagram_verification_status === "pending" && (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                  onClick={() => handleApproveInstagram(user.id)}
                                  disabled={processingId === user.id}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  승인
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                                  onClick={() => handleRejectInstagram(user)}
                                  disabled={processingId === user.id}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  거절
                                </Button>
                              </div>
                            )}
                          </TableCell>
=======
                          <TableCell>{new Date(user.created_at).toLocaleDateString("ko-KR")}</TableCell>
>>>>>>> 63e1c5b91733f1cf2ee204e6f5c1f3682e024ef5
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
<<<<<<< HEAD
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
=======
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
>>>>>>> 63e1c5b91733f1cf2ee204e6f5c1f3682e024ef5
      </div>

      {/* ✅ 인스타그램 상세 정보 다이얼로그 */}
      <Dialog open={showInstagramDialog} onOpenChange={setShowInstagramDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
<<<<<<< HEAD
            <DialogTitle>인스타그램 인증 거절</DialogTitle>
            <DialogDescription>
              @{selectedUser?.instagram_username} 님의 인증을 거절하시겠습니까?
            </DialogDescription>
=======
            <DialogTitle>인스타그램 계정 정보</DialogTitle>
>>>>>>> 63e1c5b91733f1cf2ee204e6f5c1f3682e024ef5
          </DialogHeader>
          {selectedUser && (() => {
            const instagramData = getInstagramData(selectedUser)
            return (
              <div className="space-y-4">
                {instagramData && (
                  <>
                    <div className="flex items-center gap-4">
                      {instagramData.profilePicture && (
                        <img 
                          src={instagramData.profilePicture} 
                          alt="Profile" 
                          className="w-20 h-20 rounded-full"
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-lg">{instagramData.name}</h3>
                        <p className="text-gray-600">@{instagramData.username}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-4 border-y">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{instagramData.followersCount?.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">팔로워</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{instagramData.followsCount?.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">팔로잉</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">{instagramData.mediaCount}</p>
                        <p className="text-sm text-gray-600">게시물</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">소개</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{instagramData.biography}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">참여율</p>
                      <p className="text-sm text-gray-600">{instagramData.engagementRate}%</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">인증 요청일</p>
                      <p className="text-sm text-gray-600">
                        {instagramData.verifiedAt ? new Date(instagramData.verifiedAt).toLocaleString("ko-KR") : "-"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )
          })()}
          <DialogFooter>
            <Button onClick={() => setShowInstagramDialog(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}







