/**
 * Conflict Resolution Strategy
 * Handles conflicts when data is modified simultaneously on web and mobile
 */

export interface ConflictData {
  id: string
  timestamp: number
  data: any
  source: 'web' | 'mobile'
}

export class ConflictResolver {
  /**
   * Resolve conflicts using Last-Write-Wins strategy
   */
  static lastWriteWins(conflicts: ConflictData[]): ConflictData {
    return conflicts.sort((a, b) => b.timestamp - a.timestamp)[0]
  }

  /**
   * Resolve conflicts using merge strategy
   */
  static merge(conflicts: ConflictData[]): any {
    const merged = { ...conflicts[0].data }
    
    for (let i = 1; i < conflicts.length; i++) {
      Object.assign(merged, conflicts[i].data)
    }
    
    return merged
  }

  /**
   * Resolve conflicts by asking user
   */
  static userChoice(conflicts: ConflictData[]): Promise<ConflictData> {
    return new Promise((resolve) => {
      // In a real implementation, this would show a UI dialog
      // For now, default to last-write-wins
      resolve(this.lastWriteWins(conflicts))
    })
  }
}

