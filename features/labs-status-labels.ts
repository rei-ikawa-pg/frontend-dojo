import type { LabStatus } from './labs'

export const LAB_STATUS_LABEL: Record<LabStatus, string> = {
  published: '公開中',
  'phase-2': 'Phase 2 予定',
  'phase-3': 'Phase 3 予定',
  formal: '正式版',
}
