import "@logseq/libs";
import { getDateForPage } from 'logseq-dateutils';
import swal from 'sweetalert';

export const create = async (itemsObj, preferredDateFormat, createContentTitle) => {
    // list up
    const PageTitleList = [];
    const pullDeleteList = [];
    const PageTagsList = [];
    const PageCategoryList = [];
    const PageYearList = [];
    const PageAuthorList = [];
    const PageTypeList = [];
    const pullAuthorList = [];
    const PageReviewList = [];
    const PageMemoList = [];

    // create promises
    const promises = itemsObj.map(async (item) => {
        const { type, title, tags, category, author, isbn, 'item-code': itemCode, 'page-number': pageNumber, year, review, memo } = item;
        if (type) {
            item.title = `${type}/${title}`;
            PageTypeList.push(`[[${type}]]\n`);
            delete item.type;
        }

        PageTitleList.push(`[[${title}]]\n`);
        pullDeleteList.push(title);

        if (tags) {
            const tagList = tags.split(',');
            tagList.forEach((v) => {
                PageTagsList.push(`[[${v}]]\n`);
            });
        }
        if (category) {
            PageCategoryList.push(`[[${category}]]\n`);
            item.category = `[[${category}]]`;
        }

        if (author) {
            PageAuthorList.push(`${author}\n`);
            pullAuthorList.push(author);
        }

        // book-cover image & link
        let ItemContent = '';
        if (isbn !== undefined) {
            ItemContent = `https://cover.openbd.jp/${isbn}.jpg\n`;
            delete item.isbn;
        }
        if (itemCode) {
            ItemContent += `[amazon.co.jp](https://www.amazon.co.jp/dp/${itemCode}/tag=y0skyblue-22) | [booklog.jp](https://booklog.jp/item/1/${itemCode})`;
            delete item['item-code'];
        }
        if (pageNumber) {
            ItemContent += ` | ${pageNumber}ページ`;
            delete item['page-number'];
        }
        if (year) {
            PageYearList.push(year); // later sort
            ItemContent += ` | [[${year}]]年発行`;
            delete item.year;
        }
        let ItemReview;
        if (review) {
            ItemReview = `(レビュー)\n#+BEGIN_QUOTE\n${review}\n#+END_QUOTE`;
            PageReviewList.push(`[[${title}]]\n`);
            delete item.review;
        }
        let ItemMemo;
        if (memo) {
            ItemMemo = `(メモ)\n#+BEGIN_QUOTE\n${memo}\n#+END_QUOTE`;
            PageMemoList.push(`[[${title}]]\n`);
            delete item.memo;
        }

        if (logseq.settings?.deleteMode === 'Add') {
            const page = await logseq.Editor.getPage(title).catch(() => null);
            if (!page) {
                // create page
                const NewPage = await logseq.Editor.createPage(title, item, {
                    createFirstBlock: true,
                    format: 'markdown',
                    redirect: false,
                    parent: createContentTitle,
                });
                if (NewPage) {
                    const { uuid } = NewPage;
                    if (ItemContent) {
                        await logseq.Editor.insertBlock(uuid, ItemContent);
                    }
                    if (ItemReview) {
                        await logseq.Editor.insertBlock(uuid, ItemReview);
                    }
                    if (ItemMemo) {
                        await logseq.Editor.insertBlock(uuid, ItemMemo);
                    }
                }
            }
        }
    });

    await Promise.all(promises);

    // create content page
    await logseq.Editor.deletePage(createContentTitle);
    const contentPage = await logseq.Editor.createPage(createContentTitle);
    const { uuid: contentUuid } = contentPage;
    const blocks = [
        `${getDateForPage(new Date(), preferredDateFormat)}リスト更新`,
        `タイトルリスト\n${PageTitleList.join('')}`,
        `タグ一覧\n${[...(new Set(PageTagsList))].join('')}`,
        `カテゴリー\n${[...(new Set(PageCategoryList))].join('')}`,
        `発行年\n${[...(new Set(PageYearList.sort((a, b) => a - b)))].map((v) => ` [[${v}]] `).join('')}`,
        `著者\n${[...(new Set(PageAuthorList))].join('')}`,
        `種別\n${[...(new Set(PageTypeList))].join('')}`,
    ];
    if (PageReviewList.length) {
        blocks.push(`レビューあり\n${[...(new Set(PageReviewList))].join('')}`);
    }
    if (PageMemoList.length) {
        blocks.push(`メモあり\n${[...(new Set(PageMemoList))].join('')}`);
    }
    blocks.forEach((block) => logseq.Editor.appendBlockInPage(contentUuid, block, { parent: '本,読書' }));

    // update settings
    logseq.updateSettings({ listTitle: pullDeleteList, listAuthor: pullAuthorList });

    // show success message and redirect to content page
    setTimeout(() => {
        swal({
            title: '書籍ページの作成が終わりました',
            text:
                'インデックス再構築をおこなってください\n\nそのあと左メニューにある [全ページ] から、書籍のタイトルページを探してください',
            icon: 'success',
            content: {
                element: 'img',
                attributes: {
                    src: `https://user-images.githubusercontent.com/111847207/210157837-e359b29b-05a0-44d0-9310-915f382012d7.gif`,
                },
            },
        }).then(() => {
            setTimeout(() => {
                logseq.App.pushState('page', { name: createContentTitle });
            }, 50);
            logseq.hideMainUI();
        });
    }, 100);
};
