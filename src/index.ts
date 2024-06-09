import "@logseq/libs"
import swal from 'sweetalert' //https://sweetalert.js.org/guides/
import { logseq as PL } from "../package.json"
import { deleteMode } from './deletePages'
import { csvFileReceive } from './fileReceive'
import { existPage, userCancelInDialog } from './msg'
import { settingsTemplate } from './settings'
import { loadCsvFile } from "./loadCsvFile"
const pluginId = PL.id
export const createContentTitle = "ブクログのリスト"
export const container = document.createElement("div") as HTMLDivElement

export const postData = async (formData, button) => {
  try {
    button.disabled = true
    button.innerText = "Uploading..."
    button.classList.add("file-receive-button-disabled")

    let dialogMessage = ""
    let dialogIcon = "info"
    if (logseq.settings?.deleteMode === "Add")
      dialogMessage = "書籍ページを追加します(上書きはおこなわれません)"
    else
      if (logseq.settings?.deleteMode === "Update")
        dialogMessage = "書籍ページを修復します(更新)"
      else
        if (logseq.settings?.listTitle) {
          dialogMessage = "書籍ページをいったん削除して、もう一度作成します"
          dialogIcon = "warning"
        } else
          dialogMessage = "書籍ページを作成します"

    //dialog
    await logseq.showMainUI()
    await swal({
      title: "実行しますか?",
      text: dialogMessage,
      icon: dialogIcon,
      buttons: {
        cancel: true,
        confirm: true,
      },
    })
      .then(async (answer) => {
        if (answer) //OK
          await loadCsvFile(formData) //load csv file
        else //Cancel
          userCancelInDialog()//user cancel in dialog
      })
    //dialog end
    logseq.updateSettings({ deleteMode: "OFF" })

  } catch (err) {
    console.log(err)
  } finally {
    (<HTMLInputElement>document.querySelector("#file-receive-input")).value = ""
    button.disabled = false
    button.innerText = "Upload"
    button.classList.remove("file-receive-button-disabled")
    logseq.Editor.exitEditingMode()
    logseq.hideMainUI()
  }
}

/* main */
const main = () => {
  logseq.useSettingsSchema(settingsTemplate())

  if (!logseq.settings?.listTitle) {
    logseq.showMainUI()
    swal({
      title: "📚 プラグインが読み込まれました",
      text: "設定をおこないます",
      icon: "info",
      buttons: {
        cancel: false,
        confirm: true,
      },
      closeOnClickOutside: false,
    }).then(() => {
      swal({
        title: "タグ指定 (無記入でOKです)",
        text: `コンマ「,」で区切って複数選択。ブクログで登録したタグに一致したものだけが作成されます`,
        content: {
          element: "input",
          attributes: {
            value: logseq.settings?.limitTags,
          },
        },
      }).then((tag) => {
        if (tag)
          logseq.updateSettings({ limitTags: tag })

        swal({
          title: "カテゴリ指定 (無記入でOKです)",
          text: `コンマ「,」で区切って複数選択。ブクログで登録したタグに一致したものだけが作成されます`,
          content: {
            element: "input",
            attributes: {
              value: logseq.settings?.limitCategory,
            },
          },
        }).then((category) => {
          if (category)
            logseq.updateSettings({ limitCategory: category })

          swal({
            title: "設定が終わりました",
            text: "ツールバーの📚ボタンを押してください",
            icon: "info",
            buttons: {
              cancel: false,
              confirm: true,
            },
          }).then(() => {
            logseq.hideMainUI()
            logseq.updateSettings({ deleteMode: "" })
          })
        })

      })

    })
  } else
    logseq.updateSettings({ deleteMode: "OFF" })

  /* toolbar open_booklog_jp */
  logseq.App.registerUIItem('toolbar', {
    key: pluginId,
    template: `<div><a class="button icon" data-on-click="openBooklogJp" style="font-size: 19px">📚</a></div>`,
  })


  const docApp = document.getElementById("app") as HTMLDivElement | null
  if (docApp
    && container) {
    docApp.appendChild(container)
    container.classList.add("file-receive-wrapper")
  }

} /* end_main */


const model = {

  //click toolbar
  openBooklogJp() {
    if (logseq.settings?.deleteMode === "Delete") //delete mode
      deleteMode()
    else
      if (logseq.settings?.deleteMode === "Add"
        || logseq.settings?.deleteMode === "Update"
        || logseq.settings?.listTitle === "") {

        logseq.UI.showMsg("サイトが開きます\n\nCSVファイルのダウンロードをおこなってください", `info`, { timeout: 4000 }).then(() => {
          setTimeout(function () {
            logseq.App.openExternalLink('https://booklog.jp/export')
          }, 4000)

          //CSV file receive
          csvFileReceive()
        })
      } else {
        logseq.updateSettings({ deleteMode: "OFF" })
        logseq.App.pushState('page', { name: createContentTitle })
        existPage()
      }

  }
}

logseq.ready(model, main).catch(console.error)