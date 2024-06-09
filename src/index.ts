import "@logseq/libs"
import { AppUserConfigs } from "@logseq/libs/dist/LSPlugin.user"
import { parse } from 'csv-parse/lib/sync'
import { getDateForPage } from 'logseq-dateutils' //https://github.com/hkgnp/logseq-dateutils
import swal from 'sweetalert' //https://sweetalert.js.org/guides/
import { logseq as PL } from "../package.json"
import { create } from "./create"
import { deleteMode } from './deletePages'
import { csvFileReceive } from './fileReceive'
import { getIsDuplicate } from './lib'
import { existPage, userCancelInDialog } from './msg'
import { settingsTemplate } from './settings'
const pluginId = PL.id
export const createContentTitle = "ブクログのリスト"
export const container = document.createElement("div") as HTMLDivElement


export async function postData(formData, button) {
  try {
    button.disabled = true
    button.innerText = "Uploading..."
    button.classList.add("file-receive-button-disabled")

    let dialogMessage = ""
    let dialogIcon = ""
    if (logseq.settings?.deleteMode === "Add") {
      dialogMessage = "書籍ページを追加します(上書きはおこなわれません)"
      dialogIcon = "info"
    }else if (logseq.settings?.deleteMode === "Update") {
      dialogMessage = "書籍ページを修復します(更新)"
      dialogIcon = "info"
    } else
      if (logseq.settings?.listTitle) {
        dialogMessage = "書籍ページをいったん削除して、もう一度作成します"
        dialogIcon = "warning"
      } else {
        dialogMessage = "書籍ページを作成します"
        dialogIcon = "info"
      }

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

        if (answer) {//OK
          const msg = await logseq.UI.showMsg("読み込んでいます\n処理が終わるまでお待ちください", `info`)
          await loadCsvFile(formData)//CSVファイルの読み込み
          logseq.UI.closeMsg(msg)
          logseq.UI.showMsg("処理が終わりました", `success`, { timeout: 3000 })
        } else //Cancel
          //user cancel in dialog
          userCancelInDialog()
        logseq.updateSettings({ deleteMode: "OFF" })
      })
    //dialog end


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
  if (docApp && container) {
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
        || logseq.settings?.deleteMode === "Write"
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


const loadCsvFile = async (formData: any) => {
  const { preferredDateFormat } = await logseq.App.getUserConfigs() as { preferredDateFormat: AppUserConfigs["preferredDateFormat"] }//日付のユーザーフォーマット取得
  const file_reader = new FileReader()
  file_reader.readAsText(formData, "Shift-JIS")
  //CSVデータをオブジェクトにする
  //file load success
  file_reader.onload = async function (e) {
    //https://csv.js.org/
    const items = await parse((
      "none,item-code,isbn,category,valuation,status,review,tags,memo,start,end,title,author,publisher,year,type,page-number\n"//1行目を追加
      + file_reader.result
    ).replace(/""/g, ''), {
      columns: true,
      trim: true,
    })

    try {
      //forEach
      items.forEach(function (item, index) {

        //タグとカテゴリの指定
        if (logseq.settings?.limitTags !== "") {
          const duplicate = getIsDuplicate(item.tags.split(','), (logseq.settings?.limitTags as string).split(',')) || undefined
          if (duplicate) {
            //
          } else {
            delete items[index]
            return
          }
        }
        if (logseq.settings?.limitCategory !== "") {
          const duplicate = getIsDuplicate(item.category.split(','), (logseq.settings?.limitCategory as string).split(',')) || undefined
          if (duplicate) {
            //
          } else {
            delete items[index]
            return
          }
        }
        //end
        delete items[index].valuation
        delete items[index].none
        delete items[index].status
        if (item.memo === "")
          delete items[index].memo

        if (item.review === "")
          delete items[index].review

        if (item.year === "")
          delete items[index].year

        if (item.start === "")
          delete items[index].start

        if (item.end === "")
          delete items[index].end

        if (item.author === "")
          delete items[index].author

        if (item["page-number"] === "")
          delete items[index]["page-number"]

        if (item.title !== "") {
          items[index].title = item.title.replace(/\[/g, '「')
          items[index].title = item.title.replace(/\]/g, '」')
          items[index].title = item.title.replace(/\//g, '')
          items[index].title = item.title.replace(/-/g, '')
          items[index].title = item.title.replaceAll("/", '／')
        }
        if (item.start !== "") {
          //https://www.tohoho-web.com/js/date.htm
          items[index].start = getDateForPage(new Date(item.start), preferredDateFormat) //remove time
          if (item.start === "[[NaN/aN/aN]]")
            delete items[index].start
        }
        if (item.end !== "") {
          items[index].end = getDateForPage(new Date(item.end), preferredDateFormat) //remove time
          if (item.end === "[[NaN/aN/aN]]")
            delete items[index].end
          if (item.start !== ""
            && item.end === item.start)
            delete items[index].start
        }

      }) //forEach end
    } finally {
      //await console.log(items);
      await create(items, preferredDateFormat, createContentTitle)
    }
    logseq.updateSettings({ deleteMode: "OFF" })
  }
}

logseq.ready(model, main).catch(console.error)