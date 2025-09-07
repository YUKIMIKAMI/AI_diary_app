// 一時的なJSON保存（開発用）
// TODO: 本番環境ではPrismaのデータベースを使用

import fs from 'fs/promises'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const DIARY_FILE = path.join(DATA_DIR, 'diaries.json')
const USER_FILE = path.join(DATA_DIR, 'users.json')

// データディレクトリを作成
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (error) {
    // ディレクトリが既に存在する場合は無視
  }
}

// 日記データの型
export interface DiaryEntry {
  id: string
  userId: string
  content: string
  mood?: string | null
  tags: string[]
  entryDate: string
  createdAt: string
  updatedAt: string
}

// ユーザーデータの型
export interface User {
  id: string
  email: string
  username: string
  createdAt: string
}

// 日記を保存
export async function saveDiary(diary: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<DiaryEntry> {
  await ensureDataDir()
  
  const newDiary: DiaryEntry = {
    ...diary,
    id: `diary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  let diaries: DiaryEntry[] = []
  
  try {
    const data = await fs.readFile(DIARY_FILE, 'utf-8')
    diaries = JSON.parse(data)
  } catch (error) {
    // ファイルが存在しない場合は空の配列から開始
  }
  
  diaries.push(newDiary)
  await fs.writeFile(DIARY_FILE, JSON.stringify(diaries, null, 2))
  
  return newDiary
}

// 日記を取得
export async function getDiaries(userId: string): Promise<DiaryEntry[]> {
  await ensureDataDir()
  
  try {
    const data = await fs.readFile(DIARY_FILE, 'utf-8')
    const diaries: DiaryEntry[] = JSON.parse(data)
    return diaries.filter(d => d.userId === userId).sort((a, b) => 
      new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime()
    )
  } catch (error) {
    return []
  }
}

// ユーザーを保存または取得
export async function upsertUser(user: Omit<User, 'createdAt'>): Promise<User> {
  await ensureDataDir()
  
  let users: User[] = []
  
  try {
    const data = await fs.readFile(USER_FILE, 'utf-8')
    users = JSON.parse(data)
  } catch (error) {
    // ファイルが存在しない場合は空の配列から開始
  }
  
  const existingUser = users.find(u => u.email === user.email)
  
  if (existingUser) {
    return existingUser
  }
  
  const newUser: User = {
    ...user,
    createdAt: new Date().toISOString(),
  }
  
  users.push(newUser)
  await fs.writeFile(USER_FILE, JSON.stringify(users, null, 2))
  
  return newUser
}