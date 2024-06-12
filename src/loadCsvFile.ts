import { AppUserConfigs } from "@logseq/libs/dist/LSPlugin.user"
import { parse } from 'csv-parse/lib/sync'
import { getDateForPage } from "logseq-dateutils"
import { createContentTitle } from "."
import { create } from "./create"
import { getIsDuplicate } from "./lib"

const file_reader = new FileReader()

export const loadCsvFile = async (formData: any): Promise<void> => {

  const { preferredDateFormat } = await logseq.App.getUserConfigs() as { preferredDateFormat: AppUserConfigs["preferredDateFormat"] }  //日付のユーザーフォーマット取得
  file_reader.readAsText(formData, "Shift-JIS")
  //CSVデータをオブジェクトにする
  //file load success
  file_reader.onload = async function (): Promise<void> {
    //https://csv.js.org/
    const items = await parse((
      "none,item-code,isbn,category,valuation,status,review,tags,memo,start,end,title,author,publisher,year,type,page-number\n" //1行目を追加
      + file_reader.result
    ).replace(/""/g, ''), {
      columns: true,
      trim: true,
    })

    for (const [index, item] of items.entries()) {

      //タグとカテゴリの指定
      if (logseq.settings?.limitTags !== ""
        && !(getIsDuplicate(item.tags.split(','), (logseq.settings?.limitTags as string).split(',')) || undefined)) {
        delete items[index]
        return
      }
      if (logseq.settings?.limitCategory !== ""
        && !(getIsDuplicate(item.category.split(','), (logseq.settings?.limitCategory as string).split(',')) || undefined)) {
        delete items[index]
        return
      }

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
        items[index].title = item.title.replace(/-/g, '')
        items[index].title = item.title.replaceAll("/", ' ')
        items[index].title = item.title.replace(/\?/g, '？')//?を？に変換
      }

      if (item.start) {
        //https://www.tohoho-web.com/js/date.htm
        const date = new Date(item.start)
        //dateがNaNの場合は削除
        if (isNaN(date.getTime()))
          delete items[index].start
        else
          items[index].start = getDateForPage(date, "yyyy/MM")
      }

      if (item.end) {
        const date = new Date(item.end)
        if (isNaN(date.getTime()))
          delete items[index].end
        else {
          items[index].end = getDateForPage(date, "yyyy/MM")
          if (item.start !== ""
            && item.end === item.start)
            delete items[index].start
        }
      }
    }
    await create(items, preferredDateFormat, createContentTitle)
  }
}
