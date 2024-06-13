import { PageEntity } from "@logseq/libs/dist/LSPlugin.user"
import { createBookPage } from "./create"
import { getCoverFileFromIsbn } from "./lib"
import "@logseq/libs"
import { IAsyncStorage } from "@logseq/libs/dist/modules/LSPlugin.Storage"

export const checkItem = async (
    itemsObj: any,
    PageTypeList: string[],
    pullDeleteList: string[],
    PageTagsList: string[],
    PageCategoryList: string[],
    PageAuthorList: string[],
    pullAuthorList: string[],
    PageYearList: string[],
    PageReviewList: string[],
    PageMemoList: string[],
    isbnList: string[]
): Promise<void> => {
    const storage = logseq.Assets.makeSandboxStorage() as IAsyncStorage
    for (const item of itemsObj) {
        const {
            type,
            title,
            tags,
            category,
            author,
            isbn,
            'item-code': itemCode,
            'page-number': pageNumber,
            year,
            review,
            memo
        } = item as {
            type: string
            title: string
            tags: string
            category: string
            author: string
            isbn: string
            'item-code': string
            'page-number': string
            year: string
            review: string
            memo: string
        }
        const PageEntity = await logseq.Editor.getPage(title) as { uuid: PageEntity["uuid"] } | null
        if (PageEntity
            && logseq.settings?.deleteMode === "Add") {
            // ページが存在する場合は、更新しない
            logseq.UI.showMsg(`ページが存在します: ${title}`, 'error', { timeout: 5000 })
            console.log(`ページが存在します: ${title}`)
            continue
        }

        if (type) {
            item.title = `${type}/${title}`
            PageTypeList.push(`[[${type}]]\n`)
            delete item.type
        }

        pullDeleteList.push(title)

        if (tags) {
            const tagList = tags.split(',')
            tagList.forEach((v) => PageTagsList.push(`[[${v}]]\n`))
        }
        if (category) {
            PageCategoryList.push(`[[${category}]]\n`)
            item.category = `[[${category}]]`
        }

        if (author) {
            PageAuthorList.push(`${author}\n`)
            pullAuthorList.push(author)
        }


        //10桁もしくは13桁の数値
        if (isbn
            && isbn.match(/^\d{10}$|^\d{13}$/)) {
            // ItemContent = `https://cover.openbd.jp/${isbn}.jpg\n` // 画像取得できなくなった
            await new Promise((resolve) => setTimeout(resolve, 1200)) // 1200ms wait
            item.cover = await getCoverFileFromIsbn(isbn, title, storage)
            if (item.cover === "")
                delete item.cover
            isbnList.push(isbn)
            delete item.isbn
        }
        // link
        let ItemContent = ''
        if (itemCode) {
            ItemContent += `[amazon.co.jp](https://www.amazon.co.jp/dp/${itemCode}/tag=y0skyblue-22) | [booklog.jp](https://booklog.jp/item/1/${itemCode})`
            delete item['item-code']
        }
        if (pageNumber) {
            ItemContent += ` | ${pageNumber}ページ`
            delete item['page-number']
        }
        if (year) {
            PageYearList.push(year) // later sort
            item.sales = `[[${year}]]`
            delete item.year
        }
        let ItemReview: string | undefined
        if (review) {
            ItemReview = `(レビュー)\n#+BEGIN_QUOTE\n${review}\n#+END_QUOTE`
            PageReviewList.push(`[[${item.title}]]\n`)
            delete item.review
        }
        let ItemMemo: string | undefined
        if (memo) {
            ItemMemo = `(メモ)\n#+BEGIN_QUOTE\n${memo}\n#+END_QUOTE`
            PageMemoList.push(`[[${item.title}]]\n`)
            delete item.memo
        }

        console.log("データチェックOK")

        if ((logseq.settings?.deleteMode === "Update"
            || logseq.settings?.deleteMode === "OFF")
            && PageEntity) {
            await logseq.Editor.deletePage(PageEntity.uuid) // "Update" or "OFF" かつ ページが存在する場合
            console.log(`ページを一旦削除しました: (${PageEntity.uuid})`)
            await new Promise((resolve) => setTimeout(resolve, 100))//100ms wait
        }
        await createBookPage(item.title, item, ItemContent, ItemReview, ItemMemo) // "Add" もしくは ページが存在しない場合

        await new Promise((resolve) => setTimeout(resolve, 2000)) // 2000ms wait
    }

}