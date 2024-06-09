export function existPage() {
  logseq.UI.showMsg("すでに作成されています")
  logseq.showSettingsUI()
}
export function userCancelInDialog() {
  logseq.UI.showMsg("キャンセルしました", `warning`)
  logseq.showSettingsUI()
}
