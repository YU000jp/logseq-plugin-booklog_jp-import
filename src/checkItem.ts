import { PageEntity } from "@logseq/libs/dist/LSPlugin.user"
import { createBookPage, deleteBlockAndInsert } from "./create"

export const checkItem = (
    itemsObj: any,
    PageTypeList: string[],
    PageTitleList: string[],
    pullDeleteList: string[],
    PageTagsList: string[],
    PageCategoryList: string[],
    PageAuthorList: string[],
    pullAuthorList: string[],
    PageYearList: string[],
    PageReviewList: string[],
    PageMemoList: string[]
) => itemsObj.map(async (item) => {
    const { type, title, tags, category, author, isbn, 'item-code': itemCode, 'page-number': pageNumber, year, review, memo } = item as {
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
    if (type) {
        item.title = `${type}/${title}`
        PageTypeList.push(`[[${type}]]\n`)
        delete item.type
    }

    PageTitleList.push(`[[${title}]]\n`)
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

    // book-cover image & link
    let ItemContent = ''
    if (isbn !== undefined) {
        // ItemContent = `https://cover.openbd.jp/${isbn}.jpg\n` // 画像取得できなくなった
        delete item.isbn
    }
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
        ItemContent += ` | [[${year}]]年発行`
        delete item.year
    }
    let ItemReview: string | undefined
    if (review) {
        ItemReview = `(レビュー)\n#+BEGIN_QUOTE\n${review}\n#+END_QUOTE`
        PageReviewList.push(`[[${title}]]\n`)
        delete item.review
    }
    let ItemMemo: string | undefined
    if (memo) {
        ItemMemo = `(メモ)\n#+BEGIN_QUOTE\n${memo}\n#+END_QUOTE`
        PageMemoList.push(`[[${title}]]\n`)
        delete item.memo
    }


    switch (logseq.settings?.deleteMode) {
        case "Add":
            if (await logseq.Editor.getPage(title) as { uuid: PageEntity["uuid"]}  | null) {
                // ページが存在する場合は、更新しない
                logseq.UI.showMsg(`ページが存在します: ${title}`, 'error', { timeout: 5000 })
                console.log(`ページが存在します: ${title}`)
            }

            else
                // create page
                await createBookPage(title, item, ItemContent, ItemReview, ItemMemo)
            break
        case "Update": // ページが存在する場合は、ブロックをすべて削除してから更新
            const PageEntity = await logseq.Editor.getPage(title) as { uuid: PageEntity["uuid"]}  | null
            if (PageEntity)
                await deleteBlockAndInsert(PageEntity, ItemContent, ItemReview, ItemMemo, title)


            else
                await createBookPage(title, item, ItemContent, ItemReview, ItemMemo)
            break
    }
})
