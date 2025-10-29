import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const chatId = formData.get("chatId") as string

    if (!file || !chatId) {
      return NextResponse.json(
        { error: "File and chatId are required" },
        { status: 400 }
      )
    }

    // 파일 크기 제한 (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      )
    }

    // 허용된 파일 타입 체크
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed" },
        { status: 400 }
      )
    }

    // 파일을 Buffer로 변환
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 업로드 디렉토리 생성 (없으면)
    const uploadDir = join(process.cwd(), "public", "uploads", "chat", chatId)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // 고유한 파일명 생성
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, "_")
    const fileName = `${timestamp}_${originalName}`
    const filePath = join(uploadDir, fileName)

    // 파일 저장
    await writeFile(filePath, buffer)

    // 파일 URL 생성
    const fileUrl = `/uploads/chat/${chatId}/${fileName}`

    // 실제 환경에서는:
    // 1. 클라우드 스토리지 (S3, Google Cloud Storage 등)에 업로드
    // 2. 바이러스 스캔
    // 3. 이미지인 경우 썸네일 생성
    // 4. 데이터베이스에 파일 정보 저장

    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    })
  } catch (error) {
    console.error("[API] Error uploading file:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}

// 파일 삭제 API
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileUrl = searchParams.get("fileUrl")

    if (!fileUrl) {
      return NextResponse.json(
        { error: "fileUrl is required" },
        { status: 400 }
      )
    }

    // 실제 환경에서는:
    // 1. 권한 확인
    // 2. 클라우드 스토리지에서 파일 삭제
    // 3. 데이터베이스에서 파일 정보 삭제

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    })
  } catch (error) {
    console.error("[API] Error deleting file:", error)
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    )
  }
}
