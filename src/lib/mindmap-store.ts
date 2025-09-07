// マインドマップのグローバル状態管理
class MindmapStore {
  private answerHandlers: Map<string, (answer: string) => void> = new Map()
  
  setAnswerHandler(nodeId: string, handler: (answer: string) => void) {
    this.answerHandlers.set(nodeId, handler)
  }
  
  getAnswerHandler(nodeId: string) {
    return this.answerHandlers.get(nodeId)
  }
  
  clearHandlers() {
    this.answerHandlers.clear()
  }
}

export const mindmapStore = new MindmapStore()