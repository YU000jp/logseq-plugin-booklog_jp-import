import "@logseq/libs"
import { BlockEntity, PageEntity } from "@logseq/libs/dist/LSPlugin.user"
import { getDateForPage } from 'logseq-dateutils'
import swal from 'sweetalert'
import { checkItem } from "./checkItem"

export const create = async (itemsObj, preferredDateFormat, createContentTitle): Promise<void> => {
    // list up
    const pullDeleteList: string[] = []
    const PageTagsList: string[] = []
    const PageCategoryList: string[] = []
    const PageYearList: string[] = []
    const PageAuthorList: string[] = []
    const PageTypeList: string[] = []
    const pullAuthorList: string[] = []
    const PageReviewList: string[] = []
    const PageMemoList: string[] = []
    const isbnList: string[] = []
    const msg = await logseq.UI.showMsg("読み込んでいます\n処理が終わるまでお待ちください", `info`, { timeout: 1000 * 60 * 10 }) //10分
    // create promises
    await new Promise<void>(async (resolve) => {
        await checkItem(itemsObj, PageTypeList, pullDeleteList, PageTagsList, PageCategoryList, PageAuthorList, pullAuthorList, PageYearList, PageReviewList, PageMemoList, isbnList)
        await new Promise((resolve) => setTimeout(resolve, 2000)) // 2000ms wait
        await makeContentPage(createContentTitle, preferredDateFormat, PageTagsList, PageCategoryList, PageYearList, PageAuthorList, PageTypeList, PageReviewList, PageMemoList)
        //ISBN Listをコンソールに一覧表示
        console.log("ISBN List:")
        console.log(isbnList.map((isbn) => isbn + "\n").join(''))
        console.log("ISBN List: End")
        resolve()
    })
    logseq.UI.closeMsg(msg)
    await logseq.UI.showMsg("処理が終わりました", `success`, { timeout: 3000 })

    // update settings
    logseq.updateSettings({
        listTitle: pullDeleteList,
        listAuthor: pullAuthorList
    })

    // show success message and redirect to content page

    await swal({
        title: '書籍ページの作成が終わりました',
        text:
            'インデックス再構築をおこなってください\n\nそのあと左メニューにある [全ページ] から、書籍ページを探してください',
        icon: 'success',
        content: {
            element: 'img',
            attributes: {
                src: `https://user-images.githubusercontent.com/111847207/210157837-e359b29b-05a0-44d0-9310-915f382012d7.gif`,
            },
        },
    }).then(() => {
        setTimeout(() =>
            logseq.App.pushState(
                'page',
                { name: createContentTitle }
            )
            , 50)
        logseq.hideMainUI()
    })
}

export const createBookPage = async (
    title: string,
    item: any,
    ItemContent: string,
    ItemReview: string | undefined,
    ItemMemo: string | undefined
): Promise<void> => {
    const newPageEntity = await logseq.Editor.createPage(title, item, {
        createFirstBlock: true,
        format: 'markdown',
        redirect: false,
    }) as { uuid: PageEntity["uuid"] } | null
    if (newPageEntity)
        await insertBlocks(
            ItemContent,
            newPageEntity.uuid,
            ItemReview,
            ItemMemo
        )
    console.log(`ページを作成しました: ${title}`)
}

const makeContentPage = async (
    createContentTitle: string,
    preferredDateFormat: string,
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
    if (getContentPage) {
        //ページが存在する場合はブロックをすべて削除
        for (const block of (await logseq.Editor.getPageBlocksTree(getContentPage.uuid) as { uuid: BlockEntity["uuid"] }[]))
            await logseq.Editor.removeBlock(block.uuid)
        contentPageUuid = getContentPage.uuid
    } else {
        //ページが存在しない場合は作成
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
        `種別\n${[...(new Set(PageTypeList))].join('')}`,
        `タグ一覧\n${[...(new Set(PageTagsList))].join('')}`,
        `カテゴリー\n${[...(new Set(PageCategoryList))].join('')}`,
        `発行年\n${[...(new Set(PageYearList.map(Number).sort((a, b) => a - b)))].map((v) => ` [[${v}]] `).join('')}`,
        `著者\n${[...(new Set(PageAuthorList))].join('')}`,
    ]
    if (PageReviewList.length)
        contents.push(`レビューあり\n${[...(new Set(PageReviewList))].join('')}`)

    if (PageMemoList.length)
        contents.push(`メモあり\n${[...(new Set(PageMemoList))].join('')}`)

    for (const blockContent of contents)
        logseq.Editor.appendBlockInPage(contentPageUuid, blockContent)
    console.log(`コンテンツページを作成しました: ${createContentTitle}`)
}

const insertBlocks = async (
    ItemContent: string,
    uuid: PageEntity["uuid"],
    ItemReview: string | undefined,
    ItemMemo: string | undefined
): Promise<void> => {
    const contentBlock = await logseq.Editor.appendBlockInPage(uuid, ItemContent) as { uuid: BlockEntity["uuid"] } | null
    if (contentBlock) {
        if (ItemReview !== undefined)
            await logseq.Editor.insertBlock(contentBlock.uuid, ItemReview)
        if (ItemMemo !== undefined)
            await logseq.Editor.insertBlock(contentBlock.uuid, ItemMemo)
        console.log(`ブロックを追加しました: ${uuid}`)
    }
}