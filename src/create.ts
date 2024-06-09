import "@logseq/libs"
import { BlockEntity, PageEntity } from "@logseq/libs/dist/LSPlugin.user"
import { getDateForPage } from 'logseq-dateutils'
import swal from 'sweetalert'
import { checkItem } from "./checkItem"

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

export const deleteBlockAndInsert = async (
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

export const createBookPage = async (
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