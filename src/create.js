import { getDateForPage } from 'logseq-dateutils';
import swal from 'sweetalert';


export const create = async (itemsObj, UserSettings, preferredDateFormat, createContentTitle) => {

    try {
        //list up
        const setTitleList = UserSettings.listTitle;
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
        //foreach
        await itemsObj.forEach(async function (item, index) {

            if (item.type) {
                item.title = item.type + "/" + item.title;
                PageTypeList.push("[[" + item.type + "]]\n");
                delete item.type;
            }

            PageTitleList.push("[[" + item.title + "]]\n");
            pullDeleteList.push(item.title);

            if (item.tags) {
                const tagList = item.tags.split(',');
                tagList.forEach(function (v) {
                    PageTagsList.push("[[" + v + "]]\n");
                });
            }
            if (item.category) {
                PageCategoryList.push("[[" + item.category + "]]\n");
                item.category = "[[" + item.category + "]]";
            }

            if (item.author) {
                PageAuthorList.push("[[" + item.author + "]]\n");
                pullAuthorList.push(item.author);
                item.author = "[[" + item.author + "]]";
            }

            //book-cover image & link
            let ItemContent;
            if (item["item-code"]) {
                ItemContent = "http://images-jp.amazon.com/images/P/" + item['item-code'] + ".09.MZZZZZZZ.jpg\n[amazon.co.jp](https://www.amazon.co.jp/dp/" + item['item-code'] + "/tag=y0skyblue-22) | [booklog.jp](https://booklog.jp/item/1/" + item['item-code'] + ")";
                delete item["item-code"];
            }
            if (item["page-number"]) {
                ItemContent = ItemContent + " | " + item["page-number"] + "ページ";
                delete item["page-number"];
            }
            if (item.year) {
                PageYearList.push(item.year);//later sort
                ItemContent = ItemContent + " | [[" + item.year + "]]年発行";
                delete item.year;
            }
            let ItemReview;
            if (item.review) {
                ItemReview = "(レビュー)\n#+BEGIN_QUOTE\n" + item.review + "\n#+END_QUOTE";
                PageReviewList.push("[[" + item.title + "]]\n");
                delete item.review;
            }
            let ItemMemo;
            if (item.memo) {
                ItemMemo = "(メモ)\n#+BEGIN_QUOTE\n" + item.memo + "\n#+END_QUOTE";
                PageMemoList.push("[[" + item.title + "]]\n");
                delete item.memo;
            }


            if (UserSettings.deleteMode === "Add") {
                await logseq.get.Editor.getPage(item.title).catch((getPage) => {
                    if (getPage) {
                        //
                    } else {
                        //create page
                        logseq.Editor.createPage(item.title, item, {
                            createFirstBlock: true,
                            format: "markdown",
                            redirect: false,
                            parent: createContentTitle,
                        }).then((NewPage) => {
                            if (NewPage) {
                                const uuid = NewPage.uuid;
                                if (ItemContent) {
                                    logseq.Editor.insertBlock(uuid, ItemContent);
                                }
                                if (ItemReview) {
                                    logseq.Editor.insertBlock(uuid, ItemReview);
                                }
                                if (ItemMemo) {
                                    logseq.Editor.insertBlock(uuid, ItemMemo);
                                }
                            }
                        });
                    }
                });
            } else {
                if (setTitleList.includes(item.title)) {
                    //すでにタイトルページが存在する場合
                    await logseq.Editor.deletePage(item.title);
                }
                //新規作成
                //create page
                await logseq.Editor.createPage(item.title, item, {
                    createFirstBlock: true,
                    format: "markdown",
                    redirect: false,
                    parent: createContentTitle,
                }).then((NewPage) => {
                    if (NewPage) {
                        const uuid = NewPage.uuid;
                        if (ItemContent) {
                            logseq.Editor.insertBlock(uuid, ItemContent);
                        }
                        if (ItemReview) {
                            logseq.Editor.insertBlock(uuid, ItemReview);
                        }
                        if (ItemMemo) {
                            logseq.Editor.insertBlock(uuid, ItemMemo);
                        }
                    }
                });
            }

        });//foreach done


        //create content page
        await logseq.Editor.deletePage(createContentTitle);
        await logseq.Editor.createPage(createContentTitle).then((e) => {

            logseq.Editor.appendBlockInPage(e.uuid, (getDateForPage(new Date(), preferredDateFormat)) + "リスト更新", { parent: "本,読書" }).then((blockInPage) => {
                const uuid = blockInPage.uuid;
                logseq.Editor.insertBlock(uuid, "タイトルリスト\n" + PageTitleList);
                logseq.Editor.insertBlock(uuid, "タグ一覧\n" + [...(new Set(PageTagsList))]);
                logseq.Editor.insertBlock(uuid, "カテゴリー\n" + [...(new Set(PageCategoryList))]);
                //sort year
                PageYearList.sort(function (first, second) {
                    return first - second;
                });
                PageYearList.forEach((value, index) => {
                    PageYearList[index] = " [[" + value + "]] ";
                });
                logseq.Editor.insertBlock(uuid, "発行年\n" + [...(new Set(PageYearList))]);
                logseq.Editor.insertBlock(uuid, "著者\n" + [...(new Set(PageAuthorList))]);
                logseq.Editor.insertBlock(uuid, "種別\n" + [...(new Set(PageTypeList))]);
                if (PageReviewList) {
                    logseq.Editor.insertBlock(uuid, "レビューあり\n" + [...(new Set(PageReviewList))]);
                }
                if (PageMemoList) {
                    logseq.Editor.insertBlock(uuid, "メモあり\n" + [...(new Set(PageMemoList))]);
                }
            });
        });

        logseq.updateSettings({ listTitle: pullDeleteList, listAuthor: pullAuthorList });

    } finally {
        logseq.showMainUI();
        setTimeout(function () {
            swal({
                title: "書籍ページの作成が終わりました",
                text: 'インデックス再構築をおこなってください\n\nそのあと左メニューにある [全ページ] から、書籍のタイトルページを探してください',
                icon: "success",
                content: {
                    element: 'img',
                    attributes: {
                        src: `https://user-images.githubusercontent.com/111847207/210157837-e359b29b-05a0-44d0-9310-915f382012d7.gif`,
                    },
                }
            }).then(() => {
                setTimeout(function () {
                    logseq.App.pushState('page', { name: createContentTitle });
                }, 50);
                logseq.hideMainUI();
            });
        }, 100);
    }

};