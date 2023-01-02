import "@logseq/libs";
import { logseq as PL } from "../package.json";
const pluginId = PL.id;

import { getDateForPage } from 'logseq-dateutils';
import swal from 'sweetalert';


function getIsDuplicate(arr1, arr2) {
  return [...arr1, ...arr2].filter(item => arr1.includes(item) && arr2.includes(item)).length > 0
}

/* main */
const main = () => {
  console.info(`#${pluginId}: MAIN`); /* -plugin-id */

  /* https://logseq.github.io/plugins/types/SettingSchemaDesc.html */
  const settingsTemplate = [
    {
      key: "jsonUrl",
      type: "string",
      default: ``,
      title: "ファイルkeyを貼り付けてください",
      description: "更新をおこなう場合は、空欄にしてツールバーの📚を押してください。2つのサイトが開きます。そこにもう一度アップロードし、新しいファイルkeyを取得してください",
    },
    {
      key: "deleteMode",
      type: "enum",
      default: "Write",
      enumChoices: ["OFF", "Write", "Delete"],
      enumPicker: "radio",
      title: "修復・削除モード",
      description: "[Delete]を選択して📚を押すと書籍の関連ページをすべて削除します。(ジャーナルページに書いた内容は消えません) [Write]ではタイトルページをいったん削除して、再び作成します",
    },
    {
      key: "listTitle",
      type: "object",
      inputAs: "hidden",
      default: "",
      title: " ",
      description: "`Edit setting.json`で作成された書籍ページの一覧をファイルで確認できます。※削除モード用のリストです。",
    },
    {
      key: "listPublisher",
      type: "object",
      inputAs: "hidden",
      default: null,
      title: null,
      description: null,
    },
    {
      key: "listAuthor",
      type: "object",
      inputAs: "hidden",
      default: null,
      title: null,
      description: null,
    },
  ];
  /*JavascriptではなくPHPで処理することにした
  , {
              key: "limitTags",
              type: "string",
              default: ``,
              title: "タグ (デフォルトは無記入)",
              description: `コンマ「,」で区切ってタグを入力する。一致したものだけ書籍ページが作成されます。(すでに作成済みの場合は、この設定は無効です)`,
          }
  ,{
      key: "limitCategory",
      type: "string",
      default: ``,
      title: "カテゴリ (デフォルトは無記入)",
      description: `コンマ「,」で区切ってカテゴリを入力する。一致したものだけ書籍ページが作成されます。(すでに作成済みの場合は、この設定は無効です)`,
  }
  */
  logseq.useSettingsSchema(settingsTemplate);

  if (logseq.settings.listTitle === "") {
    logseq.showMainUI();
    swal({
      title: "ブクログ用プラグインが読み込まれました",
      text: "ツールバーの📚ボタンを押してください",
      icon: "info",
    }).then(() => {
      logseq.hideMainUI();
    });
  }

  /* toolbarItem */
  logseq.App.registerUIItem("toolbar", {
    key: pluginId,
    template: `<div data-on-click="open_booklog_jp" style="font-size:20px">📚</div>`,
  }); /* For open_booklog_jp */



  console.info(`#${pluginId}: loaded`);
}; /* end_main */



/* dashboard */
const model = {

  //click toolbar
  open_booklog_jp() {
    console.info(`#${pluginId}: open_booklog_jp`);

    const createContentTitle = "ブクログのリスト";
    const settingJsonUrl = logseq.settings.jsonUrl;

    if (logseq.settings.deleteMode === "Delete") {
      /*
      delete mode
      */
      if (logseq.settings.listTitle === "") {

        //delete mode && listTitle ""
        /* logseq.UI.showMsg("削除が実行できませんでした。\n\n", `error`, {
          timeout: 6000,
        }); */
        logseq.showSettingsUI();

      } else {

        //dialog
        logseq.showMainUI();
        swal({
          title: "実行しますか?",
          text: "書籍ページをすべて削除します\n(タイトル、出版社、著者の各ページが対象)",
          icon: "warning",
          buttons: true,
          dangerMode: true,
        })
          .then((answer) => {
            if (answer) {//OK
              swal("実行中です", "処理が終わるまでお待ちください");
              try {
                //delete page by title
                const deleteObjTitle = logseq.settings.listTitle;
                deleteObjTitle.forEach(function (value) {
                  logseq.Editor.deletePage(value);
                });
                //delete page by publisher
                const deleteObjPublisher = logseq.settings.listPublisher;
                deleteObjPublisher.forEach(function (value) {
                  logseq.Editor.deletePage(value);
                });
                //delete page by publisher
                const deleteObjAuthor = logseq.settings.listAuthor;
                deleteObjAuthor.forEach(function (value) {
                  logseq.Editor.deletePage(value);
                });
                logseq.Editor.deletePage(createContentTitle);
                logseq.updateSettings({ listTitle: "", listPublisher: "", listAuthor: "", jsonUrl: "", });//keep delete mode
              } finally {
                swal({
                  title: "削除がおわりました",
                  text: "'reindex'をおこなってください",
                });
              }
            } else {//Cancel
              //user cancel in dialog
              logseq.UI.showMsg("キャンセルしました", `warning`);
              logseq.updateSettings({ deleteMode: "OFF" });
              logseq.showSettingsUI();
            }
          })
          .finally(() => {
            logseq.hideMainUI();
          });
        //dialog end

      }
    } else if (settingJsonUrl !== "" && (logseq.settings.deleteMode !== "Delete" && logseq.settings.deleteMode === "Write" || logseq.settings.listTitle === "")) {
      /*
      create page start
      */

      const requestJsonUrl = "http://yu000jp.php.xdomain.jp/main/booklog/logseq/" + settingJsonUrl;
      const setTitleList = logseq.settings.listTitle;
      let dialogMessage;
      let dialogIcon;
      if (setTitleList) {
        dialogMessage = "書籍ページをいったん削除して、もう一度作成します";
        dialogIcon = "warning";
      } else {
        dialogMessage = "書籍ページを作成します";
        dialogIcon = "info";
      }
      //dialog
      logseq.showMainUI();
      swal({
        title: "実行しますか?",
        text: dialogMessage,
        icon: dialogIcon,
        buttons: true,
      })
        .then((answer) => {

          if (answer) {//OK

            logseq.UI.showMsg("読み込んでいます\n処理が終わるまでお待ちください", `info`).then(() => {

              logseq.updateSettings({ deleteMode: "OFF" });

              /* JSON */
              const jsonImport = async (jsonUrl) => {
                await fetch(jsonUrl, {
                  method: 'GET',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                  }
                })
                  .then((response) => {
                    if (!response.ok) {
                      return "error";
                    }

                    const create = async () => {

                      try {
                        const jsonData = await response.json();

                        //タグで限定する
                        //if (logseq.settings.limitTags != "") {
                        //  var settingTagArray = logseq.settings.limitTags.split(',');
                        //} else {
                        //  var settingTagArray = "";
                        //}

                        //list up
                        const PageTitleList = [];
                        const pullDeleteList = [];
                        const PageTagsList = [];
                        const PageCategoryList = [];
                        const PageYearList = [];
                        const PageAuthorList = [];
                        const PagePublisherList = [];
                        const PageTypeList = [];
                        const pullAuthorList = [];


                        //foreach JSON
                        await jsonData.forEach(async function (item, index) {
                          if (item.title === undefined) {
                            return;
                          }
                          if (item.type === undefined) {
                            item.type = "本";
                          }
                          //ページ作成タイトル
                          item.title = item.type + "/" + item.title;
                          PageTitleList.push("[[" + item.title + "]]\n");
                          pullDeleteList.push(item.title);
                          if (item.tags !== undefined) {
                            const tagList = item.tags.split(',');
                            tagList.forEach(function (value) {
                              PageTagsList.push("[[" + value + "]]\n");
                            });
                          }
                          if (item.category !== undefined) {
                            PageCategoryList.push("[[" + item.category + "]]\n");
                            item.category = "[[" + item.category + "]]";
                          }
                          if (item.year !== undefined) {
                            PageYearList.push(item.year);//later sort
                            item.year = "[[" + item.year + "]]";
                          }

                          if (item.author !== undefined) {
                            PageAuthorList.push("[[" + item.author + "]]\n");
                            pullAuthorList.push(item.author);
                            item.author = "[[" + item.author + "]]";
                          }
                          if (item.publisher !== undefined) {
                            PagePublisherList.push(item.publisher);
                            item.publisher = "[[出版社/" + item.publisher + "]]";
                          }
                          if (item.type !== undefined) {
                            PageTypeList.push("[[" + item.type + "]]\n");
                            item.type = "[[" + item.type + "]]";
                          }
                          if (item.end !== undefined) {
                            item.end = "[[" + item.end + "]]";
                          }

                          const obj = item;//オブジェクトを代入して削除できるようにする

                          //タグで限定する
                          //const itemTagsArray = item.tags.split(',');
                          //if (logseq.settings.limitTags !== "" && getIsDuplicate(itemTagsArray, settingTagArray) !== "") {
                          if (item.content !== undefined) {
                            var ItemContent = item.content;
                            delete obj.content;
                          }
                          if (item.review !== undefined) {
                            var ItemReview = "(レビュー)\n#+BEGIN_QUOTE\n" + item.review + "\n#+END_QUOTE";
                            delete obj.review;
                          }
                          if (item.memo !== undefined) {
                            var ItemMemo = "(メモ)\n#+BEGIN_QUOTE\n" + item.memo + "\n#+END_QUOTE";
                            delete obj.memo;
                          }
                          if (setTitleList.includes(item.title)) {
                            //すでにタイトルページが存在する場合
                            await logseq.Editor.deletePage(item.title);
                          }
                          //新規作成
                          //create page
                          await logseq.Editor.createPage(item.title, obj, {
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


                          //} else {
                          //  タグに当てはまらないケース(作成しない)
                          //  console.log(`Non-create(limit tags): ` + createPageTitle);
                          //}

                        });//foreach done

                        //listUp
                        logseq.Editor.deletePage(createContentTitle);
                        //create page publisher
                        logseq.Editor.createPage("出版社", {
                          createFirstBlock: true,
                          format: "markdown",
                          redirect: false,
                          tags: "本",
                        });
                        /* todayDateInUserFormat Sample */
                        const userConfigs = await logseq.App.getUserConfigs();
                        const preferredDateFormat = userConfigs.preferredDateFormat;
                        const today = new Date();
                        const todayDateInUserFormat = getDateForPage(today, preferredDateFormat);

                        //create content page
                        const blockInPage = await logseq.Editor.appendBlockInPage(createContentTitle, todayDateInUserFormat + "リスト更新", { parent: "本,読書", redirect: true });
                        logseq.Editor.insertBlock(blockInPage.uuid, "タイトルリスト\n" + PageTitleList);
                        logseq.Editor.insertBlock(blockInPage.uuid, "タグ一覧\n" + [...(new Set(PageTagsList))]);
                        logseq.Editor.insertBlock(blockInPage.uuid, "カテゴリー\n" + [...(new Set(PageCategoryList))]);
                        //sort year
                        PageYearList.sort(function (first, second) {
                          return first - second;
                        });
                        PageYearList.forEach((value, index) => {
                          PageYearList[index] = " [[" + value + "]] ";
                        });
                        logseq.Editor.insertBlock(blockInPage.uuid, "発行年\n" + [...(new Set(PageYearList))]);
                        logseq.Editor.insertBlock(blockInPage.uuid, "著者\n" + [...(new Set(PageAuthorList))]);
                        const pullPublisherList = [];
                        PagePublisherList.forEach((value, index) => {
                          PagePublisherList[index] = "[" + value + "](出版社/" + value + ")\n";
                          pullPublisherList.push("出版社/" + value);
                        });
                        logseq.Editor.insertBlock(blockInPage.uuid, "出版社\n" + [...(new Set(PagePublisherList))]);
                        logseq.Editor.insertBlock(blockInPage.uuid, "種別\n" + [...(new Set(PageTypeList))]);

                        logseq.updateSettings({ listTitle: pullDeleteList, listPublisher: pullPublisherList, listAuthor: pullAuthorList });

                      } finally {
                        logseq.showMainUI();
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
                        })
                          .then(() => {
                            logseq.App.pushState('page', { name: createContentTitle });
                            logseq.hideMainUI();
                          });
                      }
                    };
                    create();
                  })
                  .catch((reason) => {
                    logseq.UI.showMsg("ERROR: ファイルkeyを確認してください", `error`, {
                      timeout: 6000,
                    });
                  });
              };
              jsonImport(requestJsonUrl);
            });

          } else {//Cancel
            //user cancel in dialog
            logseq.UI.showMsg("キャンセルしました", `warning`);
            logseq.updateSettings({ deleteMode: "OFF" });
            logseq.showSettingsUI();
          }
        })
        .finally(() => {
          logseq.hideMainUI();
        });
      //dialog end


    } else {
      if (settingJsonUrl === "") {

        logseq.showMainUI();
        swal("OKボタンを押すと、ブラウザに2つのページが開きます。\n\nブクログのエクスポート画面( *ログインが必要です )からファイルをダウンロードしてください。\n\nその次に、変換サイトにアップロードします。そこでファイルkeyをコピーをして、Logseqの画面で貼り付けてください").then(() => {
          setTimeout(function () {
            logseq.App.openExternalLink('http://yu000jp.php.xdomain.jp/main/booklog/logseq/');
            logseq.App.openExternalLink('https://booklog.jp/export');
          }, 100);
          swal({
            text: "ファイルkeyをここに貼り付けてください",
            content: "input",
          }).then((value) => {
            logseq.updateSettings({ jsonUrl: value });
            swal("このあとツールバーの📚ボタンを押すとインポートが実行され、書籍ページが作成されます").then(() => {
              logseq.updateSettings({ deleteMode: "Write" });
              logseq.hideMainUI();
            });
          });
        });
      } else {
        logseq.App.pushState('page', { name: createContentTitle });
        logseq.UI.showMsg("すでに作成されています");
        logseq.updateSettings({ deleteMode: "OFF" });
        logseq.showSettingsUI();
      }

    }

  }
};

logseq.ready(model, main).catch(console.error);
