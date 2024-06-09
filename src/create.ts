import "@logseq/libs"
import { BlockEntity, PageEntity } from "@logseq/libs/dist/LSPlugin.user"
import { getDateForPage } from 'logseq-dateutils'
import swal from 'sweetalert'

export const create = async (itemsObj, preferredDateFormat, createContentTitle) => {
    // list up
    const PageTitleList: string[] = []
    const pullDeleteList: string[] = []
    const PageTagsList: string[] = []
    const PageCategoryList: string[] = []
    const PageYearList: string[] = []
    const PageAuthorList: string[] = []
    const PageTypeList: string[] = []
    const pullAuthorList: string[] = []
    const PageReviewList: string[] = []
    const PageMemoList: string[] = []

    // create promises
    await Promise.all(checkItem(itemsObj, PageTypeList, PageTitleList, pullDeleteList, PageTagsList, PageCategoryList, PageAuthorList, pullAuthorList, PageYearList, PageReviewList, PageMemoList))

    await makeContentPage(createContentTitle, preferredDateFormat, PageTitleList, PageTagsList, PageCategoryList, PageYearList, PageAuthorList, PageTypeList, PageReviewList, PageMemoList)

    // update settings
    logseq.updateSettings({ listTitle: pullDeleteList, listAuthor: pullAuthorList })

    // show success message and redirect to content page

    await swal({
        title: '書籍ページの作成が終わりました',
        text:
            'インデックス再構築をおこなってください\n\nそのあと左メニューにある [全ページ] から、書籍名ページを探してください',
        icon: 'success',
        content: {
            element: 'img',
            attributes: {
                src: `https://user-images.githubusercontent.com/111847207/210157837-e359b29b-05a0-44d0-9310-915f382012d7.gif`,
            },
        },
    }).then(() => {
        setTimeout(() =>
            logseq.App.pushState('page', { name: createContentTitle })
            , 50)
        logseq.hideMainUI()
    })
}

const deleteBlockAndInsert = async (
    PageEntity: { uuid: PageEntity["uuid"] },
    ItemContent: string,
    ItemReview: string | undefined,
    ItemMemo: string | undefined,
    title: string
) => {
    const blocks = await logseq.Editor.getPageBlocksTree(PageEntity.uuid) as { uuid: BlockEntity["uuid"] }[]
    
    for (const block of blocks)
        await logseq.Editor.deleteBlock(block.uuid)

    await insertBlocks(ItemContent, PageEntity.uuid, ItemReview, ItemMemo)
    console.log(`ページを更新しました: ${title}`)
}

const createBookPage = async (
    title: string, item: {},
    ItemContent: string,
    ItemReview: string | undefined,
    ItemMemo: string | undefined
) => {
    const newPageEntity = await logseq.Editor.createPage(title, item, {
        createFirstBlock: true,
        format: 'markdown',
        redirect: false,
    }) as { uuid: PageEntity["uuid"] } | null
    
    if (newPageEntity)
        await insertBlocks(ItemContent, newPageEntity.uuid, ItemReview, ItemMemo)
    console.log(`ページを作成しました: ${title}`)
}

const makeContentPage = async (
    createContentTitle: string,
    preferredDateFormat: string,
    PageTitleList: string[],
    PageTagsList: string[],
    PageCategoryList: string[],
    PageYearList: string[],
    PageAuthorList: string[],
    PageTypeList: string[],
    PageReviewList: string[],
    PageMemoList: string[]
) => {
    let contentPageUuid = ''
    const getContentPage = await logseq.Editor.getPage(createContentTitle) as { uuid: PageEntity["uuid"] } | null
    if (getContentPage) { //ページが存在する場合はブロックをすべて削除
        
        const blocks = await logseq.Editor.getPageBlocksTree(getContentPage.uuid) as { uuid: BlockEntity["uuid"] }[]
        for (const block of blocks)
            await logseq.Editor.deleteBlock(block.uuid)
        contentPageUuid = getContentPage.uuid

    } else { //ページが存在しない場合は作成

        const contentPage = await logseq.Editor.createPage(createContentTitle) as { uuid: PageEntity["uuid"] } | null
        if (!contentPage) {
            console.error('Failed to create content page')
            logseq.UI.showMsg('Failed to create content page', "error", { timeout: 5000 })
            return
        }
        contentPageUuid = contentPage.uuid
        
    }

    const contents = [
        `${getDateForPage(new Date(), preferredDateFormat)}リスト更新`,
        `タイトルリスト\n${PageTitleList.join('')}`,
        `タグ一覧\n${[...(new Set(PageTagsList))].join('')}`,
        `カテゴリー\n${[...(new Set(PageCategoryList))].join('')}`,
        `発行年\n${[...(new Set(PageYearList.sort()))].join('')}`,
        `著者\n${[...(new Set(PageAuthorList))].join('')}`,
        `種別\n${[...(new Set(PageTypeList))].join('')}`,
    ]
    if (PageReviewList.length)
        contents.push(`レビューあり\n${[...(new Set(PageReviewList))].join('')}`)

    if (PageMemoList.length)
        contents.push(`メモあり\n${[...(new Set(PageMemoList))].join('')}`)

    for (const blockContent of contents)
        logseq.Editor.appendBlockInPage(
            contentPageUuid,
            blockContent,
            { properties: { parent: '本,読書' } })
}

const checkItem = (
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
) =>
    itemsObj.map(async (item) => {
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
                if (await logseq.Editor.getPage(title) as { uuid: PageEntity["uuid"] } | null) {
                    // ページが存在する場合は、更新しない
                    logseq.UI.showMsg(`ページが存在します: ${title}`, 'error', { timeout: 5000 })
                    console.log(`ページが存在します: ${title}`)
                }
                else
                    // create page
                    await createBookPage(title, item, ItemContent, ItemReview, ItemMemo)
                break
            case "Update": // ページが存在する場合は、ブロックをすべて削除してから更新
                const PageEntity = await logseq.Editor.getPage(title) as { uuid: PageEntity["uuid"] } | null
                if (PageEntity)
                    await deleteBlockAndInsert(PageEntity, ItemContent, ItemReview, ItemMemo, title)

                else
                    await createBookPage(title, item, ItemContent, ItemReview, ItemMemo)
                break
        }
    })
const insertBlocks = async (
    ItemContent: string,
    uuid: PageEntity["uuid"],
    ItemReview: string | undefined,
    ItemMemo: string | undefined
) => {
    if (ItemContent)
        await logseq.Editor.insertBlock(uuid, ItemContent)

    if (ItemReview)
        await logseq.Editor.insertBlock(uuid, ItemReview)

    if (ItemMemo)
        await logseq.Editor.insertBlock(uuid, ItemMemo)
}

