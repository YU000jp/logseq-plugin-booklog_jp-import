import swal from "sweetalert"
import { createContentTitle } from "."
import { userCancelInDialog } from "./msg"

export const deletePages = async (): Promise<void> => {
  
  for (const value of (logseq.settings?.listTitle as string[]))
    await logseq.Editor.deletePage(value)

  for (const value of (logseq.settings?.listAuthor as string[]))
    await logseq.Editor.deletePage(value)

  await logseq.Editor.deletePage(createContentTitle)
  logseq.updateSettings({ listTitle: "", listAuthor: "", })
  
}

export const deleteMode = async () => {
  if (logseq.settings?.listTitle === "") //タイトルリストが見つからない
    logseq.showSettingsUI()
  else {
    //dialog
    logseq.showMainUI()
    await swal({
      title: "実行しますか?",
      text: "書籍ページをすべて削除します\n(タイトル、出版社、著者の各ページが対象)",
      icon: "warning",
      buttons: {
        cancel: true,
        confirm: true,
      },
      dangerMode: true,
    })
      .then(async (answer) => {
        if (answer) { //OK
          const msg = await logseq.UI.showMsg("読み込んでいます\n処理が終わるまでお待ちください", `info`)
          await deletePages()
          logseq.UI.closeMsg(msg)
          logseq.UI.showMsg("削除されました。\nre-indexをおこなってください。", "info", { timeout: 5000 })
        } else
          userCancelInDialog()//user cancel in dialog
      })
    logseq.updateSettings({ deleteMode: "OFF" })
    logseq.hideMainUI()
  }
}